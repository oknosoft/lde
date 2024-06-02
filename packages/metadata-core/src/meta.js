/**
 * Метаданные на стороне js: конструкторы, заполнение, кеширование, поиск
 *
 * @module  metadata
 * @submodule meta_meta
 */

import MetaEventEmitter from './emitter';
import utils from './utils';
import {DataManager} from './mngrs';

/**
 * ### Описание метаданных объекта
 * Не путать с виртуальным справочником CatMeta_objs
 * @class MetaObj
 */
class MetaObj {

}

/**
 * ### Описание метаданных поля
 * Не путать с виртуальным справочником CatMeta_fields
 * @class MetaField
 */
class MetaField {

}

/**
 * ### Хранилище метаданных конфигурации
 * Важнейший объект `metadata.js`. Содержит описание всех классов данных приложения.<br />
 * По данным этого объекта, при старте приложения, формируются менеджеры данных, строятся динамические конструкторы объектов данных,
 * обеспечивается ссылочная типизация, рисуются автоформы объектов и списков.
 *
 * @class Meta
 * @static
 * @menuorder 02
 * @tooltip Описание метаданных
 */
class Meta extends MetaEventEmitter {

  constructor($p) {
    super();
    Object.defineProperties(this, {
      _m: {value: {}},
      $p: {get() {return $p}},
    });
    Meta._sys.forEach((patch) => utils._patch(this._m, patch));
    Meta._sys.length = 0;
  }

  /**
   * ### Инициализирует метаданные
   * загружает описание метаданных из локального или сетевого хранилища или из объекта, переданного в параметре
   *
   * @method init
   * @for Meta
   * @param [patch] {Object}
   */
  init(patch) {
    return utils._patch(this._m, patch);
  }

  /**
   * ### Возвращает описание объекта метаданных
   *
   * @method get
   * @param type {String|DataManager} - например, "doc.calc_order"
   * @param [field_name] {String}
   * @return {Object}
   */
  get(type, field_name) {
    const np = type instanceof DataManager ? [type._owner.name, type.name] : type.split('.');
    const np0 = this._m[np[0]];
    if(!np0) {
      return;
    }
    const _meta = np0[np[1]];
    if(!field_name) {
      return _meta;
    }
    else if(_meta && _meta.fields[field_name]) {
      return _meta.fields[field_name];
    }
    else if(_meta && _meta.tabular_sections && _meta.tabular_sections[field_name]) {
      return _meta.tabular_sections[field_name];
    }

    const res = {
        multiline_mode: false,
        note: '',
        synonym: '',
        tooltip: '',
        type: {
          is_ref: false,
          types: ['string'],
        },
      },
      is_doc = 'doc,tsk,bp'.includes(np[0]),
      is_cat = 'cat,cch,cacc,tsk'.includes(np[0]);

    if(is_doc && field_name == 'number_doc' && _meta.code_length) {
      res.synonym = 'Номер';
      res.tooltip = 'Номер документа';
      res.type.str_len = 11;
    }
    else if(is_doc && field_name == 'date') {
      res.synonym = 'Дата';
      res.tooltip = 'Дата документа';
      res.type.date_part = 'date_time';
      res.type.types[0] = 'date';
    }
    else if(is_doc && field_name == 'posted') {
      res.synonym = 'Проведен';
      res.type.types[0] = 'boolean';
    }
    else if(is_cat && field_name == 'id' && _meta.code_length) {
      res.synonym = 'Код';
      res.mandatory = true;
    }
    else if(is_cat && field_name == 'name') {
      res.synonym = 'Наименование';
      res.mandatory = _meta.main_presentation_name;
    }
    else if(field_name == '_area') {
      res.synonym = 'Область';
    }
    else if(field_name == 'presentation') {
      res.synonym = 'Представление';
    }
    else if(field_name == '_deleted') {
      res.synonym = 'Пометка удаления';
      res.type.types[0] = 'boolean';
    }
    else if(field_name == 'is_folder') {
      res.synonym = 'Это группа';
      res.type.types[0] = 'boolean';
    }
    else if(field_name == 'ref') {
      res.synonym = 'Ссылка';
      res.type.is_ref = true;
      if(type instanceof DataManager) {
        res.type._mgr = type;
        res.type.types[0] = `${type._owner.name}.${type.name}`;
      }
      else {
        res.type.types[0] = type;
      }
    }
    else {
      return;
    }

    return res;
  }

  /**
   * ### Возвращает структуру имён объектов метаданных конфигурации
   *
   * @method classes
   * @return {Object}
   */
  classes() {
    const res = {};
    for (const i in this._m) {
      res[i] = [];
      for (const j in this._m[i])
        res[i].push(j);
    }
    return res;
  }

