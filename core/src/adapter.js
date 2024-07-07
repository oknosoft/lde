
import MetaEventEmitter from './meta/emitter'
import {OwnerObj} from './meta/metaObjs';
import {own} from './meta/symbols';

const auth = {

  provider: '',
  username: '',
  password: '',
  user: null,

  headers(opts) {
    const {provider, username, password} = this;
    if(!opts.headers) {
      opts.headers = new Headers({Accept: 'application/json'});
    }
    if(provider === 'couchdb') {
      if(!opts.headers.has('Authorization') && username && password) {
        opts.headers.set('Authorization', `Basic ${btoa(unescape(encodeURIComponent(username + ':' + password)))}`);
      }
    }

    if(typeof sessionStorage === 'object' && sessionStorage.key('zone')) {
      const zone = sessionStorage.getItem('zone');
      if(zone) {
        //url = url.replace(/_\d\d_/, `_${zone}_`);
        opts.headers.set('zone', zone);
        opts.headers.set('branch', sessionStorage.getItem('branch'));
        opts.headers.set('impersonation', sessionStorage.getItem('impersonation'));
        opts.headers.set('year', sessionStorage.getItem('year'));
      }
    }

    if(!opts.headers.has('Content-Type')) {
      opts.headers.set('Content-Type', 'application/json');
    }

    return opts.headers;
  },

  get authorized() {
    return this.user;
  },

  providerSync(provider) {
    return ['couchdb', 'ldap'].includes(provider);
  }

}

export class DataAdapters extends OwnerObj {

  fetch(url, opts = {}) {
    auth.headers(opts)
    return fetch(url, opts);
  }

  emit() {

  }

  logIn({provider = 'couchdb', username, password}) {
    return new Promise((resolve, reject) => {
      if(auth.authorized) {
        reject(new Error('need logout first'));
      }
      if(auth.providerSync(provider) && (!username || !password)) {
        reject(new Error('empty login or password'));
      }
      Object.assign(auth, {provider, username, password});
      const timer = setTimeout(() => {
        reject(new Error('login timeout'));
      }, 10000);
      this.fetch('/auth/couchdb')
        .then((res) => res.json())
        .then((res) => {
          clearTimeout(timer);
          auth.user = this[own].cat.users.create(res, false, true);
          resolve(auth.user);
        })
        .catch((err) => {
          Object.assign(auth, {provider: '', username: '', password: '', user: null});
          reject(err);
        });
    });

  }

  logOut() {

  }

  /**
   * Загружает данные, которые не зависят от отдела абонента
   * @param {Object} attr
   * @return {Promise<never>|Promise<any>}
   */
  async loadСommon(attr) {

  }

  /**
   * Загружает данные после авторизации
   * @param {Object} attr
   * @return {Promise<never>|Promise<any>}
   */
  async loadRam(attr) {

  }
}

export default class AbstracrAdapter extends MetaEventEmitter {


	constructor(owner) {
		super(owner);
    this.attachment = {
      get() {},
      save() {},
      delete() {},
    };
	}

  /**
   * Читает сырые данные из базы данных по массиву ссылок
   *
   * @param {DataManager} mgr
   * @param {Array.<String>} refs
   * @return {Promise.<Array>}
   */
  load(mgr, refs) {
    return Promise.resolve([]);
  }

	/**
	 * Читает объект из внешней базы
	 *
	 * @param {DataObj} obj - объект данных, который необходимо прочитать - дозаполнить
	 * @return {Promise.<DataObj>} - промис с загруженным объектом
	 */
	loadObj(obj) {
		return Promise.resolve(obj);
	}

	/**
	 * Записывает объект в базу данных
	 *
	 * @param {DataObj} obj - записываемый объект
	 * @param {Object} attr - дополнительные параметры записи
	 * @return {Promise.<DataObj>} - промис с записанным объектом
	 */
	saveObj(obj, attr) {
		return Promise.resolve(obj);
	}

	/**
	 * Возвращает набор данных для дерева динсписка
	 *
	 * @param {DataManager} mgr
	 * @param {Object} [selection]
	 * @return {Promise.<Array>}
	 */
	tree(mgr, selection){
		return Promise.resolve([]);
	}

	/**
	 * Найти строки
	 * Возвращает массив дата-объектов, обрезанный отбором _selection_<br />
	 * Eсли отбор пустой, возвращаются все строки из PouchDB.
	 *
	 * @param {DataManager} _mgr
	 * @param selection {Object|function} - в ключах имена полей, в значениях значения фильтра или объект {like: "значение"} или {not: значение}
	 * @param {Number} [selection._top]
	 * @param {Number} [selection._skip]
	 * @param {Boolean} [selection._raw] - если _истина_, возвращаются сырые данные, а не дата-объекты
	 * @param {Boolean} [selection._total_count] - если _истина_, вычисляет общее число записей под фильтром, без учета _skip и _top
	 * @return {Promise.<Array>}
	 */
	rows(_mgr, selection) {
		return Promise.resolve([]);
	}
}
