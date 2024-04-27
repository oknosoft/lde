/*
 * Конструкторы объектов данных
 *
 */

import {string} from './utils';
import {own, get, set, hash, notify} from './meta/symbols';
import {OwnerObj, TypeDef} from './meta/metaObjs';
import {TabularSection} from './tabulars';

class InnerData {
  constructor(owner, loading) {
    /**
     * Признак прочитанности объекта из базы
     * @type {boolean}
     */
    this.isNew = !(owner instanceof EnumObj);
    /**
     * Признак, что в текущий момент, объект "загружается"
     * Аналог РежимЗаписи.Загрузка в 1С
     * @type {boolean}
     */
    this.loading = Boolean(loading);
    /**
     * Счётчик циклической записи
     * @type {number}
     */
    this.saving = 0;
    /**
     * Признак, что в текущий момент, объект "записывается"
     * @type {boolean}
     */
    this.trans = false;
    /**
     * Признак модифицированности
     * @type {boolean}
     */
    this.modified = false;
    /**
     * Список обработанных полей для valueChange
     * @type {Array.<String>}
     */
    this.stack = [];
  }
}

/**
 * @summary Предок DataObj
 * @desc Ключевое отличие: экземпляры BaseDataObj, болтаются в воздухе, в то время,
 * как обычные DataObj, сразу попадают в коллекцию своего владельца
 */
export class BaseDataObj extends OwnerObj {

  /**
   * Фактическое хранилище данных объекта
   * @type Object
   * @final
   */
  #obj;

  constructor(attr, manager, loading, direct) {

    super(manager);

    if(Array.isArray(manager)) {
      this.#obj = direct ? attr : {};
    }
    else {
      // в режиме direct, новый объект не создаём - используем сырые данные
      this.#obj = direct ? attr : {ref: manager.getRef(attr)};

      Object.defineProperties(this, {

        /**
         * Внутренние и пользовательские данные - аналог `AdditionalProperties` _Дополнительные свойства_ в 1С
         * @property _data
         * @type InnerData
         * @final
         */
        _data: {value: new InnerData(this, loading)}

      });
    }

    const {tabulars, fields} = this._metadata();
    for(const name in tabulars) {
      this.#obj[name] = new TabularSection(this, name, this.#obj[name]);
    }
    // TODO: заменить на метод класса MetaObj
    if(fields?.type && this.#obj.type) {
      this.#obj.type = new TypeDef(this.#obj.type);
    }

  }

  /**
   * Указатель на менеджера данного объекта
   * @property _manager
   * @type DataManager
   * @final
   */
  get _manager() {
    return this[own];
  }

  /**
   * Метаданные текущего объекта
   * @param {String} [name] - Имя поля
   * @return {MetaObj}
   */
  _metadata(name) {
    return this._manager.metadata(name);
  }

  get className() {
    return this._manager.className;
  }

