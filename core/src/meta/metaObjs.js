
import {own, alias, get, set, pascal} from './symbols';
import {enmFields} from '../system'
import camelcase from 'camelcase';

/**
 * Абстрактный класс со ссылкой на владельца
 */
export class OwnerObj {
  /**
   * Ссылка на владельца
   */
  #own;

  /**
   * Имя коллекции
   */
  #alias;

  constructor(owner, alias) {
    this.#own = owner;
    if(alias) {
      this.#alias = alias;
    }
  }

  get [own]() {
    return this.#own;
  }

  get [alias]() {
    return this.#alias || '';
  }

  toString() {
    return `${this[own].toString()}.${this[alias]}`;
  }
}

/**
 * @summary Описание метаданных объекта
 * @desc Не путать с виртуальным справочником CatMetaObjs
 * @class MetaObj
 */
export class MetaObj extends OwnerObj {

  /**
   *
   * @param {Meta} owner - Корень метаданных
   * @param {String} alias - Имя коллекции
   * @param {Object} raw - Сырое описание метаданных
   */
  constructor(owner, alias, raw) {

    super(owner, alias);

    if(Array.isArray(raw)) {
      this.values = [];
      for(const row of raw) {
        if('order' in row && row.name) {
          this.values.push(row);
        }
        else {
          for(const fld in row) {
            this[fld] = row[fld];
          }
        }
      }
      this.cachable = 'ram';
      this.fields = new MetaFields(this, enmFields);
    }
    else {
      let {fields, tabulars, tabular_sections, ...other} = raw;
      if(tabular_sections) {
        tabulars = tabular_sections;
      }
      this.fields = new MetaFields(this, fields);
      this.tabulars = new MetaTabulars(this, tabulars);
      Object.assign(this, other);
    }
  }

  get(field) {
    if(!field) {
      return this;
    }
    const {fields, tabulars} = this;
    if(fields[field]) {
      return fields[field];
    }
    else if(tabulars?.[field]) {
      return tabulars[field];
    }
    return this.system(field, fields);
  }

  get root() {
    return this[own][own][own];
  }

  get className() {
    return `${this[own][alias]}.${this[alias]}`;
  }

  get mgr() {
    return this[own][own].mgr(this.className);
  }

  toString() {
    const {root} = this;
    return `${root.msg.meta[this[own][alias]]}.${this.name}`;
  }

  system(field, fields) {

    const res = new MetaField(fields, field, {[field]: {
        multiline: false,
        note: '',
        synonym: '',
        tooltip: '',
        type: {types: ['string']},
      }});

    switch (field) {
      case 'presentation':
      case 'latin':
        res.synonym = 'Представление';
        return res;
      case '_deleted':
        res.synonym = 'Пометка удаления';
        res.type.types[0] = 'boolean';
        return res;
      case '_rev':
        res.synonym = 'Версия данных';
        return res;
      case 'ref':
        res.synonym = 'Ссылка';
        //res.type.types[0] = `${type[owner].name}.${type.name}`;
        return res;
    }

    switch (this[own][alias]) {
      case 'doc':
        switch (field) {
          case 'posted':
            res.synonym = 'Проведен';
            res.type.types[0] = 'boolean';
            return res;
          case 'date':
            res.synonym = 'Дата';
            res.tooltip = 'Дата документа';
            res.type.datePart = 'dateTime';
            res.type.types[0] = 'date';
            return res;
          case 'numberDoc':
            res.synonym = 'Номер';
            res.tooltip = 'Номер документа';
            res.type.strLen = 11;
            return res;
        }
      case 'cat':
      case 'cch':
        switch (field) {
          case 'isFolder':
            res.synonym = 'Это группа';
            res.type.types[0] = 'boolean';
            return res;
          case 'id':
            res.synonym = 'Код';
            res.mandatory = true;
            return res;
          case 'name':
            res.synonym = 'Наименование';
            res.mandatory = this.main_presentation_name;
            return res;
          case 'predefinedName':
            res.synonym = 'Имя предопределенных данных';
            return res;
        }
      case 'enm':
        switch (field) {
          case 'synonym':
            res.synonym = 'Синоним';
            return res;
        }
    }
    throw new Error(`Unknown field ${field} in ${this}`);
  }

  /**
   * @summary Возвращает список доступных печатных форм
   * @method printingPlates
   * @return {Object}
   */
  get printingPlates() {
    // if(pp) {
    //   for (const i in pp.doc) {
    //     this.#m.doc[i].printing_plates = pp.doc[i];
    //   }
    // }
    return {};
  }

