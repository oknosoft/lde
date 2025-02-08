import {own, string} from './symbols';
import {camelCase, pascalCase} from '../../lib/change-case';

export function typeDef(utils) {

  /**
   * @summary Описание типа
   */
  class TypeDef {
    constructor({date_part, str_len, str_fix, ...def}) {
      if(date_part) {
        def.datePart = pascalCase(date_part);
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

    /**
     * @summary Проверяет вхождение типа
     * @param {String} type
     * @return {Boolean}
     */
    hasType(type) {
      for(const name of this.types) {
        if(type === name) {
          return true;
        }
        const parts = name.split('.');
        if(parts.length === 2) {
          if(type === `${parts[0]}.${parts[1]}` || type === `${parts[0]}.${camelCase(parts[1])}`) {
            return true;
          }
        }
      }
      return false;
    }

    /**
     * @summary Проброс метода поиска менеджера данных по строке типа
     * @param {String} type
     * @return {DataManager}
     */
    mgr(type) {
      return utils[own].md.mgr(type);
    }

    /**
     * @summary Приведение типа
     * @param res
     * @param {Object} [obj] - сырые данные
     * @param {String} [f] - имя поля
     * @return {*}
     */
    fetchType(res, obj, f) {
      if(this.isTabular) {
        return res;
      }
      const {types} = this;
      // для простых типов, возвращаем почти в лоб
      if(this.isSingleType) {
        return utils.fix.type(res, this);
      }

      // для простых ссылочных, тоже почти в лоб
      if(this.isSingleRef) {
        return this.mgr(types[0]).get(res);
      }

      // для дальнейшего разбора, потребуется тип значения
      const rtype = typeof res;

      if(this.isJson) {
        // TODO: надо добиться, чтобы всегда
        if(rtype === string) {
          try {
            res = JSON.parse(res);
          }
          catch (e) {
            res = {};
          }
          return res;
        }
        return rtype === 'object' ? res : {};
      }


      // если доступны ссылочные и на входе строка
      if(this.isRef && rtype === string) {
        const parts = res.split('|');
        if(parts.length === 1) {
          if(utils.is.guid(res) && !utils.is.emptyGuid(res)) {
            for(const test of types) {
              if(test.includes('.')) {
                const mgr = this.mgr(test);
                const o = mgr.byRef(res);
                if(o) {
                  // TODO:
                  return o;
                }
              }
            }
          }
          else if(this.hasType(string)) {
            return res;
          }
        }
        else if(parts.length === 2) {
          const mgr = this.mgr(parts[0]);
          if(mgr) {
            return mgr.get(parts[1]);
          }
        }
      }

      if(rtype === 'object' && res instanceof this.constructor) {
        return res;
      }

      if(this.isRef) {

        if(this.digits && rtype === 'number') {
          return res;
        }

        if(this.hasOwnProperty('str_len') && !utils.is.guid(res)) {
          return res;
        }

        // затычка
        const mgr = this.mgr(types.find(v => v.includes('.') || types[0]));
        if(mgr) {
          return mgr.get(res);
        }

        // const mgr = _manager.value_mgr(_obj, f, this);
        // if(mgr) {
        //   if(utils.is.dataMgr(mgr)) {
        //     return mgr.get(res, false, false);
        //   }
        //   else {
        //     return utils.fetch_type(res, mgr);
        //   }
        // }

        if(res) {
          // управляемый лог
          //typeof utils.debug === 'function' && utils.debug([f, this, _obj]);
          return null;
        }

      }
      else if(this.datePart) {
        return utils.fix.date(res, true);
      }
      else if(this.digits) {
        return utils.fix.number(res, !this.hasOwnProperty('strLen'));
      }
      else if(types[0] == 'boolean') {
        return utils.fix.boolean(res);
      }
      else if(types[0] == 'json') {
        return rtype === 'object' ? res : {};
      }
      else {
        return res;
      }
    }

  }

  TypeDef.tabularType = new TypeDef({types: ['tabular']});

  return TypeDef;

}