  /**
   * guid ссылки объекта
   * @type String
   */
  get ref() {
    return this._manager.getRef(this.#obj);
  }

  /**
   * Дополняет сырые данные #obj не генерируя событий
   * @param {Object} raw
   */
  _assign(raw) {
    Object.assign(this.#obj, raw);
  }

  [get](f) {

    const res = this.#obj[f];
    const fMeta = this._metadata(f);
    const {type} = fMeta;

    // для простых типов, возвращаем почти в лоб
    if(type.isSingleType) {
      return fMeta.fixSingle(res, type);
    }

    // для простых ссылочных, тоже почти в лоб
    if(type.isSingleRef) {
      const mgr = fMeta[own].mgr(type.types[0]);
      return mgr.get(res);
    }

    if(type.isJson) {
      // TODO: надо добиться, чтобы всегда
      return rtype === 'object' ? res : {};
    }

    // для дальнейшего разбора, потребуется тип значения
    const rtype = typeof res;
    // если доступны ссылочные и на входе строка
    if(type.isRef && rtype === string) {
      const parts = res.split('|');
      if(parts.length === 2) {
        const mgr = fMeta[own].mgr(parts[0]);
        if(mgr) {
          return mgr.get(parts[1]);
        }
      }
    }


    // для перечислений и табличных частей, возвращаем значение в лоб
    if(_manager.isEnum) {
      return res;
    }

    if(f === 'type' && rtype === 'object') {
      return res;
    }

    const {utils} = _manager;

    if(type.isRef) {

      if(type.digits && rtype === 'number') {
        return res;
      }

      if(type.hasOwnProperty('str_len') && !utils.is.guid(res)) {
        return res;
      }

      const mgr = _manager.value_mgr(_obj, f, type);
      if(mgr) {
        if(utils.is.dataMgr(mgr)) {
          return mgr.get(res, false, false);
        }
        else {
          return utils.fetch_type(res, mgr);
        }
      }

      if(res) {
        // управляемый лог
        //typeof utils.debug === 'function' && utils.debug([f, type, _obj]);
        return null;
      }

    }
    else if(type.datePart) {
      return utils.fix.date(res, true);
    }
    else if(type.digits) {
      return utils.fix.number(res, !type.hasOwnProperty('str_len'));
    }
    else if(type.types[0] == 'boolean') {
      return utils.fix.boolean(res);
    }
    else if(type.types[0] == 'json') {
      return rtype === 'object' ? res : {};
    }
    else {
      return res;
    }
  }

  [notify](f) {
    const {_data, _manager} = this;
    if(_data && !_data.loading) {
      _data.modified = true;
      _manager.emit_async('update', this, {[f]: this.#obj[f]});
    }
  }

  /**
   * Устанваливает значение реквизита с приведением типов
   * @param {String} f - имя поля
   * @param {*} v - значение
   * @private
   */
  [set](f, v) {
    const {_data, _manager: {utils}} = this;
    const mf = this._metadata(f).type;
    const obj = this.#obj;

    // выполняем value_change с блокировкой эскалации
    if(!_data.loading) {
      _data.loading = true;
      const res = this.valueChange(f, mf, v);
      _data.loading = false;
      if(res === false) {
        return;
      }
    }

    if(f === 'type' && v.types) {
      obj[f] = v;
    }
    else if(f === 'ref') {
      obj[f] = utils.fix.guid(v);
    }
    else if(mf instanceof DataObj) {
      obj[f] = utils.fix.guid(v, false);
    }
    else if(mf.isRef) {

      if(mf.digits && typeof v === 'number' || mf.hasOwnProperty('str_len') && typeof v === string && !utils.is.guid(v)) {
        obj[f] = v;
      }
      else if(typeof v === 'boolean' && mf.types.indexOf('boolean') != -1) {
        obj[f] = v;
      }
      else if(mf.datePart && v instanceof Date) {
        obj[f] = v;
      }
      else {
        obj[f] = utils.fix.guid(v);

        if(utils.is.dataObj(v) && mf.types.indexOf(v._manager.className) != -1) {

        }
        else {
          let mgr = this._manager.value_mgr(obj, f, mf, false, v);
          if(mgr) {
            if(mgr.isEnum()) {
              if(typeof v === string) {
                obj[f] = v;
              }
              else if(!v) {
                obj[f] = '';
              }
              else if(typeof v === 'object') {
                obj[f] = v.ref || v.name || '';
              }

            }
            else if(v && v.presentation) {
              if(v.type && !(v instanceof DataObj)) {
                delete v.type;
              }
              mgr.create(v);
            }
            else if(!utils.is.dataMgr(mgr)) {
              obj[f] = this.fetch_type(v, mgr);
            }
          }
          else {
            if(typeof v !== 'object') {
              obj[f] = v;
            }
          }
        }
      }
    }
    else if(mf.datePart) {
      obj[f] = utils.fix.date(v, !mf.hasOwnProperty('str_len'));
    }
    else if(mf.digits) {
      obj[f] = utils.fix.number(v, !mf.hasOwnProperty('str_len'));
    }
    else if(mf.types[0] == 'boolean') {
      obj[f] = utils.fix.boolean(v);
    }
    else if(mf.types[0] == 'json') {
      if(v && typeof v === string) {
        try {
          v = JSON.parse(v);
        }
        catch (e) {}
      }
      if(typeof v === 'object') {
        const tmp = utils.clone(v);
        if(tmp && typeof obj[f] === 'object') {
          Object.assign(obj[f], tmp);
        }
        else {
          obj[f] = tmp;
        }
      }
    }
    else {
      obj[f] = v;
    }
  }

  /**
   * Рассчитывает hash объекта
   * @return {Number}
   */
  [hash]() {
    // накапливаем строку из всех реквизитов и табличных частей
    let str = '';
    const {_obj, _manager} = this;
    const {fields, tabular_sections} = _manager.metadata();
    const sfields = ['date','numberDoc','posted','id','name','_deleted','isFolder','ref'];

    for(const fld of Object.keys(fields).concat(sfields)) {
      const v = _obj[fld];
      if(v !== undefined && v !== null) {
        str += v.valueOf();
      }
    }

    for (const ts in tabular_sections) {
      if(Array.isArray(_obj[ts])) {
        const fields = Object.keys(tabular_sections[ts].fields);
        for(const row of _obj[ts]) {
          for(const fld of fields) {
            const v = row[fld];
            if(v !== undefined && v !== null) {
              str += v.valueOf();
            }
          }
        }
      }
    }

    return _manager.utils.crc32(str);
  }

  /**
   * @summary Для операций сравнения возвращаем guid
   */
  valueOf() {
    return this.ref;
  }

  /**
   * @summary Сериализация
   * @desc Для сериализации возвращаем внутренний _obj
   */
  toJSON() {
    const res = {};
    const {_obj, _manager} = this;
    const {utils: {blank}, classes: {Meta}} = _manager.root;

    for(const fld in _obj) {
      const mfld = _manager.metadata(fld);
      if(mfld || fld === '_attachments') {
        if(Array.isArray(_obj[fld])) {
          res[fld] = this[fld].toJSON();
        }
        else {
          if(!Meta.sysFields.includes(fld) &&
            (_obj[fld] === blank.guid || (_obj[fld] === '' && mfld.type.types.length === 1 && mfld.type.types[0] === string))) {
            continue;
          }
          res[fld] = _obj[fld];
          if(fld === 'type' && typeof res[fld] === 'object') {
            delete res[fld]._mgr;
          }
        }
      }
    }
    return res;
  }

  /**
   * @summary Приведение к строке
   * @desc для строкового представления используем presentation
   */
  toString() {
    return this.presentation;
  }


  /**
   * Пометка удаления
   * @property _deleted
   * @for DataObj
   * @type Boolean
   */
  get _deleted() {
    return Boolean(this.#obj._deleted);
  }
  set _deleted(v) {
    this.#obj._deleted = !!v;
  }

  /**
   * Признак модифицированности
   */
  get _modified() {
    return !!this._data.modified;
  }
  set _modified(v) {
    this._data.modified = !!v;
  }

  /**
   * Возвращает "истина" для нового (еще не записанного или не прочитанного) объекта
   * @return {Boolean}
   */
  isNew() {
    return !this._data || this._data.isNew;
  }

  /**
   * Метод для ручной установки признака _прочитан_ (не новый)
   */
  _loaded() {
    Object.assign(this._data, {
      modified: false,
      isNew: false,
      loading: false,
    });
    return this;
  }


  /**
   * Проверяет, является ли ссылка объекта пустой
   * @method empty
   * @return {boolean} - true, если ссылка пустая
   */
  empty() {
    return this._manager.utils.is.emptyGuid(this.ref);
  }

  beforeAddRow() {

  }

  beforeDelRow() {

  }

  afterAddRow() {

  }

  afterDelRow() {

  }

  /**
   * @summary После создания
   * @desc Возникает после создания объекта. В обработчике можно установить значения по умолчанию для полей и табличных частей
   * или заполнить объект на основании данных связанного объекта
   *
   * @event AFTER_CREATE
   */
  async fillDefault() {
    return this;
  }

  /**
   * @summary После чтения объекта с сервера
   * @desc После чтения, но до заполнения реквизитов. В обработчике можно модифицировать сырые данные
   *
   * @event AFTER_LOAD
   */
  async beforeLoad(raw) {
    return this;
  }

  /**
   * @summary Перед записью
   * @desc Возникает перед записью объекта. В обработчике можно проверить корректность данных, рассчитать итоги и т.д.
   * Запись можно отклонить, выбросив ошибку, если у пользователя недостаточно прав, либо введены некорректные данные
   *
   * @event BEFORE_SAVE
   */
  async beforeSave() {
    return this;
  }

  /**
   * @summary После записи
   * @event AFTER_SAVE
   */
  async afterSave() {
    return this;
  }

  /**
   * @summary При изменении реквизита шапки или табличной части
   * @desc Синхронный метод с защитой от самовозбуждения циклических пересчётов
   * @event VALUE_CHANGE
   */
  valueChange(f, mf, v) {
    return this;
  }

}

/**
 * Абстрактный объект данных
 * Прародитель как ссылочных объектов (документов и справочников), так и регистров с суррогатным ключом и несохраняемых обработок<br />
 * См. так же:
 * - {{#crossLink "EnumObj"}}{{/crossLink}} - ПеречислениеОбъект
 * - {{#crossLink "CatObj"}}{{/crossLink}} - СправочникОбъект
 * - {{#crossLink "DocObj"}}{{/crossLink}} - ДокументОбъект
 * - {{#crossLink "DataProcessorObj"}}{{/crossLink}} - ОбработкаОбъект
 * - {{#crossLink "RegisterRow"}}{{/crossLink}} - ЗаписьРегистраОбъект
 * @extends BaseDataObj
 *
 * @param attr {Object} - объект с реквизитами в свойствах или строка guid ссылки
 * @param manager {RefDataManager}
 * @param [loading] {Boolean}
 */
export class DataObj extends BaseDataObj {

  constructor(attr, manager, loading, direct) {
    // если объект с такой ссылкой уже есть в базе, возвращаем его и не создаём нового
    if(manager.storable !== false) {
      const tmp = manager.get(attr, false);
      if(tmp) {
        return tmp;
      }
    }

    super(attr, manager, loading, direct);

    manager.push(this);

  }

  /**
   * Ревизия
   * Eё устанваливает адаптер при чтении и записи
   * @type String
   */
  get _rev() {
    return this[get]('_rev') || '';
  }
  set _rev(v) {
  }

  /**
   *
   * @type {boolean}
   */
  get isFolder() {
    const {hierarchical, groupHierarchy} = this._metadata();
    return hierarchical && groupHierarchy && this[get]('isFolder') ? true : false;
  }

  /**
   * Читает объект из внешней или внутренней датабазы асинхронно.
   * В отличии от _mgr.get(), принудительно перезаполняет объект сохранёнными данными
   * @method load
   * @for DataObj
   * @param attr {Object} - дополнительные параметры чтения, например, db
   * @return {Promise.<DataObj>} - промис с результатом выполнения операции
   * @async
   */
  load(attr) {
    const {_data, _manager: {utils}} = this;
    if(this.ref == utils.blank.guid) {
      if(_data) {
        _data.loading = false;
        _data.modified = false;
      }
      return Promise.resolve(this);
    }
    else if(_data.loading) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(_data.loading ? this.load(attr) : this);
        }, 1000);
      });
    }
    else {
      _data.loading = true;
      return this._manager.adapter.load_obj(this, attr)
        .then(() => {
          _data.loading = false;
          _data.modified = false;
          return this.after_load();
        });
    }
  }

