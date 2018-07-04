/**
 * Содержит методы и подписки на события PouchDB
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 * @module common
 * @submodule pouchdb
 */

/**
 * ### PouchDB для хранения данных в idb браузера и синхронизации с CouchDB
 */

import PouchDB from './pouchdb';


function adapter({AbstracrAdapter}) {

  const fieldsToDelete = '_id,_rev,search,timestamp'.split(',');

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

    }

    /**
     * Инициализация адаптера
     * @param wsql
     * @param job_prm
     */
    init(wsql, job_prm) {

      const {props, local, remote, $p: {md}} = this;

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
        props.path = location.protocol + '//' + location.host + props.path;
      }
      if(job_prm.use_meta === false) {
        props.use_meta = false;
      }
      if(job_prm.use_ram === false) {
        props.use_ram = false;
      }

      // создаём локальные базы
      const opts = {auto_compaction: true, revs_limit: 3};
      const bases = md.bases();

      // если используется meta, вместе с локальной создаём удалённую, т.к. для неё не нужна авторизация
      if(props.use_meta !== false) {
        local.meta = new PouchDB(props.prefix + 'meta', opts);
        if(props.path) {
          remote.meta = new PouchDB(props.path + 'meta', {skip_setup: true});
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
          if(props.user_node || (props.direct && name != 'ram')) {
            Object.defineProperty(local, name, {
              get: function () {
                return remote[name];
              }
            });
          }
          else {
            local[name] = new PouchDB(props.prefix + props.zone + '_' + name, opts);
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

      const {props, remote, $p: {md}} = this;
      const opts = {skip_setup: true, adapter: 'http'};

      if(auth) {
        opts.auth = auth;
      }
      else if(props.user_node) {
        opts.auth = props.user_node;
      }

      (bases || md.bases()).forEach((name) => {
        if((!auth && remote[name]) || name == 'e1cib' || name == 'pgsql' || name == 'github' || (name === 'ram' && props.use_ram === false)) {
          return;
        }
        remote[name] = new PouchDB(this.dbpath(name), opts);
      });
    }

    /**
     * запускает репликацию
     */
    after_log_in() {

      const {props, local, remote, $p: {md}} = this;
      const try_auth = [];

      md.bases().forEach((dbid) => {
        if(dbid !== 'meta' && local[dbid] && remote[dbid] && local[dbid] != remote[dbid]) {
          if(props.noreplicate && props.noreplicate.indexOf(dbid) != -1) {
            return;
          }
          try_auth.push(this.run_sync(dbid));
        }
      });

      return Promise.all(try_auth)
        .then(() => {
          // широковещательное оповещение об окончании загрузки локальных данных
          if(local._loading) {
            return new Promise((resolve, reject) => {
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
      const {props, local, remote, $p} = this;
      const {job_prm, wsql, aes, md, cat} = $p;

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
      const try_auth = props.user_node ? Promise.resolve() : remote.ram.login(username, password)
        .then(({roles}) => {
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
          }
        })
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
                  // .then((ram_logged_in) => {
                  //   if(ram_logged_in) {
                  //     return remote[dbid].login(username, password).then(() => ram_logged_in)
                  //   }
                  // })
                  .then((ram_logged_in) => ram_logged_in && remote[dbid].info());
              }
            });
          }
          return postlogin;
        });

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

          // врезаем асинхронную подписку на событие
          return this.emit_promise('on_log_in').then(() => info);
        }
        else {
          this.emit('user_log_stop', username);
          return Promise.resolve();
        }

      })
        .then((info) => {
          if(props._data_loaded && !props._doc_ram_loading) {
            if(props._doc_ram_loaded) {
              this.emit('pouch_doc_ram_loaded')
            }
            else {
              this.load_doc_ram();
            }
          };
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
      const {props, local, remote, authorized, $p: {md}} = this;

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
                    remote[name] = new PouchDB(dbpath, {skip_setup: true, adapter: 'http'});
                  }
                });
              res = res ? res.then(() => sub) : sub;
            }
          }
          return res;
        }
      }))
        .then(() => this.emit('user_log_out'));
    }

    /**
     * ### Загружает условно-постоянные данные из базы ram в alasql
     * Используется при инициализации данных на старте приложения
     *
     * @method load_data
     */
    load_data() {

      const {local, $p: {job_prm}} = this;
      const options = {
        limit: 800,
        include_docs: true,
      };
      const _page = {
        total_rows: 0,
        limit: options.limit,
        page: 0,
        start: Date.now(),
      };

      // бежим по всем документам из ram
      return new Promise((resolve, reject) => {

        const fetchNextPage = () => {
          local.ram.allDocs(options, (err, response) => {

            if(response) {
              // широковещательное оповещение о загрузке порции локальных данных
              _page.page++;
              _page.total_rows = response.total_rows;
              _page.duration = Date.now() - _page.start;

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
          });
        };

        local.ram.info().then((info) => {
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
      const {props: {path, zone, _suffix}} = this;
      if(name == 'meta') {
        return path + 'meta';
      }
      else if(name == 'ram') {
        return path + zone + '_ram';
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
      if(dbid.indexOf('remote') != -1 || (props.noreplicate && props.noreplicate.indexOf(dbid) != -1)) {
        return remote[dbid.replace('_remote', '')];
      }
      else {
        return local[dbid] || remote[dbid];
      }
    }

    /**
     * Интервал опроса при live-репликации
     * @param delay
     * @return {number}
     */
    back_off (delay) {
      if (!delay) {
        return 500 + Math.floor(Math.random() * 2000);
      }
      else if (delay >= 90000) {
        return 90000;
      }
      return delay * 3;
    }

    /**
     * Предпринимает попытку загрузки начального образа из _local/dump базы remote
     * @param local
     * @param remote
     * @return {Promise<Boolean>}
     */
    sync_from_dump(local, remote, opts) {
      const {utils} = this.$p;
      // если уже грузили из дампа, не суетимся
      return local.get('_local/dumped')
        .then(() => true)
        // проверяем наличие дампа в remote
        .catch(() => remote.get('_local/dump'))
        .then(doc => {
          if(doc === true) {
            return doc;
          }
          // извлекаем и разархивируем дамп
          const byteCharacters = atob(doc.dump);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const blob = new Blob([new Uint8Array(byteNumbers)], {type: 'application/zip'});
          return utils.blob_as_text(blob, 'array');
        })
        .then((uarray) => {
          if(uarray === true) {
            return uarray;
          }

          return ('JSZip' in window ? Promise.resolve() : utils.load_script('https://cdn.jsdelivr.net/jszip/2/jszip.min.js', 'script'))
            .then(() => {
              const zip = new JSZip(uarray);
              return zip.files.dump.asText();
            });
        })
        .then((text) => {
          if(text === true) {
            return text;
          }

          const opt = {
            proxy: remote.name,
            checkpoints: 'target',
            emit: (docs) => {
              this.emit('pouch_dumped', {db: local, docs});
              if(local.name.indexOf('ram') !== -1) {
                // широковещательное оповещение о начале загрузки локальных данных
                this.emit('pouch_data_page', {
                  total_rows: docs.length,
                  local_rows: 3,
                  docs_written: 3,
                  limit: 300,
                  page: 0,
                  start: Date.now(),
                });
              }
            }
          };
          if(remote.__opts.auth) {
            opt.auth = remote.__opts.auth;
          }
          if(opts.filter) {
            opt.filter = opts.filter;
          }
          if(opts.query_params) {
            opt.query_params = opts.query_params;
          }

          return (local.load ? Promise.resolve() : utils.load_script('/dist/pouchdb.load.js', 'script'))
            .then(() => {
              return local.load(text, opt);
            })
            .then(() => local.put({_id: '_local/dumped'}))
            .then(() => -1);
        })
        .catch((err) => {
          err.status !== 404 && console.log(err);
          return false;
        });
    }

    /**
     * ### Запускает процесс синхронизвации
     *
     * @method run_sync
     * @param local {PouchDB}
     * @param remote {PouchDB}
     * @param id {String}
     * @return {Promise.<TResult>}
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

          return new Promise((resolve, reject) => {

            const options = {
              batch_size: 200,
              batches_limit: 6,
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
              options.live = true;
              options.back_off_function = this.back_off;

              // ram и meta синхронизируем в одну сторону, doc в демо-режиме, так же, в одну сторону
              if(id == 'ram' || id == 'meta' || props.zone == job_prm.zone_demo) {
                local.sync[id] = sync_events(db_local.replicate.from(db_remote, options));
              }
              else if(_push_only) {
                if(options.filter) {
                  delete options.filter;
                  delete options.query_params;
                }
                local.sync[id] = sync_events(db_local.replicate.to(db_remote, options));
              }
              else {
                local.sync[id] = sync_events(db_local.sync(db_remote, options));
              }
            }

            const sync_events = (sync, options) => {

              sync.on('change', (change) => {
                // yo, something changed!
                if(id == 'ram') {
                  this.load_changes(change);

                  if(linfo.doc_count < (job_prm.pouch_ram_doc_count || 10)) {

                    // широковещательное оповещение о загрузке порции данных
                    _page.page++;
                    _page.docs_written = change.docs_written;
                    _page.duration = Date.now() - _page.start;

                    this.emit('pouch_data_page', Object.assign({}, _page));
                  }
                }
                else {
                  // если прибежали изменения базы doc - обновляем только те объекты, которые уже прочитаны в озу
                  change.update_only = true;
                  this.load_changes(change);
                }

                this.emit('pouch_sync_data', id, change);

              })
                .on('denied', (info) => {
                  // a document failed to replicate, e.g. due to permissions
                  this.emit('pouch_sync_denied', id, info);

                })
                .on('error', (err) => {
                  // if(err.result && !err.result.errors.length && sync){
                  //   sync.emit('complete');
                  // }
                  // else{
                  //   // totally unhandled error (shouldn't happen)
                  //   this.emit('pouch_sync_error', id, err);
                  // }
                  // totally unhandled error (shouldn't happen)
                  this.emit('pouch_sync_error', id, err);
                })
                .on('complete', (info) => {
                  // handle complete

                  sync.cancel();
                  sync.removeAllListeners();

                  if(options) {
                    final_sync(options);
                    resolve(id);
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

            this.sync_from_dump(db_local, db_remote, options)
              .then((synced) => {
                if(synced) {
                  final_sync(options);
                  if(typeof synced === 'number') {
                    this.rebuild_indexes(id)
                      .then(() => this.load_data());
                  };
                }
                else {
                  sync_events(db_local.replicate.from(db_remote, options), options);
                }
              });

          });

        });
    }

    /**
     * Перестраивает индексы
     * Обычно, вызывается после начальной синхронизации
     * @param id {String}
     */
    rebuild_indexes(id) {
      const {local, remote} = this;
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
              if(doc.views) {
                for(const name in doc.views) {
                  const view = doc.views[name];
                  const index = doc._id.replace('_design/', '') + '/' + name;
                  if(doc.language === 'javascript') {
                    promises = promises.then(() => {
                      this.emit('rebuild_indexes', {id, index, start: true});
                      return local[id].query(index, {limit: 1});
                    });
                  }
                  else {
                    const selector = {
                      //use_index: index,
                      limit: 1,
                      fields: ['_id'],
                      selector: {}
                    };
                    for(const fld of view.options.def.fields) {
                      selector.selector[fld] = '';
                    }
                    promises = promises.then(() => {
                      this.emit('rebuild_indexes', {id, index, start: true});
                      return local[id].find(selector);
                    });
                  }
                }
              }
            }
            return promises.then(() => {
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
        .then(() => remote.ram != local.ram && local.ram.destroy())
        .then(() => remote.doc != local.doc && local.doc.destroy())
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
        })
        .catch((err) => {
          if(err.status != 404) {
            throw err;
          }
          else {
            this.$p.record_log(db.name + ':' + tObj._manager.class_name + '|' + tObj.ref);
          }
        })
        .then((res) => {
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

      if(!_data || (_data._saving && !_data._modified)) {
        return Promise.resolve(tObj);
      }
      // TODO: опасное место с гонками при одновременной записи
      if(_data._saving && _data._modified) {
        return new Promise((resolve, reject) => {
          setTimeout(() => resolve(this.save_obj(tObj, attr)), 100);
        });
      }
      _data._saving = true;

      // нас могли попросить записать объект не в родную базу менеджера, а в любую другую
      const db = attr.db || this.db(_manager);

      // подмешиваем class_name
      const tmp = Object.assign({_id: class_name + '|' + ref, class_name}, _obj);

      // формируем строку поиска
      const {utils, wsql} = this.$p;
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
        moment: utils.moment().format("YYYY-MM-DDTHH:mm:ss ZZ"),
      }

      delete tmp.ref;
      if(attr.attachments) {
        tmp._attachments = attr.attachments;
      }

      return new Promise((resolve, reject) => {
        const getter = tObj.is_new() ? Promise.resolve() : db.get(tmp._id);
        getter.then((res) => {
          if(res) {
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
        })
          .catch((err) => err && err.status != 404 && reject(err))
          .then(() => db.put(tmp))
          .then(() => {
            tObj.is_new() && tObj._set_loaded(tObj.ref);
            if(tmp._attachments) {
              if(!tObj._attachments) {
                tObj._attachments = {};
              }
              for (var att in tmp._attachments) {
                if(!tObj._attachments[att] || !tmp._attachments[att].stub) {
                  tObj._attachments[att] = tmp._attachments[att];
                }
              }
            }
            _data._saving = false;
            resolve(tObj);
          })
          .catch((err) => {
            _data._saving = false;
            err && err.status != 404 && reject(err);
          });
      });
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

      const {utils, classes} = this.$p;
      const db = this.db(_mgr);
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
                    var mgr = _mgr.value_mgr(o, fld, mf.type, false, doc[fld]);
                    if(mgr) {
                      o[fldsyn] = mgr.get(doc[fld]).presentation;
                    }
                    else {
                      o[fldsyn] = '';
                    }
                  }
                }
                else if(typeof doc[fld] === 'number' && mf.type.fraction_figits) {
                  o[fldsyn] = doc[fld].toFixed(mf.type.fraction_figits);
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
     * @param _mgr {DataManager}
     * @param refs {Array}
     * @param with_attachments {Boolean}
     * @return {*}
     */
    load_array(_mgr, refs, with_attachments) {
      if(!refs || !refs.length) {
        return Promise.resolve(false);
      }
      const db = this.db(_mgr);
      const options = {
        limit: refs.length + 1,
        include_docs: true,
        keys: refs.map((v) => _mgr.class_name + '|' + v),
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
                delete doc._rev;
                return doc;
              }));

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
          else if(err) {
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
          _m[kind][name].cachable === 'doc_ram' && res.push(kind + '.' + name);
        }
      });

      return res.reduce((acc, name) => {
        return acc.then(() => {
          const opt = {
            include_docs: true,
            startkey: name + '|',
            endkey: name + '|\ufff0',
            limit: 10000,
          };
          const page = local.sync._page || {};
          this.emit('pouch_data_page', Object.assign(page, {synonym: md.get(name).synonym}));
          return local.doc.allDocs(opt).then((res) => this.load_changes(res, opt));
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
    find_rows(_mgr, selection) {

      const db = this.db(_mgr);

      // если базы не инициализированы, возвращаем пустой массив
      if(!db) {
        return Promise.resolve([]);
      }

      const err_handler = this.emit.bind(this, 'pouch_sync_error', _mgr.cachable);

      // если указан MangoQuery, выполняем его без лишних церемоний
      if(selection && selection._mango) {
        const {selector} = selection;
        if(db.adapter == 'idb' && selector.date && selector.date.$and){
          selector.date = selector.date.$and[0];
        }
        return db.find(selection)
          .then(({docs}) => {
            if(!docs) {
              docs = [];
            }
            for (const doc of docs) {
              doc.ref = doc._id.split('|')[1];
            }
            return docs;
          })
          .catch((err) => {
            err_handler(err);
            return [];
          });
      }

      const {utils} = this.$p;
      const res = [];
      const options = {
        limit: 100,
        include_docs: true,
        startkey: _mgr.class_name + '|',
        endkey: _mgr.class_name + '|\ufff0',
      };
      let doc, _raw, _view, _total_count, top, calc_count, top_count = 0, skip = 0, skip_count = 0;

      if(selection) {

        if(selection._top) {
          top = selection._top;
          delete selection._top;
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
                      delete doc._rev;
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
                delete doc._rev;
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
        type = {type: 'text/plain'};
      }

      if(!(attachment instanceof Blob) && type.indexOf('text') == -1) {
        attachment = new Blob([attachment], {type: type});
      }

      // получаем ревизию документа
      var _rev,
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
          key = doc._id.split('|');
          if(key[0] === 'system') {
            return !options && this.emit('system', key[1], doc);
          }
          cn = key[0].split('.');
          doc.ref = key[1];
          delete doc._id;
          delete doc._rev;
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

  };
}

export default (constructor) => {

  const {classes} = constructor;
  classes.PouchDB = PouchDB;
  classes.AdapterPouch = adapter(classes);

}

