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
   * дублируем ссылку на конструкторы в конструкторе
   * @type {Object}
   */
  static get classes() {
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
   * дублируем ссылку на символы в конструкторе
   * @type {Object}
   */
  static get symbols() {
    return symbols;
  };

  /**
   * Текущий пользователь
   * Свойство определено после загрузки метаданных и входа в программу
   * @property currentUser
   * @type CatUsers
   * @final
   */
  get currentUser() {
    const {cat, jobPrm, adapters: {pouch}} = this;
    let user;
    if (cat && cat.users) {

      if(pouch && pouch.props._user) {
        user = cat.users.get(pouch.props._user);
      }
      else {
        const userName = jobPrm.get('userName');
        user = userName && cat.users.byId(userName);
      }
    }
    return user && !user.empty() ? user : null;
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