  /**
   * Освобождает память и уничтожает объект
   * @method unload
   * @for DataObj
   */
  unload() {
    const {_obj, ref, _data, _manager} = this;
    _manager.unload_obj(ref);
    _data.loading = true;
    //_manager.emit_async('unload', this);
    for (const ts in this._metadata().tabular_sections) {
      this[ts].clear();
    }
    for (const f in this) {
      if(this.hasOwnProperty(f)) {
        delete this[f];
      }
    }
    for (const f in _obj) {
      delete _obj[f];
    }
    delete this._obj;
  }

  /**
   * Проверяет заполненность реквизитов
   * и прочие ограничения, заданные в метаданных
   * @param {Object} [attr] - массив полей, которые нужно проверить. Если не задан, проверяются все поля
   * @param {Array} [attr.fields] - массив полей, которые нужно проверить. Если не задан, проверяются все поля
   * @return {boolean}
   */
  checkMandatory(attr) {
    const {fields, tabular_sections} = this._metadata();
    const {_manager} = this;
    const {msg, cch: {properties}, classes, utils} = _manager.root;
    const flds = Object.assign({}, fields);
    if(_manager instanceof classes.CatManager) {
      flds.name = this._metadata('name') || {};
      flds.id = this._metadata('id') || {};
    }
    for (const mf in flds) {
      if (flds[mf] && flds[mf].mandatory && (!this._obj[mf] || this._obj[mf] === utils.blank.guid)) {
        throw {
          obj: this,
          title: msg.mandatory_title,
          type: 'alert-error',
          text: msg.mandatory_field.replace('%1', this._metadata(mf).synonym)
        };
      }
    }
    if(properties) {
      for (const prts of ['extra_fields', 'product_params', 'params']) {
        if(!tabular_sections[prts]) {
          continue;
        }
        for (const row of this[prts]._obj) {
          const property = properties.get(row.property || row.param);
          if(property && property.mandatory) {
            const {value} = (row._row || row);
            if(utils.is.dataObj(value) ? value.empty() : !value) {
              throw {
                obj: this,
                row: row._row || row,
                title: msg.mandatory_title,
                type: 'alert-error',
                text: msg.mandatory_field.replace('%1', property.caption || property.name)
              };
            }
          }
        }
      }
    }
    return true;
  }

