/**
 * Глобальные переменные и общие методы фреймворка __metadata.js__ <i>Oknosoft data engine</i>
 *
 * Экспортирует глобальную переменную __$p__ типа {{#crossLink "MetaEngine"}}{{/crossLink}}
 * @module  metadata
 */

import MetaUtils from './utils';
import JobPrm from './jobprm';
import Meta from './meta';
import msg from './i18n.ru';
import classes from './classes';
import * as symbols from './meta/symbols';
import {DataAdapters} from './adapter'


/**
 * Metadata.js - проект с открытым кодом
 * Приглашаем к сотрудничеству всех желающих. Будем благодарны за любую помощь
 *
 * ### Почему Metadata.js?
 * Библиотека предназначена для разработки бизнес-ориентированных и учетных offline-first браузерных приложений
 * и содержит JavaScript реализацию [Объектной модели 1С](http://v8.1cru/overview/Platform.htm).
 * Библиотека эмулирует наиболее востребованные классы API 1С внутри браузера или Node.js, дополняя их средствами автономной работы и обработки данных на клиенте.
 *
 * ### Для кого?
 * Для разработчиков мобильных и браузерных приложений, которым близка парадигма 1С _на базе бизнес-объектов: документов и справочников_,
 * но которым тесно в рамках традиционной платформы 1С.<br />
 * Metadata.js предоставляет программисту:
 * - высокоуровневые [data-объекты](http://www.oknosoft.ru/upzp/apidocs/classes/DataObj.html), схожие по функциональности с документами, регистрами и справочниками платформы 1С
 * - инструменты декларативного описания метаданных и автогенерации интерфейса, схожие по функциональности с метаданными и формами платформы 1С
 * - средства событийно-целостной репликации и эффективные классы обработки данных, не имеющие прямых аналогов в 1С
 *
 */
class MetaEngine {

  static #plugins = [];

  constructor() {

    /**
     * Вспомогательные методы
     * @type MetaUtils
     */
    this.utils = new MetaUtils(this);

    /**
     * Адаптеры для PouchDB, Postgres и т.д.
     * @type Object
     * @final
     */
    this.adapters = new DataAdapters(this);

    /**
     * Параметры работы программы
     * @type JobPrm
     * @final
     */
    this.jobPrm = new JobPrm(this);

    /**
     * Mетаданные конфигурации
     * @type Meta
     * @final
     */
    this.md = new Meta(this);

    // начинаем следить за ошибками
    let emitter;
    if(typeof process !== 'undefined' && process.addEventListener) {
      emitter = process;
    }
    else if(typeof window !== 'undefined' && window.addEventListener) {
      emitter = window;
    }
    if(emitter) {
      emitter.addEventListener('error', this.utils.record_log, false);
      //emitter.addEventListener('unhandledRejection', this.record_log, false);
    }

    // при налчии расширений, выполняем их методы инициализации
    for(const plugin of MetaEngine.#plugins) {
      plugin.call(this);
    }

  }

  on(type, listener) {
    this.md.on(type, listener);
  }

  off(type, listener) {
    this.md.off(type, listener);
  }

  get version() {
    return PACKAGE_VERSION;
  }

  toString() {
    return 'Oknosoft data engine. v:' + this.version;
  }


  /**
   * i18n
   */
  get msg() {
    return msg;
  }

  /**
   * дублируем ссылку на конструкторы в объекте
   * @type {Object}
   */
  get classes() {
    return classes;
  };

  /**
   * дублируем ссылку на символы в объекте
   * @type {Object}
   */
  get symbols() {
    return symbols;
  };

  /**
   * дублируем ссылку на конструкторы в конструкторе
   * @type {Object}
   */
  static get classes() {
    return classes;
  };

  /**
   * дублируем ссылку на символы в конструкторе
   * @type {Object}
   */
  static get symbols() {
    return symbols;
  };

  /**
   * Текущий пользователь
   * Свойство определено после загрузки метаданных и входа впрограмму
   * @property current_user
   * @type CatUsers
   * @final
   */
  get current_user() {

    const {cat, superlogin, jobPrm, adapters: {pouch}} = this;

    // заглушка "всё разрешено", если методы acl не переопределены внешним приложением
    this.patchCatUsers();

    let user_name, user;
    if (cat && cat.users) {

      if(pouch && pouch.props._user) {
        user = cat.users.get(pouch.props._user);
      }
      else {
        if (superlogin) {
          const session = superlogin.getSession();
          user_name = session ? session.user_id : '';
        }

        if (!user_name) {
          user_name = jobPrm.get('user_name');
        }

        user = cat.users.by_id(user_name);
        if (!user || user.empty()) {
          if (superlogin) {
            // если superlogin, всю онформацию о пользователе получаем из sl_users
            user = superlogin.create_user();
          }
          else if(jobPrm.use_ram !== false) {
            cat.users.find_rows_remote({
              _top: 1,
              id: user_name,
            });
          }
        }
      }
    }

    return user && !user.empty() ? user : null;
  }

  patchCatUsers() {
    const {CatUsers} = this;

    // заглушка "всё разрешено", если методы acl не переопределены внешним приложением
    if (CatUsers && !CatUsers.prototype.hasOwnProperty('role_available')) {

      /**
       * ### Роль доступна
       *
       * @param name {String}
       * @returns {Boolean}
       */
      CatUsers.prototype.role_available = function (name) {
        return this.acl_objs ? this.acl_objs._obj.some((row) => row.type == name) : true;
      };

      /**
       * ### Права на класс данных
       * @param className
       * @return {string}
       */
      CatUsers.prototype.get_acl = function(className) {
        const {_acl} = this._obj;
        let res = 'rvuidepo';
        if(Array.isArray(_acl)){
          _acl.some((acl) => {
            if(acl.hasOwnProperty(className)) {
              res = acl[className];
              return true;
            }
          });
          return res;
        }
        else{
          const acn = className.split('.');
          return _acl && _acl[acn[0]] && _acl[acn[0]][acn[1]] ? _acl[acn[0]][acn[1]] : res;
        }
      };

      /**
       * ### Идентификаторы доступных контрагентов
       * Для пользователей с ограниченным доступом
       *
       * @returns {Array}
       */
      Object.defineProperty(CatUsers.prototype, 'partners_uids', {
        get: function () {
          const res = [];
          this.acl_objs && this.acl_objs.find_rows({type: 'cat.partners'}, ({acl_obj}) => acl_obj && res.push(acl_obj.ref));
          return res;
        },
      });
    }
  }

  /**
   * Подключает расширения metadata
   * Принимает в качестве параметра объект с полями `proto` и `constructor` типа _function_
   * proto выполняется в момент подключения, constructor - после основного конструктора при создании объекта
   *
   * @param obj
   * @return {MetaEngine}
   */
  static plugin(obj) {

    if (!obj) {
      throw new TypeError('Invalid empty plugin');
    }

    if (obj.hasOwnProperty('proto')) {
      if (typeof obj.proto == 'function') {         // function style for plugins
        obj.proto(MetaEngine);
      }
      else if (typeof obj.proto == 'object') {     // object style for plugins
        for(const id in obj.proto) {
          MetaEngine.prototype[id] = obj.proto[id];
        }
      }
    }

    if (obj.hasOwnProperty('constructor')) {
      if (typeof obj.constructor != 'function') {
        throw new TypeError('Invalid plugin: constructor must be a function');
      }
      MetaEngine.#plugins.push(obj.constructor);
    }

    return MetaEngine;
  }
}


export default MetaEngine;
