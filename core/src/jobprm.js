import {OwnerObj} from './meta/metaObjs';
import {own} from './meta/symbols';

/**
 * Параметры работы программы
 * они же - параметры сеанса. БОльшая часть, заполняется из `cch.predefined_elmnts`
 */
export default class JobPrm extends OwnerObj {

  #params = {};

  /**
   * @param {MetaEngine} owner
   */
	constructor(owner) {
    super(owner);

    /**
     * Сюда внешний скрипт должен положить префикс проекта
     * @type {String}
     */
		this.lsPrefix = '';

    /**
     * Сюда внешний скрипт может положить умолчания параметров
     * @type {Array|null}
     */
    this.additionalPrms = null;
	}

	init(settings) {
		// подмешиваем параметры, заданные в файле настроек сборки
    if (typeof settings == 'function') {
      settings(this);
    }
    // префикс параметров LocalStorage
    if (!this.lsPrefix){
      throw new Error('lsPrefix unset in jobPrm settings');
    }

    // если зона не указана, устанавливаем "1"
    let zone = this.get('zone', 'number');
    if(!zone) {
      zone = this.hasOwnProperty('zone') ? this.zone : 1;
    }

    // значения базовых параметров по умолчанию
    const nesesseryPrms = [{p: 'zone', v: zone, t: 'number'}];

    // подмешиваем id браузера
    if(!this.isSet('browser_uid')) {
      nesesseryPrms.push({p: 'browser_uid', v: this[own].utils.generateGuid(), t: 'string'});
    }

    // подмешиваем к базовым параметрам настройки приложения
    if(Array.isArray(this.additionalPrms)) {
      this.additionalPrms.forEach((v) => nesesseryPrms.push(v));
    }

    // дополняем хранилище недостающими параметрами
    for(const prm of nesesseryPrms) {
      if ('ls' in prm && this.isSet(prm.p)){
        const v = this.get(prm.p, prm.t);
        if(this[prm.p] !== v) {
          this[prm.p] = v;
        }
      }
      else if (!this.isSet(prm.p)){
        this.set(prm.p, this.fetchType(this.hasOwnProperty(prm.p) ? this[prm.p] : prm.v, prm.t));
      }
    }

    // задаём параметры сессии
    if(typeof sessionStorage === 'object' && !sessionStorage.key('zone')) {
      sessionStorage.setItem('zone', zone);         // number
      sessionStorage.setItem('branch', '');         // guid
      sessionStorage.setItem('impersonation', '');  // guid
      sessionStorage.setItem('year', '');           // number
    }
	}

  /**
   * Обёрнутый localStorage
   * @type {Storage}
   * @private
   */
  get _ls() {
    if(typeof localStorage === 'undefined') {
      if(!this.__ls) {
        this.__ls = {
          setItem(name, value) {},
          getItem(name) {}
        };
      }
      return this.__ls;
    }
    return localStorage;
  }

  /**
   * Устанавливает параметр в user_params и localStorage
   *
   * @param {string} name - имя параметра
   * @param value {string|number|object|boolean} - значение
   * @async
   */
  set(name, value) {

    const {_ls, lsPrefix} = this;

    if(typeof value === 'object') {
      this.#params[name] = value;
      value = JSON.stringify(value);
    }
    else if(value === false || value === 'false') {
      this.#params[name] = false;
      value = '';
    }
    else {
      this.#params[name] = value;
    }

    _ls.setItem(lsPrefix + name, value);
  }

  /**
   * Возвращает значение сохраненного параметра из localStorage
   * Параметр извлекается с приведением типа
   *
   * @param {String} name - имя параметра
   * @param {String} [type] - имя типа параметра. Если указано, выполняем приведение типов
   * @return {*} - значение параметра
   */
  get(name, type){
    const {_ls, lsPrefix} = this;
    if(!this.#params.hasOwnProperty(name)){
      this.#params[name] = this.fetchType(_ls.getItem(lsPrefix+name), type);
    }
    return this.#params[name];
  }

  /**
   * Проверяет, установлено ли свойство
   * @param {String} name
   * @return {boolean}
   */
  isSet(name) {
    const {_ls, lsPrefix} = this;
    return this.#params.hasOwnProperty(name) || (_ls.hasOwnProperty(lsPrefix+name))
  }

  /**
   * Сохраняет настройки формы или иные параметры объекта _options_
   * @param {String} prefix - имя области
   * @param {Object} options - сохраняемые параметры
   */
  saveOptions(prefix, options) {
    return this.set(prefix + '_' + options.name, options);
  }

  /**
   * Восстанавливает сохраненные параметры в объект _options_
   * @param prefix {String} - имя области
   * @param options {Object} - объект, в который будут записаны параметры
   */
  restoreOptions(prefix, options){
    const saved = this.get(prefix + "_" + options.name, "object");
    for(let i in saved){
      if(typeof saved[i] != "object"){
        options[i] = saved[i];
      }
      else{
        if(!options[i]){
          options[i] = Array.isArray(saved[i]) ? [] : {};
        }
        for(let j in saved[i]){
          options[i][j] = saved[i][j];
        }
      }
    }
    return options;
  }

  /**
   * Приведение типов при операциях с `localStorage`
   * @param prm
   * @param type
   * @returns {*}
   */
  fetchType(prm, type){
    const {fix} = this[own].utils;
    if(type === "object"){
      try{
        prm = JSON.parse(prm);
      }catch(e){
        prm = {};
      }
      return prm;
    }
    else if(type === "number"){
      return fix.number(prm, true);
    }
    else if(type === "date"){
      return fix.date(prm, true);
    }
    else if(type === "boolean"){
      return fix.boolean(prm);
    }
    else if(type === "string"){
      return prm ? prm.toString() : '';
    }
    return prm;
  }

}