  /**
   * Записывает объект
   * Ввыполняет подписки на события перед записью и после записи<br />
   * В зависимости от настроек, выполняет запись объекта во внешнюю базу данных
   *
   * @method save
   * @for DataObj
   * @param {Boolean} [post] - проведение или отмена проведения или просто запись
   * @param {Boolean} [operational] - режим проведения документа (Оперативный, Неоперативный)
   * @param {Array} [attachments] - массив вложений
   * @param {Object} [attr] - дополнительные параметры записи
   * @return {Promise.<DataObj>} - промис с результатом выполнения операции
   * @async
   */
  save(post, operational, attachments, attr) {

    const {utils} = this._manager;

    if(utils.is_empty_guid(this.ref)) {
      return Promise.resolve(this);
    }

    // запоминаем признак проведенности, чтобы восстановить его в случае неудачной записи
    let initial_posted;
    if(this instanceof DocObj && typeof post == 'boolean') {
      initial_posted = this.posted;
      this.posted = post;
    }

    // выполняем обработчик перед записью
    const {_data, _manager} = this;
    _data.trans = true;
    return _manager.emit_promise('before_save', this, attr)
      .then(() => {
        return this.before_save(attr);
      })
      .then((before_save_res) => {

        // этот код выполним в самом конце, после записи
        const reset_modified = () => {
          if(before_save_res === false) {
            if(this instanceof DocObj && typeof initial_posted == 'boolean' && this.posted !== initial_posted) {
              this.posted = initial_posted;
            }
          }
          else {
            _data.modified = false;
          }
          _data._saving = 0;
          _data.trans = false;
          return this;
        };

        // если процедуры перед записью завершились неудачно - не продолжаем
        if(before_save_res === false) {
          return Promise.reject(reset_modified());
        }
        // если запись переопределена в before_save, выходим без лишних движений
        else if(before_save_res === null) {
          return Promise.resolve(reset_modified());
        }
        // TODO: обработать bulk_docs
        else if(Array.isArray(before_save_res)) {
          ;
        }

        // этот код выполняем в случае ошибки незаполненных реквизитов
        const reset_mandatory = (msg) => {
          before_save_res = false;
          reset_modified();
          _manager.root.md.emit('alert', msg);
          const err = new Error(msg.text);
          err.msg = msg;
          return Promise.reject(err);
        };

        // для объектов с иерархией установим пустого родителя, если иной не указан
        if(this._metadata().hierarchical && !this._obj.parent) {
          this._obj.parent = utils.blank.guid;
        }

        // для документов, контролируем заполненность даты и номера
        let numerator;
        if(!this._deleted) {
          if(this instanceof DocObj) {
            if(utils.blank.date == this.date) {
              this.date = new Date();
            }
            if(!this.numberDoc) {
              numerator = this.newNumberDoc();
            }
          }
          else {
            if(!this.id) {
              numerator = this.newNumberDoc();
            }
          }
        }

        // если не указаны обязательные реквизиты...
        try {
          this.checkMandatory();
        }
        catch (e) {
          return reset_mandatory(e);
        }

        // в зависимости от типа кеширования, получаем saver и сохраняем объект во внешней базе
        return (numerator || Promise.resolve())
          .then(() => _manager.adapter.save_obj(this, Object.assign({post, operational, attachments}, attr)))
          // и выполняем обработку после записи
          .then(() => this.after_save())
          .then(() => _manager.emit_promise('after_save', this))
          .then(reset_modified)
          .catch((err) => {
            reset_modified();
            throw err;
          });

      });

  }