  constructorBase() {
    const {[own]: {[alias]: category}, root, className} = this;
    const {Obj, Manager} = root[category];
    const {classes} = root;
    const {TabularSectionRow} = classes;
    const fnName = Manager.objConstructor(className);
    const managerName = `${fnName}Manager`;
    let text = `class ${fnName} extends Obj {\n`;

    // реквизиты по метаданным
    for (const fld in this.fields) {
      const mfld = this.fields[fld];
      text += `get ${fld}(){return this[get]('${fld}')}\n`;
      if(!mfld.readOnly) {
        text += `set ${fld}(v){this[set]('${fld}',v)}\n`;
      }
    }
    // табличные части по метаданным - устанавливаем геттер табличной части
    for (const ts in this.tabulars) {
      text += `get ${ts}(){return this[get]('${ts}')}\n`;
      text += `set ${ts}(v){this[get]('${ts}').load(v)}\n`;
    }
    text +=`};\nclasses.${fnName} = ${fnName};\n`;

    // реквизиты табчастей
    for (const ts in this.tabulars) {
      const fnName = Manager.objConstructor(className, ts);
      text += `class ${fnName} extends TabularSectionRow{\n`;
      for (const rf in this.tabulars[ts].fields) {
        text += `get ${rf}(){return this[get]('${rf}')}\n`;
        text += `set ${rf}(v){this[set]('${rf}',v)}\n`;
      }
      text += `}\n`;
      text += `classes.${fnName} = ${fnName};\n`;
    }

    text += `class ${managerName} extends Manager {};\n`;
    text +=`classes.${managerName} = ${managerName};\n`;

    const exec = new Function('get', 'set', 'classes', 'Obj', 'Manager', 'TabularSectionRow', text);
    exec(get, set, classes, Obj, Manager, TabularSectionRow);
  }
}

/**
 * @summary Описание метаданных поля
 * @desc Не путать с виртуальным справочником CatMetaFields
 * @class MetaField
 */
export class MetaField extends OwnerObj {
  constructor(owner, name, fields) {
    super(owner, name);
    const {type, ...other} = fields[name];
    this.type = type instanceof TypeDef ? type : new TypeDef(type);
    Object.assign(this, other);
  }

  toString() {
    return `${this[own].toString()}.${this.synonym}`;
  }

  fixSingle(v, type) {
    const {utils} = this[own][own].root;
    return utils.fix.type(v, type);
  }

  /**
   * @summary Синоним для совместимости с v2.1
   */
  get choice_params() {
    return this.choiceParams;
  }

  /**
   * @summary Синоним для совместимости с v2.1
   */
  get choice_links() {
    return this.choiceLinks;
  }

  /**
   * @summary Синоним для совместимости с v2.1
   */
  get choice_groups_elm() {
    return this.choiceGrp;
  }

}

/**
 * @summary Коллекция полей метаданных
 */
export class MetaFields extends OwnerObj {

  constructor(owner, fields) {
    super(owner);
    for(const name in fields) {
      this[name] = new MetaField(this, name, fields);
    }
  }

  toString() {
    const owner = this[own];
    const {msg} = owner.root;
    return `${owner.toString()}.${msg.meta.fields}`
  }

  mgr(id) {
    let owner = this[own];
    while (!(owner instanceof MetaObj)) {
      owner = owner[own];
    }
    return owner[own][own].mgr(id);
  }
}

/**
 * @summary Коллекция метаданных табличных частей
 */
export class MetaTabulars extends OwnerObj {
  constructor(owner, tabulars) {
    super(owner);
    for(const name in tabulars) {
      this[name] = new MetaTabular(this, name, tabulars);
    }
  }
}

/**
 * @summary Метаданные табчасти
 */
export class MetaTabular extends OwnerObj {
  constructor(owner, name, raw) {
    super(owner, name);
    const {fields, tabulars, ...other} = raw[name];
    this.fields = new MetaFields(this, fields);
    this.tabulars = new MetaTabulars(this, tabulars);
    Object.assign(this, other);
  }

  /**
   * Описание типа табчасти
   * @type {TypeDef}
   */
  get type() {
    return tabularType;
  }

  get(name) {
    return name ? (this.fields[name] || this.tabulars[name]) : this;
  }

  get className() {
    const owner = this[own][own];
    return `${owner.className}.${this[alias]}`;
  }

  get root() {
    return this[own][own].root;
  }

  /**
   * Приведением типа табчасти, является сама табчасть
   * @param {TabularSection} v
   * @return {TabularSection}
   */
  fixSingle(v) {
    return v;
  }
}

/**
 * @summary Описание типа
 */
export class TypeDef {
  constructor({date_part, str_len, str_fix, ...def}) {
    if(date_part) {
      def.datePart = camelcase(date_part, pascal);
    }
    if(str_len) {
      def.strLen = true;
    }
    if(str_fix) {
      def.strFix = true;
    }
    Object.assign(this, def);
  }

  /**
   * @summary Среди типов есть ссылочный
   * @type Boolean
   */
  get isRef() {
    return this.types.some(type => type.includes('.'));
  }

  /**
   * @summary Это JSON объект
   * @type Boolean
   */
  get isJson() {
    return this.types[0] === 'json';
  }

  /**
   * @summary Это табличная часть
   * @type Boolean
   */
  get isTabular() {
    return this.types[0] === 'tabular';
  }

  /**
   * @summary Это составной тип
   * @type Boolean
   */
  get isComposite() {
    return this.types.length > 1;
  }

  /**
   * @summary Этот тип не составной и ссылочный
   * @type Boolean
   */
  get isSingleRef() {
    return !this.isComposite && this.isRef;
  }

  /**
   * @summary Этот тип не составной и простой (строка, число, булево)
   * @type Boolean
   */
  get isSingleType() {
    return !this.isComposite && !this.isRef;
  }

  hasType(type) {
    for(const name of this.types) {
      if(type === name) {
        return true;
      }
      const parts = name.split('.');
      if(parts.length === 2) {
        if(type === `${parts[0]}.${camelcase(parts[1])}`) {
          return true;
        }
      }
    }
    return false;
  }

}

const tabularType = new TypeDef({types: ['tabular']});