  /**
   * ### Возвращает массив используемых баз
   *
   * @method bases
   * @return {Array}
   */
  bases() {
    const res = {};
    const {_m} = this;
    for (let i in _m) {
      for (let j in _m[i]) {
        if(_m[i][j].cachable) {
          let _name = _m[i][j].cachable.replace('_remote', '').replace('_ram', '').replace('_doc', '');
          if(_name != 'meta' && _name != 'templates' && _name != 'e1cib' && !res[_name]) {
            res[_name] = _name;
          }
        }
      }
    }
    return Object.keys(res);
  }

  /**
   * ### Возвращает англоязычный синоним строки
   * TODO: перенести этот метод в плагин
   *
   * @method syns_js
   * @param v {String}
   * @return {String}
   */
  syns_js(v) {
    const synJS = {
      DeletionMark: '_deleted',
      Description: 'name',
      DataVersion: 'data_version',    // todo: не сохранять это поле в pouchdb
      IsFolder: 'is_folder',
      Number: 'number_doc',
      Date: 'date',
      Дата: 'date',
      Posted: 'posted',
      Code: 'id',
      Parent_Key: 'parent',
      Owner_Key: 'owner',
      Owner: 'owner',
      Ref_Key: 'ref',
      Ссылка: 'ref',
      LineNumber: 'row',
    };
    return synJS[v] || this._m.syns_js[this._m.syns_1с.indexOf(v)] || v;
  }

  /**
   * ### Возвращает русскоязычный синоним строки
   * TODO: перенести этот метод в плагин
   *
   * @method syns_1с
   * @param v {String}
   * @return {String}
   */
  syns_1с(v) {
    const syn1c = {
      _deleted: 'DeletionMark',
      name: 'Description',
      is_folder: 'IsFolder',
      number_doc: 'Number',
      date: 'Date',
      posted: 'Posted',
      id: 'Code',
      ref: 'Ref_Key',
      parent: 'Parent_Key',
      owner: 'Owner_Key',
      row: 'LineNumber',
    };
    return syn1c[v] || this._m.syns_1с[this._m.syns_js.indexOf(v)] || v;
  }

  /**
   * ### Возвращает список доступных печатных форм
   * @method printing_plates
   * @return {Object}
   */
  printing_plates(pp) {
    if(pp) {
      for (const i in pp.doc) {
        this._m.doc[i].printing_plates = pp.doc[i];
      }
    }
  }

  /**
   * ### Возвращает менеджер объекта по имени класса
   * @method mgr_by_class_name
   * @param class_name {String}
   * @return {DataManager|undefined}
   * @private
   */
  mgr_by_class_name(class_name) {
    if(class_name) {
      const {$p} = this;
      let np = class_name.split('.');
      if(np[1] && $p[np[0]]) {
        return $p[np[0]][np[1]];
      }
      const pos = class_name.indexOf('_');
      if(pos) {
        np = [class_name.substr(0, pos), class_name.substr(pos + 1)];
        if(np[1] && $p[np[0]]) {
          return $p[np[0]][np[1]];
        }
      }
    }
  }

  /**
   * ### Создаёт строку SQL с командами создания таблиц для всех объектов метаданных
   * @method create_tables
   */
  create_tables(callback, attr) {

    const {$p} = this;
    const data_names = [];
    const managers = this.classes();

    let cstep = 0, create = (attr && attr.postgres) ? '' : 'USE md; ';

    function on_table_created() {

      cstep--;
      if(cstep == 0) {
        if(callback) {
          callback(create);
        }
        else {
          $p.wsql.alasql.utils.saveFile('create_tables.sql', create);
        }
      }
      else {
        iteration();
      }
    }

    function iteration() {
      const data = data_names[cstep - 1];
      if(data.class[data.name]) {
        create += data.class[data.name].get_sql_struct(attr) + '; ';
      }
      on_table_created();
    }

    // TODO переписать на промисах и генераторах и перекинуть в синкер
    for (let mgr of 'enm,cch,cacc,cat,bp,tsk,doc,ireg,areg'.split(',')) {
      for (let class_name in managers[mgr]) {
        data_names.push({'class': $p[mgr], 'name': managers[mgr][class_name]});
      }
    }
    cstep = data_names.length;

    iteration();
  }