  /**
   * Загружает недостающие объекты, ссылки на которые есть в текущем объекте
   * @return {Promise<DataObj>}
   */
  loadLinked() {
    const adapters = new Map();
    const {fields, tabular_sections} = this._metadata();

    function add_refs(obj, meta) {
      for(const fld in meta) {
        if(meta[fld].type.isRef) {
          const v = obj[fld];
          if(v instanceof DataObj && !v.empty() && v.isNew()) {
            const {_manager} = v;
            const {adapter} = _manager;
            const db = adapter.db(_manager);
            if(!adapters.get(adapter)) {
              adapters.set(adapter, new Map());
            }
            if(!adapters.get(adapter).get(db)){
              adapters.get(adapter).set(db, new Set());
            }
            adapters.get(adapter).get(db).add(`${v.className}|${v.ref}`);
          }
        }
      }
    }

    add_refs(this, fields);
    for(const tsname in tabular_sections) {
      const meta = tabular_sections[tsname].fields;
      for(const row of this[tsname]) {
        row && add_refs(row, meta);
      }
    }

    const res = [];
    for(const [adapter, mdb] of adapters) {
      for(const [db, refs] of mdb) {
        res.push(adapter
          .load(null, Array.from(refs), false, db)
          .catch((err) => null));
      }
    }

    return Promise.all(res).then(() => this);
  }

  /**
   * @summary Возвращает присоединенный объект или файл
   * @for DataObj
   * @param id {String} - идентификатор (имя) вложения
   */
  getAttachment(id) {
    const {_manager, ref} = this;
    return _manager.adapter.getAttachment(_manager, ref, id);
  }

  /**
   * Сохраняет объект или файл во вложении
   * Вызывает {{#crossLink "DataManager/saveAttachment:method"}} одноименный метод менеджера {{/crossLink}} и передаёт ссылку на себя в качестве контекста
   *
   * @param {String} name - идентификатор (имя) вложения
   * @param {Blob|String} attachment - вложение
   * @param {String} [type]- mime тип
   * @return Promise.<DataObj>
   * @async
   */
  saveAttachment(name, attachment, type) {
    const {_manager, ref, _obj, _attachments} = this;
    return _manager.saveAttachment(ref, name, attachment, type)
      .then((att) => {
        if(!_attachments) {
          this._attachments = {};
        }
        if(att.rev && _obj) {
          _obj._rev = att.rev;
        }
        if(!this._attachments[name] || !att.stub) {
          this._attachments[name] = att;
        }
        return att;
      });
  }

  /**
   * Удаляет присоединенный объект или файл
   * Вызывает одноименный метод менеджера и передаёт ссылку на себя в качестве контекста
   *
   * @param {String} name - идентификатор (имя) вложения
   * @async
   */
  deleteAttachment(name) {
    const {_manager, ref, _obj, _attachments} = this;
    return _manager.deleteAttachment(ref, name)
      .then((att) => {
        if(_attachments) {
          delete _attachments[name];
        }
        if(att.rev && _obj) {
          _obj._rev = att.rev;
        }
        return att;
      });
  }

