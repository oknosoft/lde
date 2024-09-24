/**
 *
 * ### Метаданные журнала регистрации
 *
 * @module log_manager
 *
 * Created 08.01.2017
 */

export default function log_manager() {

  const {classes} = this;
  const {InfoRegManager, RegisterRow} = classes;

  /**
   * ### Журнал событий
   * Хранит и накапливает события сеанса
   * Является наследником регистра сведений
   * @extends InfoRegManager
   * @class LogManager
   * @static
   */
  class LogManager extends InfoRegManager {

    constructor(owner) {
      super(owner, 'ireg.log');

      this._stamp = Date.now();
      // раз в полторы минуты, пытаемся сбросить данные на сервер
      setInterval(this.backup.bind(this, 'stamp'), 100000);

      // объект сбора статистики
      this._stat = {
        timers: {}, // для активных таймеров (замеров)
        stack: {},  // для сохранения результата (замеров)
      };
      // раз в две минуты, записываем stack в log, если есть, что записывать
      setInterval(() => {
        const {_stat} = this;
        if(Object.keys(_stat.stack).length) {
          this.record({
            class: 'stat',
            obj: _stat.stack,
          });
          _stat.stack = {};
        }
      }, 200000);
    }

    /**
     * Начинает замер времени выполнения кода
     * @param ref {String} - идентификатор таймера
     */
    timeStart(ref) {
      const {timers} = this._stat;
      if (!timers[ref]) {
        timers[ref] = [performance.now()];
      }
      else {
        timers[ref].push(performance.now());
      }
    }

    /**
     * Останавливает замер времени выполнения кода
     * @param ref {String} - идентификатор таймера
     */
    timeEnd(ref) {
      const {timers, stack} = this._stat;
      let timeSpent = 0;
      if (timers[ref] && timers[ref].length) {
        timeSpent = performance.now() - timers[ref].shift();
        if (!stack[ref]) {
          stack[ref] = [1, timeSpent];
        }
        else {
          let [count, totalTime] = stack[ref];
          stack[ref] = [++count, totalTime + timeSpent];
        }
      }
      return timeSpent;
    }

    /**
     * Добавляет запись в журнал
     * @param msg {String|Object|Error} - текст + класс события
     * @param [msg.obj] {Object} - дополнительный json объект
     */
    record(msg) {

      const {wsql} = this._owner.$p;

      if(msg instanceof Error) {
        if(console) {
          console.log(msg);
        }
        msg = {
          class: 'error',
          note: msg.toString(),
        };
      }
      else if(typeof msg == 'object' && !msg.class && !msg.obj) {
        msg = {
          class: 'obj',
          obj: msg,
          note: msg.note,
        };
      }
      else if(typeof msg != 'object') {
        msg = {note: msg};
      }

      if(wsql.alasql.databases.dbo.tables.ireg_log) {
        msg.date = Date.now() + wsql.time_diff;

        // уникальность ключа
        if(!this._smax){
          this._smax = wsql.alasql.compile('select MAX(`sequence`) as `sequence` from `ireg_log` where `date` = ?');
        }
        const res = this._smax([msg.date]);
        if(!res.length || res[0].sequence === undefined) {
          msg.sequence = 0;
        }
        else {
          msg.sequence = parseInt(res[0].sequence) + 1;
        }

        // класс сообщения
        if(!msg.class) {
          msg.class = 'note';
        }

        this.alatable.push({
          ref: msg.date + '¶' + msg.sequence,
          date: msg.date,
          sequence: msg.sequence,
          'class': msg.class,
          note: msg.note,
          obj: msg.obj || null,
        });

        this.emit_async('record', {count: this.unviewed_count()});
      }
    }

    viewed() {
      const res = [];
      const {alatable} = this;
      const log_view = $p.ireg.log_view.alatable;
      const user = $p.adapters.pouch.authorized || '';
      for(let i = alatable.length - 1; i >= 0; i--) {
        const v = alatable[i];
        log_view.some((row) => {
          if(row.key === v.ref && row.user === user) {
            v.key = row.key;
            return true;
          }
        });
        res.push(v);
      }
      return res;
    }

    unviewed_count() {
      let count = 0;
      const vtable = this._owner.log_view.alatable;
      for(const {class: cl, ref} of this.alatable) {
        if(cl === 'stat' || vtable.some(({key}) => key === ref)) {
          continue;
        }
        count++;
      }
      return count;
    }

    /**
     * Сбрасывает события на сервер
     * @method backup
     * @param [dfrom] {Date}
     * @param [dtill] {Date}
     */
    backup(dfrom, dtill) {
      const {wsql, adapters: {pouch}, utils: {moment}} = this._owner.$p;

      if(dfrom === 'stamp' && pouch.authorized) {
        dfrom = this._stamp;
        if(!pouch.remote.log) {
          const {__opts} = (pouch.remote.doc || pouch.remote.ram || pouch.remote.remote || {});
          pouch.remote.log = new classes.PouchDB(__opts.name.replace(/(ram|remote|doc|doc\w\w\w\w\w)$/, 'log'), {
            skip_setup: true,
            adapter: 'http',
            owner: pouch,
            fetch: pouch.fetch,
          });
        }

        if(!this._rows){
          this._rows = wsql.alasql.compile('select * from `ireg_log` where `date` >= ? and `class` <> "ram"');
        }

        const _stamp = Date.now();
        const rows = this._rows([this._stamp + wsql.time_diff]);
        for(const row of rows) {
          row._id = `${moment(row.date - wsql.time_diff).format('YYYYMMDDHHmmssSSS') + row.sequence}|${pouch.props._suffix || '0000'}|${pouch.authorized}`;
          if(typeof row.obj === 'string') {
            try{
              row.obj = JSON.parse(row.obj);
            }
            catch(e) {

            }
          }
          delete row.ref;
          delete row.user;
          delete row._deleted;
        }
        rows.length && pouch.remote.log.bulkDocs(rows)
          .then((result) => {
            this._stamp = _stamp;
          }).catch((err) => {
            console.log(err);
          });
      }

    }

    /**
     * Восстанавливает события из архива на сервере
     * @method restore
     * @param [dfrom] {Date}
     * @param [dtill] {Date}
     */
    restore(dfrom, dtill) {

    }

    /**
     * Стирает события в указанном диапазоне дат
     * @method clear
     * @param [dfrom] {Date}
     * @param [dtill] {Date}
     */
    clear(dfrom, dtill) {
      for(const ref in this.by_ref) {
        delete this.by_ref[ref];
      }
      this.alatable.length = 0;

      const {log_view} = $p.ireg;
      for(const ref in log_view.by_ref) {
        delete log_view.by_ref[ref];
      }
      log_view.alatable.length = 0;
    }

    /**
     * Помечает записи, как просмотренные
     * @param dfrom
     * @param dtill
     */
    mark_viewed(dfrom, dtill) {
      const {alatable} = $p.ireg.log_view;
      const user = $p.adapters.pouch.authorized || '';

      if(!this._unviewed){
        // select l.* from `ireg_log` l left outer join `ireg_log_view` v on (l.ref = v.key) where v.key is null
        this._unviewed = this._owner.$p.wsql.alasql.compile(
          'select l.ref from `ireg_log` l left outer join `ireg_log_view` v on (l.ref = v.key) where v.key is null');
      }

      for(const {ref} of this._unviewed()) {
        alatable.push({key: ref, user});
      }
    }

    get(ref, force_promise, do_not_create) {

      if(typeof ref == 'object') {
        ref = ref.ref || '';
      }

      if(!this.by_ref[ref]) {

        if(force_promise === false) {
          return undefined;
        }

        var parts = ref.split('¶');
        this._owner.$p.wsql.alasql('select * from `ireg_log` where date=' + parts[0] + ' and sequence=' + parts[1])
          .forEach(row => new RegisterRow(row, this));
      }

      return force_promise ? Promise.resolve(this.by_ref[ref]) : this.by_ref[ref];
    }

    get_sql_struct(attr) {

      if(attr && attr.action == 'get_selection') {
        var sql = 'select * from `ireg_log`';
        if(attr.date_from) {
          if(attr.date_till) {
            sql += ' where `date` >= ? and `date` <= ?';
          }
          else {
            sql += ' where `date` >= ?';
          }
        }
        else if(attr.date_till) {
          sql += ' where `date` <= ?';
        }

        return sql;

      }
      else {
        return InfoRegManager.prototype.get_sql_struct.call(this, attr);
      }
    }

  }

  /**
   * ### Регистр сведений log
   * Журнал событий
   * @class IregLog
   * @extends RegisterRow
   * @constructor
   */
  this.IregLog = class IregLog extends RegisterRow {

    /**
     * Дата и время события
     * @type {Date}
     */
    get date() {return this._getter('date')}
    set date(v) {this._setter('date', v)}

    /**
     * Уточнение момента времени (порядок в пределах миллисекунды)
     * @type {Number}
     */
    get sequence() {return this._getter('sequence')}
    set sequence(v) {this._setter('sequence', v)}

    /**
     * Класс события (ошибка, инфо, статистика и т.д.)
     * @type {String}
     */
    get class() {return this._getter('class')}
    set class(v) {this._setter('class', v)}

    /**
     * Комментарий к событию
     * @type {String}
     */
    get note() {return this._getter('note')}
    set note(v) {this._setter('note', v)}

    /**
     * Произвольный объект события
     * @type {Object}
     */
    get obj() {return this._getter('obj')}
    set obj(v) {this._setter('obj', v)}

    /**
     * Имя пользователя, в сеансе которого произошло событие
     * @type {String}
     */
    get user() {return this._getter('user')}
    set user(v) {this._setter('user', v)}

  };

  // публикуем конструкторы системных менеджеров
  classes.LogManager = LogManager;

  // создаём менеджер журнала регистрации
  this.ireg.create('log', LogManager);

}