  /**
   * ### Возвращает тип поля sql для типа данных
   *
   * @method sql_type
   * @param mgr {DataManager}
   * @param f {String}
   * @param mf {Object} - описание метаданных поля
   * @param pg {Boolean} - использовать синтаксис postgreSQL
   * @return {*}
   */
  sql_type(mgr, f, mf, pg) {
    var sql;
    if((f == 'type' && mgr.table_name == 'cch_properties') || (f == 'svg' && mgr.table_name == 'cat_production_params')) {
      sql = ' JSON';
    }
    else if(mf.is_ref || mf.types.indexOf('guid') != -1) {
      if(!pg) {
        sql = ' CHAR';
      }
      else if(mf.types.every((v) => v.indexOf('enm.') == 0)) {
        sql = ' character varying(100)';
      }
      else if(!mf.hasOwnProperty('str_len')) {
        sql = ' uuid';
      }
      else {
        sql = ' character varying(' + Math.max(36, mf.str_len) + ')';
      }

    }
    else if(mf.hasOwnProperty('str_len')) {
      sql = pg ? (mf.str_len ? ' character varying(' + mf.str_len + ')' : ' text') : ' CHAR';
    }
    else if(mf.date_part) {
      if(!pg || mf.date_part == 'date') {
        sql = ' Date';
      }
      else if(mf.date_part == 'date_time') {
        sql = ' timestamp with time zone';
      }
      else {
        sql = ' time without time zone';
      }
    }
    else if(mf.hasOwnProperty('digits')) {
      if(mf.fraction == 0) {
        sql = pg ? (mf.digits < 7 ? ' integer' : ' bigint') : ' INT';
      }
      else {
        sql = pg ? (' numeric(' + mf.digits + ',' + mf.fraction + ')') : ' FLOAT';
      }

    }
    else if(mf.types.indexOf('boolean') != -1) {
      sql = ' BOOLEAN';
    }
    else if(mf.types.indexOf('json') != -1) {
      sql = ' JSON';
    }
    else {
      sql = pg ? ' character varying(255)' : ' CHAR';
    }

    return sql;
  }

  /**
   * ### Заключает имя поля в аппострофы
   * @method sql_mask
   * @param f
   * @param t
   * @return {string}
   * @private
   */
  sql_mask(f, t) {
    //var mask_names = ["delete", "set", "value", "json", "primary", "content"];
    return ', ' + (t ? '_t_.' : '') + ('`' + f + '`');
  }

  /**
   * ### Возвращает структуру для инициализации таблицы на форме
   * TODO: перенести этот метод в плагин
   *
   * @method ts_captions
   * @param class_name
   * @param ts_name
   * @param source
   * @return {boolean}
   */
  ts_captions(class_name, ts_name, source) {
    if(!source) {
      source = {};
    }

    var mts = this.get(class_name).tabular_sections[ts_name],
      mfrm = this.get(class_name).form,
      fields = mts ? mts.fields : {}, mf;

    // если имеются метаданные формы, используем их
    if(mfrm && mfrm.obj) {

      if(!mfrm.obj.tabular_sections[ts_name]) {
        return;
      }

      utils._mixin(source, mfrm.obj.tabular_sections[ts_name]);

    }
    else {

      if(ts_name === 'contact_information') {
        fields = {type: '', kind: '', presentation: ''};
      }

      source.fields = ['row'];
      source.headers = '№';
      source.widths = '40';
      source.min_widths = '';
      source.aligns = '';
      source.sortings = 'na';
      source.types = 'cntr';

      for (var f in fields) {
        mf = mts.fields[f];
        if(!mf.hide) {
          source.fields.push(f);
          source.headers += ',' + (mf.synonym ? mf.synonym.replace(/,/g, ' ') : f);
          source.types += ',' + this.control_by_type(mf.type);
          source.sortings += ',na';
        }
      }
    }

    return true;

  }

  /**
   * ### Возвращает имя класса по полному имени объекта метаданных 1С
   * TODO: перенести этот метод в плагин
   *
   * @method class_name_from_1c
   * @param name
   */
  class_name_from_1c(name) {

    var pn = name.split('.');
    if(pn.length == 1) {
      return 'enm.' + name;
    }
    else if(pn[0] == 'Перечисление') {
      name = 'enm.';
    }
    else if(pn[0] == 'Справочник') {
      name = 'cat.';
    }
    else if(pn[0] == 'Документ') {
      name = 'doc.';
    }
    else if(pn[0] == 'РегистрСведений') {
      name = 'ireg.';
    }
    else if(pn[0] == 'РегистрНакопления') {
      name = 'areg.';
    }
    else if(pn[0] == 'РегистрБухгалтерии') {
      name = 'accreg.';
    }
    else if(pn[0] == 'ПланВидовХарактеристик') {
      name = 'cch.';
    }
    else if(pn[0] == 'ПланСчетов') {
      name = 'cacc.';
    }
    else if(pn[0] == 'Обработка') {
      name = 'dp.';
    }
    else if(pn[0] == 'Отчет') {
      name = 'rep.';
    }

    return name + this.syns_js(pn[1]);

  }