  /**
   * Возвращает массив оборванных ссылок в реквизитах и табличных частях объекта
   * @return {Array}
   */
  brokenLinks() {
    const res = [];
    const {fields, tabular_sections} = this._metadata();
    const {_obj, _manager: {root}} = this;
    const {md, utils} = root;

    if(this.empty() || this.isNew()){
      return res;
    }

    for (const fld in fields) {
      const {type} = fields[fld];
      if (type.isRef && _obj.hasOwnProperty(fld) && _obj[fld] && !utils.is_empty_guid(_obj[fld])) {
        const finded = type.types.some((type) => {
          const _mgr = md.mgr_by_className(type);
          return _mgr && !_mgr.get(_obj[fld], false, false).isNew();
        });
        if (!finded) {
          res.push({'obj': _obj, fld, 'ts': '', 'row': 0, 'value': _obj[fld], type});
        }
      }
    }

    for(const ts in tabular_sections) {
      if (_obj.hasOwnProperty(ts)) {
        const {fields} = tabular_sections[ts];
        _obj[ts].forEach((row) => {
          for(const fld in fields) {
            const {type} = fields[fld];
            if (type.isRef && row.hasOwnProperty(fld) && row[fld] && !utils.is_empty_guid(row[fld])) {
              const finded = type.types.some((type) => {
                const _mgr = md.mgr_by_className(type);
                return _mgr && !_mgr.get(_obj[fld], false, false).isNew();
              });
              if (!finded) {
                res.push({'obj': _obj, fld, ts, 'row': row.row, 'value': row[fld], type});
              }
            }
          }
        })
      }
    }

    return res;
  }

  /**
   * Значение допреквизита по имени или свойству
   * @param {String|CchProperties} property - имя параметра
   * @param {*} [value] - если задано, устанавливает
   * @param {Number} [list] - если задано, переопределяет list свойства
   */
  _extra(property, value, list) {
    const {extra_fields, _manager: {root: {cch, md}}} = this;
    if(!extra_fields || !cch.properties) {
      return;
    }
    if(typeof property === string) {
      property = cch.properties.predefined(property);
    }
    if(!property) {
      return;
    }

    const row = extra_fields.find({property});
    if(value !== undefined) {
      if(row) {
        row.value = value;
      }
      else {
        extra_fields.add({property, value});
      }
    }
    else {
      const {type: {types, isSingleRef}} = property;
      if(!list) {
        list = property.list;
      }
      if(list === 4) {
        const res = new Map();
        try {
          const mgr = md.mgr_by_className(types[0]);
          const raw = row?.txt_row ? JSON.parse(row.txt_row) : {};
          for(const ref in raw) {
            res.set(mgr.get(ref), raw[ref]);
          }
        }
        catch (e) {}
        return res;
      }
      if(row) {
        return row.value;
      }
      if(isSingleRef) {
        const mgr = md.mgr_by_className(types[0]);
        return mgr && mgr.get();
      }
    }
  }

  /**
   * Дополнительные реквизиты
   * Массив дополнителных реквизитов (аналог подсистемы `Свойства` БСП) вычисляется через
   * ПВХ `НазначениеДополнительныхРеквизитов` или справочник `НазначениеСвойствКатегорийОбъектов`
   *
   * @type Array.<CchProperties>
   */
  get _extraProps() {
    const {cat, cch} = this._manager.root;
    // ищем предопределенный элемент, сответствующий классу данных
    const dests = cat.destinations || cch.destinations;
    const res = [];
    if(dests) {
      const condition = this._destinations_condition || {predefined_name: `${this instanceof DocObj ? 'Документ' : 'Справочник'}_${this._metadata().name}`};
      dests.find_rows(condition, destination => {
        const ts = destination.extra_fields;
        if(ts) {
          ts.each(row => {
            if(!row._deleted) {
              res.push(row.property);
            }
          });
        }
        return false;
      });
    }
    return res;
  }
}

/**
 * Абстрактный класс СправочникОбъект
 * @extends DataObj
 * @param {Object} attr - объект с реквизитами в свойствах или строка guid ссылки
 * @param manager {RefDataManager}
 */
export class CatObj extends DataObj {

  constructor(attr, manager, loading) {

    const direct = loading && attr && manager.utils.is.guid(attr.ref);

    // выполняем конструктор родительского объекта
    super(attr, manager, loading, direct);

    if(!direct) {
      manager.utils.mixin(this, attr, null, ['ref']);
    }

  }

  /**
   * Представление объекта
   * @property presentation
   * @for CatObj
   * @type String
   */
  get presentation() {
    return this.name || this.id || '';
  }

  /**
   * Код элемента справочника
   * @type String|Number
   */
  get id() {
    return this[get]('id');
  }
  set id(v) {
    this[set]('id', v);
  }

  /**
   * Наименование элемента справочника
   * @type String
   */
  get name() {
    return this[get]('name');
  }
  set name(v) {
    this[set]('name', v);
  }

  get parent() {
    return this._metadata().hierarchical ? this[get]('parent') : null;

  }
  set parent(v) {
    if(this._metadata().hierarchical) {
      this[set]('parent', v);
    }
  }

  get owner() {
    return this._metadata().hasOwners ? this[get]('owner') : null;
  }
  set owner(v) {
    if(this._metadata().hasOwners) {
      this[set]('owner', v);
    }
  }


