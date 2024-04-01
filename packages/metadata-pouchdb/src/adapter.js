/**
 * Содержит методы и подписки на события PouchDB
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2022
 * @module common
 * @submodule pouchdb
 */

/**
 * ### PouchDB для хранения данных в idb браузера и синхронизации с CouchDB
 */

import PouchDB from './pouchdb';


function adapter({AbstracrAdapter}) {

  const fieldsToDelete = '_id,search,timestamp'.split(',');

  /**
   * ### Интерфейс локальной и сетевой баз данных PouchDB
   * Содержит абстрактные методы методы и подписки на события PouchDB, отвечает за авторизацию, синхронизацию и доступ к данным в IndexedDB и на сервере
   *
   * @class AdapterPouch
   * @static
   * @menuorder 34
   * @tooltip Данные pouchdb
   */
  return class AdapterPouch extends AbstracrAdapter {

    constructor($p) {

      super($p);

      this.props = {
        _data_loaded: false,
        _doc_ram_loading: false,
        _doc_ram_loaded: false,
        _auth: null,
        _suffix: '',
        _user: '',
        _push_only: false,
        branch: null,
      };

      /**
       * ### Локальные базы PouchDB
       *
       * @property local
       * @type {{ram: PouchDB, doc: PouchDB, meta: PouchDB, sync: {}}}
       */
      this.local = {_loading: false, sync: {}};

      /**
       * ### Базы PouchDB на сервере
       *
       * @property remote
       * @type {{ram: PouchDB, doc: PouchDB}}
       */
      this.remote = {};

      this.fetch = this.fetch.bind(this);

    }

    /**
     * Инициализация адаптера
     * @param wsql
     * @param job_prm
     */
    init(wsql, job_prm) {

      const {props, local, remote, fetch, $p: {md}} = this;

      // настриваем параметры
      Object.assign(props, {
        path: wsql.get_user_param('couch_path', 'string') || job_prm.couch_path || '',
        zone: wsql.get_user_param('zone', 'number'),
        prefix: job_prm.local_storage_prefix,
        direct: wsql.get_user_param('zone', 'number') == job_prm.zone_demo ? false :
          (job_prm.hasOwnProperty('couch_direct') ? job_prm.couch_direct : wsql.get_user_param('couch_direct', 'boolean')),
        user_node: job_prm.user_node,
        noreplicate: job_prm.noreplicate,
        autologin: job_prm.autologin || [],
      });
      if(props.path && props.path.indexOf('http') != 0 && typeof location != 'undefined') {
        props.path = `${location.protocol}//${location.host}${props.path}`;
      }
      if(job_prm.use_meta === false) {
        props.use_meta = false;
      }
      if(job_prm.use_ram === false) {
        props.use_ram = false;
      }
      if(props.user_node && props.user_node.suffix) {
        props._suffix = props.user_node.suffix;
      }

      // создаём локальные базы
      const opts = {auto_compaction: true, revs_limit: 3, owner: this, fetch};
      const bases = md.bases();

      // если используется meta, вместе с локальной создаём удалённую, т.к. для неё не нужна авторизация
      if(props.use_meta !== false) {
        local.meta = new PouchDB(props.prefix + 'meta', opts);
        if(props.path) {
          remote.meta = new PouchDB(props.path + 'meta', {skip_setup: true, owner: this, fetch});
          setTimeout(() => this.run_sync('meta'));
        }
      }

      const pbases = ['doc', 'user'];
      if(props.use_ram !== false) {
        pbases.push('ram');
      }

      for (const name of pbases) {
        if(bases.indexOf(name) != -1) {
          // в Node, локальные базы - это алиасы удалённых
          // если direct, то все базы, кроме ram, так же - удалённые
          Object.defineProperty(local, name, {
            get() {
              const dynamic_doc = wsql.get_user_param('dynamic_doc');
              if(dynamic_doc && name === 'doc' && props.direct) {
                return remote[dynamic_doc];
              }
              else {
                return local[`__${name}`] || remote[name];
              }
            }
          });

          if(job_prm.couch_memory && job_prm.couch_memory.includes(name)) {
            local[`__${name}`] = new PouchDB(props.prefix + props.zone + '_' + name, Object.assign({adapter: 'memory'}, opts));
          }
          else if(props.user_node || (props.direct && name != 'ram' && name != 'user')) {
            local[`__${name}`] = null;
          }
          else {
            local[`__${name}`] = new PouchDB(props.prefix + props.zone + '_' + name, opts);
          }
        }
      }

      // В штатном режиме, серверную базу ram создаём сразу
      // superlogin переопределяет метод after_init и создаёт базы после авторизации
      this.after_init( props.user_node ? bases : (props.autologin.length ? props.autologin : ['ram']));

    }

    /**
     * В штатном режиме (без суперлогина), серверные базы создаём сразу
     */
    after_init(bases, auth) {

      const {props, remote, fetch, $p: {md, wsql}} = this;
      const opts = {skip_setup: true, adapter: 'http', owner: this, fetch};

      if(auth) {
        opts.auth = auth;
      }
      else if(props.user_node) {
        opts.auth = props.user_node;
      }

      (bases || md.bases()).forEach((name) => {
        if((!auth && remote[name]) ||
          name.match(/(e1cib|github|user)/) ||
          (name === 'ram' && props.use_ram === false) ||
          (name === 'pgsql')) {
          return;
        }
        remote[name] = new PouchDB(this.dbpath(name), opts);
      });
    }

    /**
     * запускает репликацию
     */
    after_log_in() {

      const {props, local, remote, $p: {md, wsql}} = this;
      const run_sync = [];

      md.bases().forEach((dbid) => {
        if(dbid !== 'meta' &&
          local[dbid] && remote[dbid] && local[dbid] != remote[dbid] &&
          (dbid !== 'doc' || !wsql.get_user_param('dynamic_doc'))
        ) {
          if(props.noreplicate && props.noreplicate.includes(dbid)) {
            return;
          }
          run_sync.push(this.run_sync(dbid));
        }
      });

      return Promise.all(run_sync)
        .then(() => {
          // широковещательное оповещение об окончании загрузки локальных данных
          if(props.use_ram === false) {
            ;
          }
          else if(local._loading) {
            return new Promise((resolve) => {
              this.once('pouch_data_loaded', resolve);
            });
          }
          else if(!props.user_node) {
            return this.call_data_loaded();
          }
        });
    }

    /**
     * ### Выполняет авторизацию и запускает репликацию
     * @method log_in
     * @param username {String}
     * @param password {String}
     * @return {Promise}
     */
    log_in(username, password) {
      const {props, remote, $p} = this;
      const {job_prm, wsql, aes, md} = $p;

      // реквизиты гостевого пользователя для демобаз
      if(username == undefined && password == undefined) {
        if(job_prm.guests && job_prm.guests.length) {
          username = job_prm.guests[0].username;
          password = aes.Ctr.decrypt(job_prm.guests[0].password);
        }
        else {
          const err = new Error('empty login or password');
          this.emit('user_log_fault', err);
          return Promise.reject(err);
        }
      }
      else if(!username || !password){
        const err = new Error('empty login or password');
        this.emit('user_log_fault', err);
        return Promise.reject(err);
      }

      // если уже авторизованы под тем же пользователем, выходим с успешным результатом
      if(props._auth) {
        if(props._auth.username == username) {
          return Promise.resolve();
        }
        else {
          const err = new Error('need logout first');
          this.emit('user_log_fault', err);
          return Promise.reject(err);
        }
      }

      // в node - мы уже авторизованы
      // браузере - авторизуемся и получаем info() во всех базах
      const bases = md.bases();
      let try_auth = (props.user_node || !remote.ram) ?
        Promise.resolve(true) :
        remote.ram.login(username, password)
          .then((user) => {
            if(user.ref && typeof user.roles === 'string') {
              // уточним зону
              if(user.zones && user.zones.length && !user.zones.includes(props.zone)) {
                if(typeof props.zone === 'string' && !isNaN(parseFloat(props.zone))) {
                  props.zone = parseFloat(props.zone);
                }
                if(!user.zones.includes(props.zone)) {
                  props.zone = user.zones[0];
                  wsql.set_user_param('zone', props.zone);
                }
              }
              this.emit('authenticated', user);
              props._suffix = user.suffix || '';
              props._user = user.ref;
              props._push_only = Boolean(user.push_only);
              if(user.direct && !props.direct && props.zone != job_prm.zone_demo) {
                props.direct = true;
                wsql.set_user_param('couch_direct', true);
              }
              if(user.su) {
                username = user.su;
              }
            }
            else {
              const {roles} = user;
              // установим суффикс базы отдела абонента
              const suffix = /^suffix:/;
              const ref = /^ref:/;

              // уточняем значения констант в соответствии с ролями пользователя
              roles.forEach((role) => {
                if(suffix.test(role)) {
                  props._suffix = role.substr(7);
                }
                else if(ref.test(role)) {
                  props._user = role.substr(4);
                }
                else if(role === 'direct' && !props.direct && props.zone != job_prm.zone_demo) {
                  props.direct = true;
                  wsql.set_user_param('couch_direct', true);
                }
                else if(role === 'push_only' && !props._push_only) {
                  props._push_only = true;
                }
              });
            }

            if(props._push_only && props.direct) {
              props.direct = false;
              wsql.set_user_param('couch_direct', false);
            }

            if(props._suffix) {
              while (props._suffix.length < 4) {
                props._suffix = '0' + props._suffix;
              }
            }

            return true;
          })
          .catch((err) => {
            // если direct, вываливаемся с ошибкой
            if(props.direct) {
              throw err;
            }
            // ожидаем текущего пользователя из ram
            return new Promise((resolve, reject) => {
              let count = 0;
              function props_by_user() {
                setTimeout(() => {
                  const {current_user} = $p;
                  if(current_user) {
                    if(current_user.push_only) {
                      props._push_only = true;
                    }
                    if(current_user.suffix) {
                      props._suffix = current_user.suffix;
                      while (props._suffix.length < 4) {
                        props._suffix = '0' + props._suffix;
                      }
                    }
                    resolve();
                  }
                  else {
                    if(count > 4) {
                      return reject();
                    }
                    count++;
                    props_by_user();
                  }
                }, 100 + count * 500);
              }
              props_by_user();
            });
          });

      if(!props.user_node) {
        try_auth = try_auth
          .then((ram_logged_in) => {
            ram_logged_in && this.after_init(bases, {username, password});
            return ram_logged_in;
          })
          .then((ram_logged_in) => {
            let postlogin = Promise.resolve(ram_logged_in);
            if(!props.user_node) {
              bases.forEach((dbid) => {
                if(dbid !== 'meta' && dbid !== 'ram' && remote[dbid]) {
                  postlogin = postlogin
                    .then((ram_logged_in) => ram_logged_in && remote[dbid].info());
                }
              });
            }
            return postlogin;
          });
      }

      return try_auth.then((info) => {

        props._auth = {username};

        // сохраняем имя пользователя в localstorage
        if(wsql.get_user_param('user_name') != username) {
          wsql.set_user_param('user_name', username);
        }

        // если настроено сохранение пароля - сохраняем и его
        if(info) {
          if(wsql.get_user_param('enable_save_pwd')) {
            if(aes.Ctr.decrypt(wsql.get_user_param('user_pwd')) != password) {
              wsql.set_user_param('user_pwd', aes.Ctr.encrypt(password));   // сохраняем имя пользователя в базе
            }
          }
          else if(wsql.get_user_param('user_pwd') != '') {
            wsql.set_user_param('user_pwd', '');
          }

          // излучаем событие
          this.emit('user_log_in', username);
        }
        else {
          this.emit('user_log_stop', username);
        }
        // врезаем асинхронную подписку на событие
        return this.emit_promise('on_log_in', username).then(() => info);

      })
        .then((info) => {
          if(props._data_loaded && !props._doc_ram_loading) {
            if(props._doc_ram_loaded) {
              this.emit('pouch_doc_ram_loaded');
            }
            else {
              this.load_doc_ram();
            }
          }
          // запускаем синхронизацию для нужных баз
          return info && this.after_log_in();
        })
        .catch(err => {
          // излучаем событие
          this.emit('user_log_fault', err);
        });
    }

    /**
     * ### Останавливает синхронизацию и снимает признак авторизованности
     * @method log_out
     */
    log_out() {
      const {props, local, remote, fetch, authorized, $p: {md}} = this;

      return Promise.all(md.bases().map((name) => {
        if(name != 'meta' && remote[name]) {
          let res = remote[name].logout && remote[name].logout();
          if(name != 'ram') {
            const dbpath = AdapterPouch.prototype.dbpath.call(this, name);
            if(remote[name].name !== dbpath) {
              const sub = remote[name].close()
                .then(() => {
                  remote[name].removeAllListeners();
                  if(props.autologin.indexOf(name) === -1) {
                    remote[name] = null;
                  }
                  else {
                    remote[name] = new PouchDB(dbpath, {skip_setup: true, adapter: 'http', owner: this, fetch});
                  }
                });
              res = res ? res.then(() => sub) : sub;
            }
          }
          return res;
        }
      }))
        .then(() => {
          if(authorized) {
            for (const name in local.sync) {
              if(name != 'meta' && props.autologin.indexOf(name) === -1) {
                try {
                  local.sync[name].removeAllListeners();
                  local.sync[name].cancel();
                  local.sync[name] = null;
                }
                catch (err) {
                }
              }
            }
            props._auth = null;
          }
          props._user = '';
          this.emit('user_log_out');
        });
    }

    auth_prefix() {
      switch (this.props._auth_provider) {
      case 'google':
          return 'Google ';
      case 'ldap':
        return 'LDAP ';
      case 'github':
        return 'Github ';
      case 'vkontakte':
        return 'Vkontakte ';
      case 'facebook':
        return 'Facebook ';
      default:
        return 'Basic ';
      }
    }

    /**
     * ### Загружает условно-постоянные данные в alasql
     * @param db - по умолчанию, грузим из local.ram, но можно переопределить
     * @return {Promise<never>|Promise<any>}
     */
    load_data(db) {

      const {local, $p: {job_prm}} = this;
      const options = {
        limit: 700,
        include_docs: true,
      };
      const _page = {
        total_rows: 0,
        limit: options.limit,
        page: 0,
        start: Date.now(),
      };

      if(job_prm.second_instance) {
        return Promise.reject(new Error('second_instance'));
      }

      if(!db) {
        db = local.ram;
      }

      // бежим по всем документам из ram
      return new Promise((resolve, reject) => {

        let index;

        const processPage = (err, response) => {
          if(response) {
            // широковещательное оповещение о загрузке порции локальных данных
            _page.page++;
            _page.total_rows = response.total_rows;

            this.emit('pouch_data_page', Object.assign({}, _page));

            if(this.load_changes(response, options)) {
              fetchNextPage();
            }
            // широковещательное оповещение об окончании загрузки локальных данных
            else {
              local._loading = false;
              this.call_data_loaded(_page);
              resolve();
            }
          }
          else if(err) {
            reject(err);
            // широковещательное оповещение об ошибке загрузки
            this.emit('pouch_data_error', 'ram', err);
          }
        }

        const fetchNextPage = () => {
          if(index){
            db.query('server/load_order', options, processPage);
          }
          else {
            db.allDocs(options, processPage);
          }
        };

        db.get('_design/server')
          .catch((err) => {
            if(err.status === 404) {
              return {views: {}}
            }
            else {
              reject(err);
            }
          })
          .then((design) => {
            if(design) {
              const {views} = design;
              if(views.load_order){
                index = true;
              }
              return (Object.keys(views).length ? this.rebuild_indexes('ram') : Promise.resolve())
                .then(() => db.info());
            }
          })
          .then((info) => {
            if(info) {
              if(info.doc_count >= (job_prm.pouch_ram_doc_count || 10)) {
                // широковещательное оповещение о начале загрузки локальных данных
                this.emit('pouch_load_start', Object.assign(_page, {local_rows: info.doc_count}));
                local._loading = true;
                fetchNextPage();
              }
              else {
                this.emit('pouch_no_data', info);
                resolve();
              }
            }
        });
      });

    }

    /**
     * ### Путь к базе couchdb
     * внешние плагины, например, superlogin, могут переопределить этот метод
     * @param name
     * @return {*}
     */
    dbpath(name) {
      const {props: {path, zone, _suffix}, $p: {wsql, job_prm}} = this;
      if(name == 'meta') {
        return path + 'meta';
      }
      else if(name == 'ram') {
        return path + zone + '_ram';
      }
      else if(name === 'pgsql') {
        return (job_prm.pg_path?.startsWith('/') && !wsql.alasql.utils.isNode ? location.origin + job_prm.pg_path : job_prm.pg_path) + zone;
      }
      else {
        return path + zone + '_' + name + (_suffix ? '_' + _suffix : '');
      }
    }

    /**
     * Возвращает базу PouchDB, связанную с объектами данного менеджера
     * @method db
     * @param _mgr {DataManager}
     * @return {PouchDB}
     */
    db(_mgr) {
      const dbid = _mgr.cachable.replace('_remote', '').replace('_ram', '').replace('_doc', '');
      const {props, local, remote} = this;
      if(dbid.indexOf('remote') != -1 || dbid === 'pgsql' || (props.noreplicate && props.noreplicate.includes(dbid))) {
        return remote[dbid.replace('_remote', '')];
      }
      else {
        return local[dbid] || remote[dbid] || local.user;
      }
    }

    /**
     * Интервал опроса при live-репликации
     * @param delay
     * @return {number}
     */
    back_off (delay) {
      if (!delay) {
        return 1000 + Math.floor(Math.random() * 2000);
      }
      else if (delay >= 200000) {
        return 200000;
      }
      return delay * 3;
    }

    /**
     * ### Запускает процесс синхронизвации
     *
     * @method run_sync
     * @param local {PouchDB}
     * @param remote {PouchDB}
     * @param id {String}
     * @return {Promise}
     */
    run_sync(id) {

      const {local, remote, $p: {wsql, job_prm, record_log}, props} = this;

      // если синхронизация для данной базы уже запущена, выходим
      if(local.sync[id]) {
        return Promise.resolve(id);
      }

      const {_push_only, _user} = props;
      const db_local = local[id];
      const db_remote = remote[id];
      let linfo, _page;

      return db_local.info()
        .then((info) => {
          linfo = info;
          return db_remote.info();
        })
        .then((rinfo) => {

          // для базы "ram", сервер мог указать тотальную перезагрузку данных
          // в этом случае - очищаем базы и перезапускаем браузер
          if(id == 'ram') {
            return db_remote.get('data_version')
              .then((v) => {
                if(v.version != wsql.get_user_param('couch_ram_data_version')) {
                  // если это не первый запуск - перезагружаем
                  if(wsql.get_user_param('couch_ram_data_version')) {
                    rinfo = this.reset_local_data();
                  }
                  // сохраняем версию в localStorage
                  wsql.set_user_param('couch_ram_data_version', v.version);
                }
                return rinfo;
              })
              .catch(record_log)
              .then(() => rinfo);
          }

          return rinfo;
        })
        .then((rinfo) => {

          if(!rinfo) {
            return;
          }

          // репликация больших данных
          if(!_push_only && rinfo.data_size > (job_prm.data_size_sync_limit || 2e8)) {
            this.emit('pouch_sync_error', id, {data_size: rinfo.data_size});
            props.direct = true;
            wsql.set_user_param('couch_direct', true);
            return;
          }

          if(id == 'ram' && linfo.doc_count < (job_prm.pouch_ram_doc_count || 10)) {
            // широковещательное оповещение о начале загрузки локальных данных
            _page = {
              total_rows: rinfo.doc_count,
              local_rows: linfo.doc_count,
              docs_written: 0,
              limit: 300,
              page: 0,
              start: Date.now(),
            };
            this.emit('pouch_load_start', _page);
          }

          return new Promise((resolve) => {

            const options = {
              batch_size: 200,
              batches_limit: 3,
              heartbeat: 20000,
              retry: true,
            };

            // если указан клиентский или серверный фильтр - подключаем
            if(job_prm.pouch_filter && job_prm.pouch_filter[id]) {
              options.filter = job_prm.pouch_filter[id];
            }
            // если для базы meta фильтр не задан, используем умолчание
            else if(id == 'meta') {
              options.filter = 'auth/meta';
            }

            const final_sync = (options) => {

              options.back_off_function = this.back_off;

              // ram и meta синхронизируем в одну сторону, doc в демо-режиме, так же, в одну сторону
              if(id == 'ram' || id == 'meta' || props.zone == job_prm.zone_demo) {
                options.live = true;
                local.sync[id] = sync_events(db_local.replicate.from(db_remote, options));
              }
              else if(_push_only) {
                options.live = true;
                if(options.filter) {
                  delete options.filter;
                  delete options.query_params;
                }
                local.sync[id] = sync_events(db_local.replicate.to(db_remote, Object.assign({}, options, {batch_size: 50})));
              }
              else {
                options.live = true;
                local.sync[id] = sync_events(db_local.sync(db_remote, options));
              }
            }

            const sync_events = (sync, options) => {

              sync.on('change', (change) => {
                if(change.pending > 10) {
                  change.db = id;
                  this.emit_async('repl_state', change);
                }

                change.update_only = id !== 'ram';
                this.load_changes(change);

                this.emit('pouch_sync_data', id, change);
              })
                .on('denied', (info) => {
                  // a document failed to replicate, e.g. due to permissions
                  this.emit('pouch_sync_denied', id, info);

                })
                .on('error', (err) => {
                  this.emit('pouch_sync_error', id, err);
                })
                .on('complete', (info) => {

                  sync.cancel();
                  sync.removeAllListeners();

                  if(options) {

                    // handle complete
                    info.db = id;
                    this.emit_async('repl_state', info);

                    final_sync(options);
                    this.rebuild_indexes(id)
                      .then(() => resolve(id));
                  }
                });

              if(id == 'ram') {
                sync
                  // replication was paused, usually because of a lost connection
                  .on('paused', (info) => this.emit('pouch_sync_paused', id, info))
                  // replication was resumed
                  .on('active', (info) => this.emit('pouch_sync_resumed', id, info));
              }

              return sync;
            };

            if(_push_only && !options.filter && id !== 'ram' && id !== 'meta') {
              options.filter = 'auth/push_only';
              options.query_params = {user: _user};
            }

            sync_events(db_local.replicate.from(db_remote, options), options);

          });

        });
    }

    /**
     * ### Перестраивает индексы
     * Обычно, вызывается после начальной синхронизации
     * @param id {String}
     * @return {Promise}
     */
    rebuild_indexes(id, silent) {
      const {local, remote} = this;
      const msg = {db: id, ok: true, docs_read: 0, pending: 0, start_time: new Date().toJSON()}
      let promises = Promise.resolve();
      return local[id] === remote[id] ?
        Promise.resolve() :
        local[id].allDocs({
          include_docs: true,
          startkey: '_design/',
          endkey : '_design/\u0fff',
          limit: 1000,
        })
          .then(({rows}) => {
            for(const {doc} of rows) {
              if(doc._id.indexOf('/server') !== -1 && id !== 'ram') {
                continue;
              }
              if(doc.views) {
                for(const name in doc.views) {
                  const view = doc.views[name];
                  const index = doc._id.replace('_design/', '') + '/' + name;
                  if(doc.language === 'javascript') {
                    promises = promises.then(() => {
                      if(silent) {
                        this.emit('rebuild_indexes', {id, index, start: true});
                      }
                      else {
                        msg.index = index;
                        this.emit('repl_state', msg);
                      }
                      return local[id].query(index, {limit: 1}).catch(() => null);
                    });
                  }
                  else {
                    const selector = {
                      //use_index: index,
                      limit: 1,
                      fields: ['_id'],
                      selector: {},
                      use_index: index.split('/'),
                    };
                    for(const fld of view.options.def.fields) {
                      selector.selector[fld] = '';
                    }
                    promises = promises.then(() => {
                      if(silent) {
                        this.emit('rebuild_indexes', {id, index, start: true});
                      }
                      else {
                        msg.index = index;
                        this.emit('repl_state', msg);
                      }
                      return local[id].find(selector).catch(() => null);
                    });
                  }
                }
              }
            }
            return promises.then(() => {
              msg.index = '';
              msg.end_time = new Date().toJSON();
              this.emit('repl_state', msg);
              this.emit('rebuild_indexes', {id, start: false, finish: true});
            });
          });

    }

    /**
     * ### Информирует о загруженности данных
     * если к этому моменту мы уже авторизованы, запускает load_doc_ram
     *
     * @method call_data_loaded
     */
    call_data_loaded(page) {
      const {local, props} = this;
      if(!props._data_loaded) {
        props._data_loaded = true;
        if(!page) {
          page = local.sync._page || {};
        }
        if(!local.sync._page) {
          local.sync._page = page;
        }
        // информируем мир о загруженности данных
        Promise.resolve().then(() => {
          this.emit(page.note = 'pouch_data_loaded', page);
          // пытаемся загрузить doc_ram
          this.authorized && this.load_doc_ram();
        });
      }
      else if(!props._doc_ram_loaded && !props._doc_ram_loading && this.authorized) {
        this.load_doc_ram();
      }
    }

    /**
     * ### Уничтожает локальные данные
     * Используется при изменении структуры данных на сервере
     *
     * @method reset_local_data
     */
    reset_local_data() {
      const {local, remote} = this;
      const do_reload = () => {
        setTimeout(() => typeof location != 'undefined' && location.reload(true), 1000);
      };

      return this.log_out()
        .then(() => {
          return local.ram && remote.ram != local.ram && local.ram.destroy()
        })
        .then(() => {
          return local.doc && remote.doc != local.doc && local.doc.destroy()
        })
        .then(do_reload)
        .catch(do_reload);
    }

    /**
     * ### Читает объект из pouchdb
     *
     * @method load_obj
     * @param tObj {DataObj} - объект данных, который необходимо прочитать - дозаполнить
     * @param attr {Object} - ополнительные параметры, например, db - прочитать из другой базы
     * @return {Promise.<DataObj>} - промис с загруженным объектом
     */
    load_obj(tObj, attr) {

      // нас могли попросить прочитать объект не из родной базы менеджера, а из любой другой
      const db = (attr && attr.db) || this.db(tObj._manager);

      if(!db) {
        return Promise.resolve(tObj);
      }

      return db.get(tObj._manager.class_name + '|' + tObj.ref)
        .then((res) => {
          for(const fld of fieldsToDelete) {
            delete res[fld];
          }
          tObj._data._loading = true;
          tObj._mixin(res);
          tObj._obj._rev = res._rev;
        })
        .catch((err) => {
          if(err.status != 404) {
            throw err;
          }
          else {
            //console.log(db.name + '/' + tObj._manager.class_name + '|' + tObj.ref);
          }
        })
        .then(() => {
          return tObj;
        });
    }

    /**
     * ### Записывает объект в pouchdb
     *
     * @method save_obj
     * @param tObj {DataObj} - записываемый объект
     * @param attr {Object} - ополнительные параметры записи
     * @return {Promise.<DataObj>} - промис с записанным объектом
     */
    save_obj(tObj, attr) {

      const {_manager, _obj, _data, ref, class_name} = tObj;
      const {check_rev, hashable, grouping} = _manager.metadata();

      // нас могли попросить записать объект не в родную базу менеджера, а в любую другую
      const db = attr.db || this.db(_manager);

      if(!_data || (_data._saving && !_data._modified) || !db) {
        return Promise.resolve(tObj);
      }

      // TODO: опасное место с гонками при одновременной записи
      if(_data._saving && _data._modified) {
        _data._saving++;
        if(_data._saving > 10) {
          return Promise.reject(new Error(`Циклическая перезапись`));
        }
        return new Promise((resolve) => {
          setTimeout(() => resolve(this.save_obj(tObj, attr)), 200);
        });
      }

      _data._saving = 1;
      
      // формируем _id и подмешиваем class_name
      const {utils, wsql} = this.$p;
      const tmp = Object.assign({_id: `${class_name}|${ref}`, class_name}, utils._clone(_obj, true));

      // формируем строку поиска
      if(utils.is_doc_obj(tObj) || _manager.build_search) {
        if(_manager.build_search) {
          _manager.build_search(tmp, tObj);
        }
        else {
          tmp.search = ((_obj.number_doc || '') + (_obj.note ? ' ' + _obj.note : '')).toLowerCase();
        }
      }

      // установим timestamp
      tmp.timestamp = {
        user: this.authorized || wsql.get_user_param('user_name'),
        moment: utils.moment().format('YYYY-MM-DDTHH:mm:ss ZZ'),
      };

      if(attr.attachments) {
        tmp._attachments = attr.attachments;
      }

      // сохраняем с учетом grouping метаданных
      if(grouping === 'array') {
        delete tmp._id;
        delete tmp.class_name;
        const index = Math.floor(utils.crc32(tmp.ref) / 268435455);
        const _id = `${class_name}|${index.pad()}`;
        return db.get(_id)
          .catch((err) => {
            if(err.status !== 404) throw err;
            return {_id, class_name, rows: []};
          })
          .then((doc) => {
            let finded;
            for(const row of doc.rows) {
              if(row.ref === tmp.ref) {
                Object.assign(row, tmp);
                finded = true;
                break;
              }
            }
            if(!finded) {
              doc.rows.push(tmp);
            }
            return db.put(doc);
          })
          .then(() => {
            tObj.is_new() && tObj._set_loaded(tObj.ref);
            return tObj;
          });
      }
      else {
        delete tmp.ref;
        let skip_save = hashable;
        return (tObj.is_new() ? Promise.resolve(true) : db.get(tmp._id))
          .then((res) => {
            if(typeof res === 'object') {
              if(check_rev !== false && tmp._rev && tmp._rev !== res._rev) {
                const {timestamp} = res;
                const err = new Error(`Объект ${timestamp && typeof timestamp.user === 'string' ?
                  `изменил ${timestamp.user}<br/>${timestamp.moment}` : 'изменён другим пользователем'}`);
                err._rev = true;
                throw err;
              }
              tmp._rev = res._rev;
              for (let att in res._attachments) {
                if(!tmp._attachments) {
                  tmp._attachments = {};
                }
                if(!tmp._attachments[att]) {
                  tmp._attachments[att] = res._attachments[att];
                }
              }
            }
            return res;
          })
          .catch((err) => {
            if(err.status !== 404) throw err;
          })
          .then((res) => {
            // если в метаданных {hashable: true}, проверим hash - может, и не надо записывать
            if(hashable) {
              const hash = tObj._hash();
              if(typeof res !== 'object' || !res.timestamp || res.timestamp.hash !== hash) {
                tmp.timestamp.hash = hash;
                skip_save = false;
              }
            }
            return skip_save ? {ok: true, id: tmp._id, rev: tmp._rev} : db.put(tmp)
          })
          .then((res) => {
            if(res) {
              tObj.is_new() && tObj._set_loaded(tObj.ref);
              if(tmp._attachments) {
                if(!tObj._attachments) {
                  tObj._attachments = {};
                }
                for (let att in tmp._attachments) {
                  if(!tObj._attachments[att] || !tmp._attachments[att].stub) {
                    tObj._attachments[att] = tmp._attachments[att];
                  }
                }
              }
              _obj._rev = res.rev;
              return tObj;
            }
          });
      }
    }

    /**
     * ### Возвращает набор данных для дерева динсписка
     *
     * @method get_tree
     * @param _mgr {DataManager}
     * @param attr {Object}
     * @return {Promise.<Array>}
     */
    get_tree(_mgr, attr) {
      return this.find_rows(_mgr, {
        is_folder: true,
        _raw: true,
        _top: attr.count || 300,
        _skip: attr.start || 0
      })
        .then((rows) => {
          rows.sort((a, b) => {
            const {guid} = this.$p.utils.blank
            if(a.parent == guid && b.parent != guid) {
              return -1;
            }
            if(b.parent == guid && a.parent != guid) {
              return 1;
            }
            if(a.name < b.name) {
              return -1;
            }
            if(a.name > b.name) {
              return 1;
            }
            return 0;
          });
          return rows.map((row) => ({
            ref: row.ref,
            parent: row.parent,
            presentation: row.name
          }));
        })
        .then((ares) => this.$p.iface.data_to_tree.call(_mgr, ares, attr));
    }

    /**
     * ### Возвращает набор данных для динсписка
     *
     * @method get_selection
     * @param _mgr {DataManager}
     * @param attr
     * @return {Promise.<Array>}
     */
    get_selection(_mgr, attr) {
      const {classes} = this.$p;
      const cmd = attr.metadata || _mgr.metadata();
      const flds = ['ref', '_deleted']; // поля запроса
      const selection = {
        _raw: true,
        _total_count: true,
        _top: attr.count || 30,
        _skip: attr.start || 0,
      };   // условие см. find_rows()
      const ares = [];

      // набираем поля
      if(cmd.form && cmd.form.selection) {
        cmd.form.selection.fields.forEach((fld) => flds.push(fld));
      }
      else if(_mgr instanceof classes.DocManager) {
        flds.push('posted');
        flds.push('date');
        flds.push('number_doc');
      }
      else if(_mgr instanceof classes.TaskManager) {
        flds.push('name as presentation');
        flds.push('date');
        flds.push('number_doc');
        flds.push('completed');
      }
      else if(_mgr instanceof classes.BusinessProcessManager) {
        flds.push('date');
        flds.push('number_doc');
        flds.push('started');
        flds.push('finished');
      }
      else {
        if(cmd.hierarchical && cmd.group_hierarchy) {
          flds.push('is_folder');
        }
        else {
          flds.push('0 as is_folder');
        }

        if(cmd.main_presentation_name) {
          flds.push('name as presentation');
        }
        else {
          if(cmd.code_length) {
            flds.push('id as presentation');
          }
          else {
            flds.push('... as presentation');
          }
        }

        if(cmd.has_owners) {
          flds.push('owner');
        }

        if(cmd.code_length) {
          flds.push('id');
        }

      }

      // набираем условие
      // фильтр по дате
      if(_mgr.metadata('date') && (attr.date_from || attr.date_till)) {

        if(!attr.date_from) {
          attr.date_from = new Date('2017-01-01');
        }
        if(!attr.date_till) {
          attr.date_till = $p.utils.date_add_day(new Date(), 1);
        }

        selection.date = {between: [attr.date_from, attr.date_till]};
      }

      // фильтр по родителю
      if(cmd.hierarchical && attr.parent) {
        selection.parent = attr.parent;
      }

      // добавляем условия из attr.selection
      if(attr.selection) {
        if(Array.isArray(attr.selection)) {
          attr.selection.forEach((asel) => {
            for (const fld in asel) {
              if(fld[0] != '_' || fld == '_view' || fld == '_key') {
                selection[fld] = asel[fld];
              }
            }
          });
        }
        else {
          for (const fld in attr.selection) {
            if(fld[0] != '_' || fld == '_view' || fld == '_key') {
              selection[fld] = attr.selection[fld];
            }
          }
        }
      }

      // прибиваем фильтр по дате, если он встроен в ключ
      if(selection._key && selection._key._drop_date && selection.date) {
        delete selection.date;
      }

      // строковый фильтр по полям поиска, если он не описан в ключе
      if(attr.filter && (!selection._key || !selection._key._search)) {
        if(cmd.input_by_string.length == 1) {
          selection[cmd.input_by_string] = {like: attr.filter};
        }
        else {
          selection.or = [];
          cmd.input_by_string.forEach((ifld) => {
            const flt = {};
            flt[ifld] = {like: attr.filter};
            selection.or.push(flt);
          });
        }
      }

      // обратная сортировка по ключу, если есть признак сортировки в ключе и 'des' в атрибутах
      if(selection._key && selection._key._order_by) {
        selection._key._order_by = attr.direction;
      }

      // фильтр по владельцу
      //if(cmd["has_owners"] && attr.owner)
      //	selection.owner = attr.owner;

      return this.find_rows(_mgr, selection)
        .then((rows) => {

          if(rows.hasOwnProperty('_total_count') && rows.hasOwnProperty('rows')) {
            attr._total_count = rows._total_count;
            rows = rows.rows;
          }

          rows.forEach((doc) => {

            // наполняем
            const o = {};
            flds.forEach((fld) => {

              let fldsyn;

              if(fld == 'ref') {
                o[fld] = doc[fld];
                return;
              }
              else if(fld.indexOf(' as ') != -1) {
                fldsyn = fld.split(' as ')[1];
                fld = fld.split(' as ')[0].split('.');
                fld = fld[fld.length - 1];
              }
              else {
                fldsyn = fld;
              }

              const mf = _mgr.metadata(fld);
              if(mf) {
                if(mf.type.date_part) {
                  o[fldsyn] = $p.moment(doc[fld]).format($p.moment._masks[mf.type.date_part]);
                }
                else if(mf.type.is_ref) {
                  if(!doc[fld] || doc[fld] == $p.utils.blank.guid) {
                    o[fldsyn] = '';
                  }
                  else {
                    const mgr = _mgr.value_mgr(o, fld, mf.type, false, doc[fld]);
                    if(mgr) {
                      o[fldsyn] = mgr.get(doc[fld]).presentation;
                    }
                    else {
                      o[fldsyn] = '';
                    }
                  }
                }
                else if(typeof doc[fld] === 'number' && mf.type.fraction) {
                  o[fldsyn] = doc[fld].toFixed(mf.type.fraction);
                }
                else {
                  o[fldsyn] = doc[fld];
                }
              }
            });
            ares.push(o);
          });

          return $p.iface.data_to_grid.call(_mgr, ares, attr);
        })
        .catch($p.record_log);

    }

    /**
     * Загружает объекты из PouchDB по массиву ссылок
     *
     * @param {DataManager} [_mgr]
     * @param {Array} refs
     * @param {Boolean} [with_attachments]
     * @return {*}
     */
    load_array(_mgr, refs, with_attachments, db) {
      if(!refs || !refs.length) {
        return Promise.resolve(false);
      }
      if(!db && _mgr) {
        db = this.db(_mgr);
      }
      const options = {
        limit: refs.length + 1,
        include_docs: true,
        keys: _mgr ? refs.map((v) => _mgr.class_name + '|' + v) : refs,
      };
      if(with_attachments) {
        options.attachments = true;
        options.binary = true;
      }
      return db.allDocs(options).then((result) => this.load_changes(result, {}));
    }

    /**
     * Загружает объекты из PouchDB, обрезанные по view
     */
    load_view(_mgr, _view, options) {
      return new Promise((resolve, reject) => {

        const db = this.db(_mgr);
        if(!options) {
          options = {
            limit: 1000,
            include_docs: true,
            startkey: _mgr.class_name + '|',
            endkey: _mgr.class_name + '|\ufff0',
          };
        }

        function process_docs(err, result) {

          if(result) {

            if(result.rows.length) {

              options.startkey = result.rows[result.rows.length - 1].key;
              options.skip = 1;

              // наполняем
              _mgr.load_array(result.rows.map(({doc}) => {
                doc.ref = doc._id.split('|')[1];
                delete doc._id;
                return doc;
              }), true);

              if(result.rows.length < options.limit) {
                resolve();
              }
              else {
                db.query(_view, options, process_docs);
              }
            }
            else {
              resolve();
            }
          }
          else if(err && err.status !== 404) {
            reject(err);
          }
        }

        db.query(_view, options, process_docs);

      });
    }

    /**
     * ### Загружает объекты с типом кеширования doc_ram в ОЗУ
     * @method load_doc_ram
     */
    load_doc_ram() {
      const {local, props, $p: {md}} = this;
      if(!local.doc){
        return;
      }
      const res = [];
      const {_m} = md;

      // информируем мир о начале загрузки doc_ram
      this.emit('pouch_doc_ram_start');

      // ищем элементы с подходящим типом кеширования
      props._doc_ram_loading = true;
      ['cat', 'cch', 'ireg'].forEach((kind) => {
        for (const name in _m[kind]) {
          (_m[kind][name].cachable === 'doc_ram') && res.push(kind + '.' + name);
        }
      });

      const cpi = res.indexOf('cat.choice_params');
      if(cpi >= 0) {
        res.splice(cpi, 1);
        res.push('cat.choice_params');
      }

      return res.reduce((acc, name) => {
        return acc.then(() => {
          const opt = {
            include_docs: true,
            startkey: name + '|',
            endkey: name + '|\ufff0',
            limit: 10000,
          };
          const page = local.sync._page || {};
          const meta = md.get(name);
          this.emit('pouch_data_page', Object.assign(page, {synonym: meta.synonym}));
          return local[meta.cachable.replace(/_ram$/, '')].allDocs(opt).then((res) => {
            this.load_changes(res, opt);
          });
        });
      }, Promise.resolve())
        .catch((err) => {
          props._doc_ram_loading = false;
          this.emit('pouch_sync_error', 'doc', err);
          return {docs: []};
        })
        .then(() => {
          props._doc_ram_loading = false;
          props._doc_ram_loaded = true;
          this.emit('pouch_doc_ram_loaded');
        });
    }

    /**
     * ### Найти строки
     * Возвращает массив дата-объектов, обрезанный отбором _selection_<br />
     * Eсли отбор пустой, возвращаются все строки из PouchDB.
     *
     * @method find_rows
     * @param _mgr {DataManager}
     * @param selection {Object|function} - в ключах имена полей, в значениях значения фильтра или объект {like: "значение"} или {not: значение}
     * @param [selection._top] {Number}
     * @param [selection._skip] {Number}
     * @param [selection._raw] {Boolean} - если _истина_, возвращаются сырые данные, а не дата-объекты
     * @param [selection._total_count] {Boolean} - если _истина_, вычисляет общее число записей под фильтром, без учета _skip и _top
     * @return {Promise.<Array>}
     */
    find_rows(_mgr, selection, db) {

      if(!db) {
        db = this.db(_mgr);
      }

      // если базы не инициализированы, возвращаем пустой массив
      if(!db) {
        return Promise.resolve([]);
      }

      const err_handler = this.emit.bind(this, 'pouch_sync_error', _mgr.cachable);

      // если указан MangoQuery, выполняем его без лишних церемоний
      if(selection && selection._mango) {
        const sel = {};
        for(const fld in selection) {
          if(fld[0] !== '_') {
            sel[fld] = selection[fld];
          }
        }
        return db.find(sel)
          .then(({docs}) => {
            if(!docs) {
              docs = [];
            }
            for (const doc of docs) {
              doc.ref = doc._id.split('|')[1];
              if(!selection._raw){
                delete doc._id;
                delete doc.class_name;
              }
            }
            return selection._raw ? docs : _mgr.load_array(docs);
          })
          .catch((err) => {
            err_handler(err);
            return [];
          });
      }

      const {utils} = this.$p;
      const res = [];
      const options = {
        limit: 200,
        include_docs: true,
        startkey: _mgr.class_name + '|',
        endkey: _mgr.class_name + '|\ufff0',
      };
      let doc, _raw, _view, _total_count, top, calc_count, top_count = 0, skip = 0, skip_count = 0;

      if(selection) {

        if(selection._top) {
          top = selection._top;
          delete selection._top;
          if(top > 1000) {
            options.limit += 1000;
            calc_count = true;
          }
        }
        else {
          top = 300;
        }

        if(selection._raw) {
          _raw = selection._raw;
          delete selection._raw;
        }

        if(selection._total_count) {
          _total_count = selection._total_count;
          delete selection._total_count;
        }

        if(selection._view) {
          _view = selection._view;
          delete selection._view;
        }

        if(selection._key) {

          if(selection._key._order_by == 'des') {
            options.startkey = selection._key.endkey || selection._key + '\ufff0';
            options.endkey = selection._key.startkey || selection._key;
            options.descending = true;
          }
          else {
            options.startkey = selection._key.startkey || selection._key;
            options.endkey = selection._key.endkey || selection._key + '\ufff0';
          }
        }

        if(typeof selection._skip == 'number') {
          skip = selection._skip;
          delete selection._skip;
        }

        if(selection._attachments) {
          options.attachments = true;
          options.binary = true;
          delete selection._attachments;
        }
      }

      // если сказано посчитать все строки...
      if(_total_count) {

        calc_count = true;
        _total_count = 0;

        // если нет фильтра по строке или фильтр растворён в ключе
        if(Object.keys(selection).length <= 1) {

          // если фильтр в ключе, получаем все строки без документов
          if(selection._key && selection._key.hasOwnProperty('_search')) {
            options.include_docs = false;
            options.limit = 100000;

            return db.query(_view, options)
              .then((result) => {

                result.rows.forEach((row) => {

                  // фильтруем
                  if(!selection._key._search || row.key[row.key.length - 1].toLowerCase().indexOf(selection._key._search) != -1) {

                    _total_count++;

                    // пропукскаем лишние (skip) элементы
                    if(skip) {
                      skip_count++;
                      if(skip_count < skip) {
                        return;
                      }
                    }

                    // ограничиваем кол-во возвращаемых элементов
                    if(top) {
                      top_count++;
                      if(top_count > top) {
                        return;
                      }
                    }
                    res.push(row.id);
                  }
                });

                delete options.startkey;
                delete options.endkey;
                if(options.descending) {
                  delete options.descending;
                }
                options.keys = res;
                options.include_docs = true;

                return db.allDocs(options);

              })
              .catch((err) => {
                err_handler(err);
                return {rows: []};
              })
              .then((result) => {
                return {
                  rows: result.rows.map(({doc}) => {
                    doc.ref = doc._id.split('|')[1];
                    if(!_raw) {
                      delete doc._id;
                    }
                    return doc;
                  }),
                  _total_count: _total_count,
                };
              });
          }

        }

      }

      // бежим по всем документам из ram
      return new Promise((resolve, reject) => {

        function process_docs(result) {
          if(result && result.rows.length) {

            options.startkey = result.rows[result.rows.length - 1].key;
            options.skip = 1;

            result.rows.forEach((rev) => {
              doc = rev.doc;

              let key = doc._id.split('|');
              doc.ref = key[1];

              if(!_raw) {
                delete doc._id;
              }

              // фильтруем
              if(!utils._selection.call(_mgr, doc, selection)) {
                return;
              }

              if(calc_count) {
                _total_count++;
              }

              // пропукскаем лишние (skip) элементы
              if(skip) {
                skip_count++;
                if(skip_count < skip) {
                  return;
                }
              }

              // ограничиваем кол-во возвращаемых элементов
              if(top) {
                top_count++;
                if(top_count > top) {
                  return;
                }
              }

              // наполняем
              res.push(doc);
            });

            if((result.rows.length < options.limit) || top && top_count > top && !calc_count) {
              resolve(_raw ? res : _mgr.load_array(res));
            }
            else {
              fetch_next_page();
            }
          }
          else {
            if(calc_count) {
              resolve({
                rows: _raw ? res : _mgr.load_array(res),
                _total_count: _total_count,
              });
            }
            else {
              resolve(_raw ? res : _mgr.load_array(res));
            }
          }
        }

        function fetch_next_page() {
          (_view ? db.query(_view, options) : db.allDocs(options))
            .catch((err) => {
              err_handler(err);
              reject(err);
            })
            .then(process_docs);
        }

        fetch_next_page();
      });
    }

    /**
     * ### Сохраняет присоединенный файл
     *
     * @method save_attachment
     * @param _mgr {DataManager}
     * @param ref
     * @param att_id
     * @param attachment
     * @param type
     * @return {Promise}
     * @async
     */
    save_attachment(_mgr, ref, att_id, attachment, type) {

      if(!type) {
        type: 'text/plain'
      }

      if(!(attachment instanceof Blob)) {
        attachment = new Blob([attachment], {type});
      }

      // получаем ревизию документа
      let _rev,
        db = this.db(_mgr);

      ref = _mgr.class_name + '|' + this.$p.utils.fix_guid(ref);

      return db.get(ref)
        .then((res) => {
          if(res) {
            _rev = res._rev;
          }
        })
        .catch((err) => {
          if(err.status != 404) {
            throw err;
          }
        })
        .then(() => {
          return db.putAttachment(ref, att_id, _rev, attachment, type);
        });

    }

    /**
     * Получает присоединенный к объекту файл
     * @param _mgr {DataManager}
     * @param ref
     * @param att_id
     * @return {Promise}
     */
    get_attachment(_mgr, ref, att_id) {

      return this.db(_mgr).getAttachment(_mgr.class_name + '|' + this.$p.utils.fix_guid(ref), att_id);

    }

    /**
     * Удаляет присоединенный к объекту файл
     * @param _mgr {DataManager}
     * @param ref
     * @param att_id
     * @return {Promise}
     */
    delete_attachment(_mgr, ref, att_id) {

      // получаем ревизию документа
      let _rev,
        db = this.db(_mgr);

      ref = _mgr.class_name + '|' + this.$p.utils.fix_guid(ref);

      return db.get(ref)
        .then((res) => {
          if(res) {
            _rev = res._rev;
          }
        })
        .catch((err) => {
          if(err.status != 404) {
            throw err;
          }
        })
        .then(() => {
          return db.removeAttachment(ref, att_id, _rev);
        });
    }

    /**
     * ### Загружает в менеджер изменения или полученные через allDocs данные
     *
     * @method load_changes
     * @param changes
     * @param options
     * @return {boolean}
     */
    load_changes(changes, options) {

      let docs, doc, res = {}, cn, key, {$p} = this;

      if(!options) {
        if(changes.direction) {
          if(changes.direction != 'pull') {
            return;
          }
          docs = changes.change.docs;
        }
        else {
          docs = changes.docs;
        }
      }
      else {
        docs = changes.rows;
      }

      if(docs.length > 0) {
        if(options) {
          options.startkey = docs[docs.length - 1].key;
          options.skip = 1;
        }

        docs.forEach((rev) => {
          doc = options ? rev.doc : rev;
          if(!doc) {
            if((rev.value && rev.value.deleted)) {
              doc = {
                _id: rev.id,
                _deleted: true,
              };
            }
            else if(rev.error) {
              return;
            }
          }
          key = doc._id ? doc._id.split('|') : [doc.class_name, doc.ref];
          if(key[0] === 'system') {
            return !options && this.emit('system', key[1], doc);
          }
          cn = key[0].split('.');
          doc.ref = key[1];
          delete doc._id;
          if(!res[cn[0]]) {
            res[cn[0]] = {};
          }
          if(!res[cn[0]][cn[1]]) {
            res[cn[0]][cn[1]] = [];
          }
          res[cn[0]][cn[1]].push(doc);
        });

        for (let mgr in res) {
          for (cn in res[mgr]) {
            if($p[mgr] && $p[mgr][cn]) {
              $p[mgr][cn].load_array(res[mgr][cn], changes.update_only ? 'update_only' : true);
            }
          }
        }

        return true;
      }

      return false;
    }

    /**
     * Дёргает сервер для освежения авторизации
     * @param regex {RegExp}
     * @param timout {Number}
     */
    attach_refresher(regex, timout = 500000) {
      if(this.props._refresher) {
        clearInterval(this.props._refresher);
      }
      setInterval(() => {
        if(this.authorized && this.remote.ram && this.remote.ram.adapter == 'http') {
          this.remote.ram.info()
            .then(response => {
              response = null;
            })
            .catch(err => {
              err = null;
            });
        }
      }, timout);
    }

    /**
     * Формирует архив полной выгрузки базы для сохранения в файловой системе клиента
     * @method backup_database
     * @param [do_zip] {Boolean} - указывает на необходимость архивировать стоки таблиц в озу перед записью файла
     * @async
     */
    backup_database(do_zip) {

      // получаем строку create_tables

      // получаем строки для каждой таблицы

      // складываем все части в файл
    }

    /**
     * Восстанавливает базу из архивной копии
     * @method restore_database
     * @async
     */
    restore_database(do_zip) {

      // получаем строку create_tables

      // получаем строки для каждой таблицы

      // складываем все части в файл
    }

    /**
     * ### Информирует об авторизованности на сервере CouchDB
     *
     * @property authorized
     */
    get authorized() {
      const {_auth} = this.props;
      return _auth && _auth.username;
    }

    fetch(url, opts = {}) {
      const {authorized, remote, props} = this;
      if(!opts.headers) {
        if(typeof Headers === 'undefined') {
          const {Headers} = require('node-fetch');
          global.Headers = Headers;
        }
        opts.headers = new Headers({Accept: 'application/json'});
      }
      if(authorized) {
        if(!props.user_node) {
          for(const name in remote) {
            const db = remote[name];
            const {auth} = db.__opts;
            if(auth) {
              const {Authorization} = db.getBasicAuthHeaders({prefix: this.auth_prefix(), ...auth});
              opts.headers.set('Authorization', Authorization);
              break;
            }
          }
        }
        else if(!opts.headers.has('Authorization')) {
          const str = props.user_node.username + ':' + props.user_node.password;
          opts.headers.set('Authorization', `Basic ${new Buffer(str, 'utf8').toString('base64')}`);
        }
      }

      if(typeof sessionStorage === 'object' && sessionStorage.key('zone')) {
        const zone = sessionStorage.getItem('zone');
        if(zone) {
          url = url.replace(/_\d\d_/, `_${zone}_`);
          opts.headers.set('zone', zone);
          opts.headers.set('branch', sessionStorage.getItem('branch'));
          opts.headers.set('impersonation', sessionStorage.getItem('impersonation'));
          opts.headers.set('year', sessionStorage.getItem('year'));
        }
      }

      if(!opts.headers.has('Content-Type')) {
        opts.headers.set('Content-Type', 'application/json');
      }

      return PouchDB.fetch(url, opts);
    }

  };
}

export default (constructor) => {

  const {classes} = constructor;
  classes.PouchDB = PouchDB;
  classes.AdapterPouch = adapter(classes);

}