  /**
   * ### Возвращает полное именя объекта метаданных 1С по имени класса metadata
   * TODO: перенести этот метод в плагин
   *
   * @method class_name_to_1c
   * @param name
   */
  class_name_to_1c(name) {

    var pn = name.split('.');
    if(pn.length == 1) {
      return 'Перечисление.' + name;
    }
    else if(pn[0] == 'enm') {
      name = 'Перечисление.';
    }
    else if(pn[0] == 'cat') {
      name = 'Справочник.';
    }
    else if(pn[0] == 'doc') {
      name = 'Документ.';
    }
    else if(pn[0] == 'ireg') {
      name = 'РегистрСведений.';
    }
    else if(pn[0] == 'areg') {
      name = 'РегистрНакопления.';
    }
    else if(pn[0] == 'accreg') {
      name = 'РегистрБухгалтерии.';
    }
    else if(pn[0] == 'cch') {
      name = 'ПланВидовХарактеристик.';
    }
    else if(pn[0] == 'cacc') {
      name = 'ПланСчетов.';
    }
    else if(pn[0] == 'dp') {
      name = 'Обработка.';
    }
    else if(pn[0] == 'rep') {
      name = 'Отчет.';
    }

    return name + this.syns_1с(pn[1]);

  }

  /**
   * @summary Возвращает связанные ссылки глубоким перебором
   * @desc За исключением типов, перечисленных в `excludeTypes`
   * @param {Array|Set.<DataObj>} objs
   * @param {Set.<DataObj>} [set]
   * @param {Array.<String>} [excludeTypes]
   * @return {Set}
   */
  links({objs, set, excludeTypes = []}) {
    if(!set) {
      set = new Set();
    }
    if(Array.isArray(objs)) {
      objs = new Set(objs);
    }
    for(const o of objs) {
      if(!set.has(o)) {
        set.add(o);
        const tmp = o._links(set, excludeTypes);
        this.links({objs: tmp, set, excludeTypes});
      }
    }
    return set;
  }
}

/**
 * ### Системные метаданные
 * Это свойство наполняют плагины и оно используется в prebuild.js
 * @type {Array}
 * @private
 */
Meta._sys = [{
  enm: {
    accumulation_record_type: [
      {
        order: 0,
        name: 'debit',
        synonym: 'Приход',
      },
      {
        order: 1,
        name: 'credit',
        synonym: 'Расход',
      },
      {
        tag: 'Вид движения регистра накопления',
        description: 'Системное перечисление',
      },
    ],
  },
  ireg: {
    log: {
      name: 'log',
      note: '',
      synonym: 'Журнал событий',
      dimensions: {
        date: {
          synonym: 'Дата',
          tooltip: 'Время события',
          type: {types: ['number'], digits: 15, fraction: 0},
        },
        sequence: {
          synonym: 'Порядок',
          tooltip: 'Порядок следования',
          type: {types: ['number'], digits: 6, fraction: 0},
        },
      },
      resources: {
        'class': {
          synonym: 'Класс',
          tooltip: 'Класс события',
          type: {types: ['string'], str_len: 100},
        },
        note: {
          synonym: 'Комментарий',
          multiline_mode: true,
          tooltip: 'Текст события',
          type: {types: ['string'], str_len: 0},
        },
        obj: {
          synonym: 'Объект',
          multiline_mode: true,
          tooltip: 'Объект, к которому относится событие',
          type: {types: ['string'], str_len: 0},
        },
        user: {
          synonym: 'Пользователь',
          tooltip: 'Пользователь, в сеансе которого произошло событие',
          type: {types: ['string'], str_len: 100},
        },
      },
    },
    log_view: {
      name: 'log_view',
      note: '',
      synonym: 'Просмотр журнала событий',
      dimensions: {
        key: {
          synonym: 'Ключ',
          tooltip: 'Ключ события',
          type: {types: ['string'], str_len: 100},
        },
        user: {
          synonym: 'Пользователь',
          tooltip: 'Пользователь, отметивыший событие, как просмотренное',
          type: {types: ['string'], str_len: 100},
        },
      },
    },
  },
}];

/**
 * ### Служебные поля, которые сохраняем при прочистке
 * @type {string[]}
 */
Meta._sys_fields = ['zone','zones','direct_zones','id','number_doc','date','parent'];
Meta.Obj = MetaObj;
Meta.Field = MetaField;

export default Meta;