  /**
   * Дети
   * Возвращает массив элементов, находящихся в иерархии текущего
   *
   * @param foldersOnly {Boolean}
   * @return {Array.<DataObj>}
   */
  _children(foldersOnly) {
    const res = [];
    this._manager.forEach((o) => {
      if(o != this && (!foldersOnly || o.isFolder) && o._hierarchy(this)) {
        res.push(o);
      }
    });
    return res;
  }

  /**
   * Родители
   * Возвращает массив родителей, в иерархии которых находится текущий элемент
   */
  _parents() {
    const res = [];
    let {parent} = this;
    while (parent && !parent.empty()) {
      res.push(parent);
      parent = parent.parent;
    }
    return res;
  }

  /**
   * В иерархии
   * Выясняет, находится ли текущий объект в указанной группе
   * @param group {Object|Array} - папка или массив папок
   */
  _hierarchy(group) {
    if(Array.isArray(group)) {
      return group.some((v) => this._hierarchy(v));
    }
    const {parent} = this;
    if(this == group || parent == group) {
      return true;
    }
    if(parent && !parent.empty()) {
      return parent._hierarchy(group);
    }
    return group == this._manager.utils.blank.guid;
  }

  /**
   * Для иерархических справочников возвращает путь элемента
   * @param ref {String|CatObj} - ссылка или объект данных
   * @return {string} - строка пути элемента
   */
  _path() {
    let tobj = this;
    const res = [{ref: tobj.ref, presentation: tobj.presentation}];

    while (true) {
      tobj = tobj.parent;
      if (!tobj || tobj.empty()) {
        break;
      }
      res.push({ref: tobj.ref, presentation: tobj.presentation});
    }

    return res;
  }

}

/**
 * Абстрактный класс ДокументОбъект
 * @extends DataObj
 * @param attr {Object} - объект с реквизитами в свойствах или строка guid ссылки
 * @param manager {RefDataManager}
 */
export class DocObj extends DataObj {

  constructor(attr, manager, loading) {

    const direct = loading && attr && manager.utils.is_guid(attr.ref);

    // выполняем конструктор родительского объекта
    super(attr, manager, loading, direct);

    if(!direct) {
      manager.utils.mixin(this, attr, null, ['ref']);
    }

  }

  /**
   * Представление объекта
   * @property presentation
   * @for DocObj
   * @type String
   */
  get presentation() {
    const meta = this._metadata();
    const {numberDoc, date, posted, _modified} = this;
    return numberDoc ?
      `${meta.obj_presentation || meta.synonym}  №${numberDoc} от ${moment(date).format(moment._masks.date_time)} (${posted ? '' : 'не '}проведен)${_modified ? ' *' : ''}`
      :
      `${meta.obj_presentation || meta.synonym} ${moment(date).format(moment._masks.date_time)} (${posted ? '' : 'не '}проведен)${_modified ? ' *' : ''}`;
  }

  /**
   * Номер документа
   * @property numberDoc
   * @type {String|Number}
   */
  get numberDoc() {
    return this[get]('numberDoc') || '';
  }
  set numberDoc(v) {
    this[notify]('numberDoc');
    this[set](numberDoc, v);
  }

  /**
   * Дата документа
   * @property date
   * @type {Date}
   */
  get date() {
    return this[get]('date') || '';
  }
  set date(v) {
    this[notify]('date');
    this[set]('date', v);
  }

  /**
   * Признак проведения
   * @property posted
   * @type Boolean
   */
  get posted() {
    return this._obj.posted || false;
  }
  set posted(v) {
    this[notify]('posted');
    this._obj.posted = this._manager.utils.fix.boolean(v);
  }

}


/**
 * @summary Абстрактный класс ОбработкаОбъект
 * @extends DataObj
 * @param attr {Object} - объект с реквизитами в свойствах или строка guid ссылки
 * @param manager {DataManager}
 */
export class DataProcessorObj extends DataObj {

  constructor(attr, manager, loading) {

    const direct = loading && attr && manager.utils.is.guid(attr.ref);

    // выполняем конструктор родительского объекта
    super(attr, manager, loading, direct);

    if(!direct) {
      manager.utils.mixin(this, attr, null, ['ref']);
    }
  }
}

/**
 * @summary Абстрактный класс значения перечисления
 * @desc Имеет fake-ссылку и прочие атрибуты объекта данных, но фактически - это просто значение перечисления
 *
 * @extends DataObj
 * @param attr {Object} - объект с реквизитами в свойствах или строка guid ссылки
 * @param manager {EnumManager}
 */
export class EnumObj extends DataObj {

  constructor(attr, manager, loading) {

    const {ref, ...other} = attr;
    // выполняем конструктор родительского объекта
    super(other, manager, loading, true);
    // дозаполняем при необходисомти
    if(!loading) {
      super._assign(other);
    }
  }

  /**
   * Порядок элемента перечисления
   * @property order
   * @for EnumObj
   * @type Number
   */
  get order() {
    return this[get]('order');
  }

  /**
   * Ссылка перечисления
   * @type {String}
   */
  get ref() {
    return this._manager.getRef(this);
  }

  /**
   * Имя элемента перечисления
   * @type String
   */
  get name() {
    return this[get]('name');
  }

  /**
   * Latin-имя элемента перечисления
   * @type String
   */
  get latin() {
    return this[get]('latin');
  }

  /**
   * Синоним элемента перечисления
   * @type String
   */
  get synonym() {
    return this[get]('synonym');
  }

  /**
   * Представление объекта
   * @property presentation
   * @for EnumObj
   * @type String
   */
  get presentation() {
    return this.synonym || this.name;
  }

  /**
   * Проверяет, является ли ссылка объекта пустой
   * @return {boolean} - true, если ссылка пустая
   */
  empty() {
    const {ref} = this;
    return !ref || ref == '_';
  }

  /**
   * Проверяет на равенство по имени
   * т.к. знаяения перечислений могут иметь синонимы,
   * метод `is()` - эффективнее прямого сравнения со строкой имени значения перечисления
   * @param name {String}
   * @return {Boolean}
   */
  is(name) {
    return this._manager[name] === this;
  }

  /**
   * Проверяет на вхождение в список
   * @param {Array.<String>|String} names
   * @return {boolean}
   */
  in(names) {
    if(typeof names === "string") {
      names = names.split(',').map(v => v.trim());
    }
    for(const name of names) {
      if(this.is(name)) {
        return true;
      }
    }
  }
}

/**
 * @summary Запись (строка) регистра
 * @desc Используется во всех типах регистров (сведений, накопления, бухгалтерии)
 *
 * @class RegisterRow
 * @extends DataObj
 * @constructor
 * @param attr {object} - объект, по которому запись будет заполнена
 * @param manager {InfoRegManager|AccumRegManager}
 */
export class RegisterRow extends DataObj {

  constructor(attr, manager, loading) {

    // выполняем конструктор родительского объекта
    super(attr, manager, loading);

    if(attr && typeof attr == 'object') {
      let tref = attr.ref;
      if(tref) {
        delete attr.ref;
      }
      manager.utils.mixin(this, attr);
      if(tref) {
        attr.ref = tref;
      }
    }

    for (const check in manager.metadata().dimensions) {
      if(!attr.hasOwnProperty(check) && attr.ref) {
        let keys = attr.ref.split('¶');
        Object.keys(manager.metadata().dimensions).forEach((fld, ind) => {
          this[fld] = keys[ind];
        });
        break;
      }
    }

  }

  /**
   * Метаданные строки регистра
   * @method _metadata
   * @for RegisterRow
   * @param field_name
   * @type Object
   */
  _metadata(field_name) {
    const _meta = this._manager.metadata();
    if(!_meta.fields) {
      _meta.fields = Object.assign({}, _meta.dimensions, _meta.resources, _meta.attributes);
    }
    return field_name ? _meta.fields[field_name] : _meta;
  }

  /**
   * Ключ записи регистра
   */
  get ref() {
    return this._manager.getRef(this);
  }

  set ref(v) {

  }

  get presentation() {
    return this._metadata().obj_presentation || this._metadata().synonym;
  }
}

/**
 * Aбстрактная строка табличной части
 *
 * @extends BaseDataObj
 * @param owner {TabularSection} - табличная часть, которой принадлежит строка
 */
export class TabularSectionRow extends BaseDataObj {

  /**
   * @summary Метаданые строки табличной части
   * @param {String} name - имя поля, данные которого интересуют
   * @return {MetaTabular|MetaField}
   */
  _metadata(name) {
    return this[own]._metadata(name);
  }

  get _manager() {
    return this[own]._manager;
  }

  get _data() {
    return this[own][own]._data;
  }

  /**
   * Номер строки табличной части
   * @type Number
   * @final
   */
  get row() {
    return this[own].indexOf(this) + 1;
  }

  get className() {
    return this._metadata().className;
  }

  /**
   * Копирует строку табличной части
   */
  clone() {
    const {_manager} = this;
    return _manager.utils.mixin(_manager.objConstructor(this[own]._name, this[own]), this);
  }

}

/**
 * Строка табчасти допреквизитов
 * @class
 */
export class ExtraFieldsRow extends TabularSectionRow {
  get property(){return this[get]('property')}
  set property(v){this[set]('property',v)}
  get value(){
    const {property: param} = this;
    return (param?.fetch_type && !param.empty()) ? param.fetch_type(this._obj.value) : this[get]('value');
  }
  set value(v) {
    if(typeof v === 'string' && v.length === 72 && this.property?.type?.types?.includes('cat.clrs')) {
      v = $p.cat.clrs.getter(v);
    }
    this[set]('value', v);
  }
  get txt_row(){return this[get]('txt_row')}
  set txt_row(v){this[set]('txt_row',v)}
}



