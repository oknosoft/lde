
import {DataManager, EnumManager} from './mngrs';
import {DataObj, DocObj} from './objs';
import {TabularSection, TabularSectionRow} from './tabulars';

// UUID
const {v1: uuidv1} = require('uuid');

// Moment для операций с интервалами и датами
const moment = require('moment');
require('moment/locale/ru');
moment.locale('ru');
moment._masks = {
	date: 'DD.MM.YY',
	date_time: 'DD.MM.YYYY HH:mm',
	ldt: 'DD MMM YYYY, HH:mm',
	iso: 'YYYY-MM-DDTHH:mm:ss',
};
if(typeof global != 'undefined'){
  global.moment = moment;
}

const ctnames = '$eq,between,$between,$gte,gte,$gt,gt,$lte,lte,$lt,lt,ninh,inh,nin,$nin,in,$in,not,ne,$ne,nlk,lke,like,or,$or,$and'.split(',');

/**
 * Отбрасываем часовой пояс при сериализации даты
 * @method toJSON
 * @for Date
 */
Date.prototype.toJSON = function () {return moment(this).format(moment._masks.iso)};

/**
 * Метод округления в прототип числа
 * @method round
 * @for Number
 */
if (!Number.prototype.round) {
	Number.prototype.round = function (places) {
		const multiplier = Math.pow(10, places || 0);
		return (Math.round(this * multiplier) / multiplier);
	};
}

/**
 * Метод дополнения лидирующими нулями в прототип числа
 * @method pad
 * @for Number
 *
 * @example
 *      (5).pad(6) // '000005'
 */
if (!Number.prototype.pad) {
	Number.prototype.pad = function (size) {
		let s = String(this);
		while (s.length < (size || 2)) {
			s = '0' + s;
		}
		return s;
	};
}

/**
 * Создаёт копию объекта
 * @method _clone
 * @for Object
 * @param src {Object|Array} - исходный объект
 * @param [exclude] {Array} - объект, в ключах которого имена свойств, которые не надо копировать
 * @returns {Object|Array} - копия объекта
 */
if (!Object.prototype._clone) {
	Object.defineProperty(Object.prototype, '_clone', {
		value() {
			return utils._clone(this);
		},
    configurable: true,
    writable: true,
	});
}

/**
 * Копирует все свойства из src в текущий объект исключая те, что в цепочке прототипов src до Object
 * @method _mixin
 * @for Object
 * @param src {Object} - источник
 * @param include {Array}
 * @param exclude {Array}
 * @return {Object}
 */
if (!Object.prototype._mixin) {
	Object.defineProperty(Object.prototype, '_mixin', {
		value: function (src, include, exclude) {
			return utils._mixin(this, src, include, exclude);
		},
	});
}

/**
 * Синтаксический сахар для defineProperty
 * @method __define
 * @for Object
 */
if (!Object.prototype.__define) {
	Object.defineProperty(Object.prototype, '__define', {
		value: function (key, descriptor) {
			if (descriptor) {
				Object.defineProperty(this, key, descriptor);
			} else {
				Object.defineProperties(this, key);
			}
			return this;
		},
	});
}

const date_frmts = ['DD-MM-YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY HH:mm', 'DD-MM-YYYY HH:mm:ss', 'DD-MM-YY HH:mm', 'YYYYDDMMHHmmss', 'YYYY-MM-DDTHH:mm:ss[Z]',
   'DD.MM.YYYY', 'DD.MM.YYYY HH:mm', 'DD.MM.YYYY HH:mm:ss', 'DD.MM.YY HH:mm'];

const rxref = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

/**
 * ### Коллекция вспомогательных методов
 * @class Utils
 * @static
 * @menuorder 35
 * @tooltip Вспомогательные методы
 */
const utils = {

	moment,

  /**
   * выпускаем наружу методы из библиотеки uuid, чтобы с версиями импорта не париться
   */
  rnd: {
    crypto: typeof crypto !== 'undefined' ? crypto : require('crypto'),
    rnds16: new Uint16Array(32),
    counter: 0,

    // массив случайных чисел
    rngs() {
      const {rnds16, crypto} = this;
      return crypto.getRandomValues ? crypto.getRandomValues(rnds16) : crypto.randomFillSync(rnds16);
    },

    // случайное число с помощью Crypto
    random() {
      if(!this.counter) {
        this.rngs();
      }
      this.counter++;
      if(this.counter > 31) {
        this.counter = 0;
      }
      return this.rnds16[this.counter];
    },

  },

  /**
   * методы создания и чтения сжатых данных
   */
  deflate: {
    // base64 to buffer
    base64ToBufferAsync(base64) {
      const dataUrl = 'data:application/octet-binary;base64,' + base64;
      return fetch(dataUrl)
        .then(res => res.arrayBuffer())
        .then(buffer => new Uint8Array(buffer));
    },
    // buffer to base64
    bufferToBase64Async(buffer) {
      return new Promise((resolve) => {
        const fileReader = new FileReader();
        fileReader.onload = function (r) {
          const dataUrl = fileReader.result;
          const base64 = dataUrl.substr(dataUrl.indexOf(',') + 1);
          resolve(base64);
        };
        const blob = new Blob([buffer], {type: 'application/octet-binary'});
        fileReader.readAsDataURL(blob);
      });
    },

    /**
     * Сжимает строку в Uint8Array
     * @param string {String}
     * @return {Promise<Uint8Array>}
     */
    compress(string) {
      const byteArray = new TextEncoder().encode(string);
      const cs = new CompressionStream('deflate');
      const writer = cs.writable.getWriter();
      writer.write(byteArray);
      writer.close();
      return new Response(cs.readable)
        .arrayBuffer()
        .then((buffer) => new Uint8Array(buffer));
    },

    /**
     * Извлекает строку из сжатого Uint8Array
     * @param byteArray {Uint8Array}
     * @return {Promise<string>}
     */
    decompress(byteArray) {
      const cs = new DecompressionStream('deflate');
      const writer = cs.writable.getWriter();
      writer.write(byteArray);
      writer.close();
      return new Response(cs.readable)
        .arrayBuffer()
        .then((arrayBuffer) => new TextDecoder().decode(arrayBuffer));
    }
  },

  /**
   * Отложенное выполнение с подавлением дребезга
   * @param func {Function}
   * @param wait {Number}
   * @return {debounced}
   */
  debounce(func, wait = 166) {
    let timeout;

    function debounced(...args) {
      // eslint-disable-next-line consistent-this
      const that = this;

      const later = () => {
        func.apply(that, args);
      };

      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    }

    debounced.clear = () => {
      clearTimeout(timeout);
    };

    return debounced;
  },

  /**
   * Возвращает функцию для сортировки массива объектов по полю fld
   * @param fld {String}
   * @return {(function(*, *): (number))|*}
   */
  sort(fld, desc) {
    return desc ?
      (a, b) => {
        if(a[fld] < b[fld]) {
          return 1;
        }
        else if(a[fld] > b[fld]) {
          return -1;
        }
        else {
          return 0;
        }
      }
      :
      (a, b) => {
        if(a[fld] < b[fld]) {
          return -1;
        }
        else if(a[fld] > b[fld]) {
          return 1;
        }
        else {
          return 0;
        }
      };
  },

  /**
   * Загружает скрипты и стили синхронно и асинхронно
   * @method load_script
   * @for MetaEngine
   * @param src {String} - url ресурса
   * @param type {String} - "link" или "script"
   * @param [callback] {Function} - функция обратного вызова после загрузки скрипта
   * @async
   */
  load_script(src, type, callback) {

    return new Promise((resolve, reject) => {

      const r = setTimeout(reject, 20000);

      const s = document.createElement(type);
      if (type === 'script') {
        s.type = 'text/javascript';
        s.src = src;
        s.async = true;
        const listener = () => {
          s.removeEventListener('load', listener);
          callback && callback();
          clearTimeout(r);
          resolve();
        };
        s.addEventListener('load', listener, false);
      }
      else {
        s.type = 'text/css';
        s.rel = 'stylesheet';
        s.href = src;
      }
      document.head.appendChild(s);

      if(type !== 'script') {
        clearTimeout(r);
        resolve();
      }

    });
  },

	/**
	 * ### Приводит значение к типу Дата
	 *
	 * @method fix_date
	 * @param str {String|Number|Date} - приводиме значение
	 * @param [strict=false] {Boolean} - если истина и значение не приводится к дате, возвращать пустую дату
	 * @return {Date|*}
	 */
	fix_date(str, strict) {
		if (str instanceof Date || (!strict && (this.is_guid(str) || (str && (str.length === 11 || str.length === 9))))){
      return str;
    }
		else {
			const m = moment(str, date_frmts);
			return m.isValid() ? m.toDate() : (strict ? this.blank.date : str);
		}
	},

	/**
	 * ### Извлекает guid из строки или ссылки или объекта
	 *
	 * @method fix_guid
	 * @param ref {*} - значение, из которого надо извлечь идентификатор
	 * @param generate {Boolean} - указывает, генерировать ли новый guid для пустого значения
	 * @return {String}
	 */
	fix_guid(ref, generate) {

		if (ref && typeof ref == 'string') {

		}
		else if (ref instanceof DataObj) {
			return ref.ref;
		}
		else if (ref && typeof ref == 'object') {
			if (ref.hasOwnProperty('presentation')) {
				if (ref.hasOwnProperty('ref')){
          return ref.ref || this.blank.guid;
        }
				else if (ref.hasOwnProperty('name')){
          return ref.name;
        }
			}
			else {
				ref = (typeof ref.ref == 'object' && ref.ref.hasOwnProperty('ref')) ? ref.ref.ref : ref.ref;
			}
		}

		if (generate === false || this.is_guid(ref)) {
			return ref;
		}
		else if (generate) {
			return this.generate_guid();
		}
		return this.blank.guid;
	},

	/**
	 * ### Приводит значение к типу Число
	 *
	 * @method fix_number
	 * @param str {*} - приводиме значение
	 * @param [strict=false] {Boolean} - конвертировать NaN в 0
	 * @return {Number}
	 */
	fix_number(str, strict) {
	  if(typeof str === 'number') {
      return str;
    }
	  else if(typeof str === 'string') {
      const v = parseFloat(str.replace(/\s|\xa0/g, '').replace(/,/, '.'));
      if (!isNaN(v)) {
        return v;
      }
    }
    if (strict) {
      return 0;
    }
		return str;
	},

	/**
	 * ### Приводит значение к типу Булево
	 *
	 * @method fix_boolean
	 * @param str {String}
	 * @return {boolean}
	 */
	fix_boolean(str) {
		if (typeof str === 'string') {
			return !(!str || str.toLowerCase() === 'false');
		}
		return !!str;
	},

	/**
	 * ### Приводит тип значения v к типу метаданных
	 *
	 * @method fetch_type
	 * @param str {*} - значение (обычно, строка, полученная из html поля ввода)
	 * @param type {Object} - поле type объекта метаданных (field.type)
	 * @return {*}
	 */
	fetch_type(str, type) {
	  if(type.type && type.type.types) {
	    if(!str) {
	      str = type.default || '';
      }
      type = type.type;
    }
    if(this.is_data_obj(str) && type?.types.includes(str.class_name)) {
      return str;
    }
		if (type.is_ref) {
      if(type.types && type.types.some((type) => type.startsWith('enm') || type.startsWith('string'))){
        return str;
      }
			return this.fix_guid(str);
		}
		if (type.date_part) {
			return this.fix_date(str, true);
		}
		if (type['digits']) {
			return this.fix_number(str, true);
		}
		if (type.types && type.types[0] === 'boolean') {
			return this.fix_boolean(str);
		}
		return str;
	},

	/**
	 * ### Добавляет days дней к дате
	 *
	 * @method date_add_day
	 * @param date {Date} - исходная дата
	 * @param days {Number} - число дней, добавляемых к дате (может быть отрицательным)
   * @param reset_time {Boolean} - сбросить часы, минуты
	 * @return {Date}
	 */
	date_add_day(date, days, reset_time) {
		const newDt = new Date(date);
		if(!isFinite(newDt)) {
		  return this.blank.date;
    }
		newDt.setDate(date.getDate() + days);
		if (reset_time) {
			newDt.setHours(0, -newDt.getTimezoneOffset(), 0, 0);
		}
		return newDt;
	},

	/**
	 * ### Генерирует новый guid
	 *
	 * @method generate_guid
	 * @return {String}
	 */
	generate_guid() {
		return uuidv1();
	},

	/**
	 * ### Проверяет, является ли значение guid-ом
	 *
	 * @method is_guid
	 * @param v {*} - проверяемое значение
	 * @return {Boolean} - true, если значение соответствует регурярному выражению guid
	 */
	is_guid(v) {
		if (typeof v !== 'string' || v.length < 36) {
			return false;
		}
    else if (v.length === 72) {
      return rxref.test(v.substring(0, 36)) && rxref.test(v.substring(36));
    }
		else if (v.length > 36) {
			const parts = v.split('|');
			v = parts.length === 2 ? parts[1] : v.substring(0, 36);
		}
		return rxref.test(v);
	},

	/**
	 * ### Проверяет, является ли значение пустым идентификатором
	 *
	 * @method is_empty_guid
	 * @param v {*} - проверяемое значение
	 * @return {Boolean} - true, если v эквивалентен пустому guid
	 */
	is_empty_guid(v) {
		return !v || v === this.blank.guid;
	},

	/**
	 * ### Проверяет, является ли значенние Data-объектным типом
	 *
	 * @method is_data_obj
	 * @param v {*} - проверяемое значение
	 * @return {Boolean} - true, если значение является ссылкой
	 */
	is_data_obj(v) {
		return v instanceof DataObj;
	},

  /**
   * ### Проверяет, является ли значенние Data-документом
   *
   * @method is_doc_obj
   * @param v {*} - проверяемое значение
   * @return {Boolean} - true, если значение является ссылкой
   */
  is_doc_obj(v) {
    return v instanceof DocObj;
  },

	/**
	 * ### Проверяет, является ли значенние менеджером объектов данных
	 *
	 * @method is_data_mgr
	 * @param v {*} - проверяемое значение
	 * @return {Boolean} - true, если значение является менеджером данных
	 */
	is_data_mgr(v) {
		return v instanceof DataManager;
	},

  /**
   * ### Проверяет, является ли значенние менеджером перечисления
   *
   * @method is_enm_mgr
   * @param v {*} - проверяемое значение
   * @return {Boolean} - true, если значение является менеджером данных
   */
  is_enm_mgr(v) {
    return v instanceof EnumManager;
  },

  /**
   * ### Проверяет, является ли значенние табличной частью или строкой табличной части
   *
   * @method is_tabular
   * @param v {*} - проверяемое значение
   * @return {Boolean} - true, если значение является табличной частью
   */
  is_tabular(v) {
    return v instanceof TabularSectionRow || v instanceof TabularSection || v?._row instanceof TabularSectionRow;
  },

	/**
	 * Сравнивает на равенство ссылочные типы и примитивные значения
	 *
	 * @param v1 {DataObj|String}
	 * @param v2 {DataObj|String}
	 * @return {boolean} - true, если значенния эквивалентны
	 */
	is_equal(v1, v2) {
		if (v1 == v2) {
			return true;
		}
    const tv1 = typeof v1,  tv2 = typeof v2;
		if (tv1 === 'string' && tv2 === 'string' && v1.trim() === v2.trim()) {
			return true;
		}
		if (tv1 === tv2) {
      if (v1 instanceof Date || v1 instanceof Date) {
        return this.fix_date(v1).valueOf() === this.fix_date(v2).valueOf();
      }
			return false;
		}
    if (tv1 === 'boolean' || tv2 === 'boolean') {
      return Boolean(v1) === Boolean(v2);
    }
		return (this.fix_guid(v1, false) == this.fix_guid(v2, false));
	},

  /**
   * Сравнивает на равенство массивы и простые объекты
   *
   * @param [v1] {Object|Array}
   * @param [v2] {Object|Array}
   * @return {boolean} - true, если значенния эквивалентны
   */
  equals(v1, v2) {
    if(Array.isArray(v1) && Array.isArray(v2)) {
      return v1.length === v2.length && v1.every((elm1, index) => this.equals(elm1, v2[index]));
    }
    if(typeof v1 !== 'object' || typeof v2 !== 'object') {
      return false;
    }
    return Object.keys(v1).every((key) => v1[key] === v2[key]);
  },

  /**
   * Заменяет в ссылке минусы '_' и добавляет '_' в начало
   * @param ref
   * @return {string}
   */
  snake_ref(ref) {
    return '_' + ref.replace(/-/g, '_');
  },

	/**
	 * ### Читает данные из блоба
	 * Возвращает промис с прочитанными данными
	 *
	 * @param blob {Blob}
	 * @param [type] {String} - если type == "data_url", в промисе будет возвращен DataURL, а не текст
	 * @return {Promise}
	 */
	blob_as_text(blob, type) {

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
      switch (type) {
        case "array" :
          reader.readAsArrayBuffer(blob);
          break;
        case "data_url":
          reader.readAsDataURL(blob);
          break;
        default:
          reader.readAsText(blob);
      }
    });
	},
  
  blob_url_open(blob) {
    return this.blob_as_text(blob)
      .then((text) => {
        for(const row of text.split('\n')) {
          if(row.toLowerCase().startsWith('url=')) {
            window.open(row.substr(4), '_blank');
            break;
          }
        }        
        return null;
      });
  },

	/**
	 * Получает с сервера двоичные данные (pdf отчета или картинку или произвольный файл) и показывает его в новом окне, используя data-url
	 * @method get_and_show_blob
	 * @param url {String} - адрес, по которому будет произведен запрос
	 * @param post_data {Object|String} - данные запроса
	 * @param [method] {String}
	 * @async
	 */
	get_and_show_blob(url, post_data, method) {

		function show_blob(req) {
			url = window.URL.createObjectURL(req.response);
			const wnd_print = window.open(url, 'wnd_print', 'menubar=no,toolbar=no,location=no,status=no,directories=no,resizable=yes,scrollbars=yes');
			wnd_print.onload = () => window.URL.revokeObjectURL(url);
			return wnd_print;
		}

		const req = (!method || (typeof method == 'string' && method.toLowerCase().indexOf('post') != -1)) ?
      this.post_ex(url,
        typeof post_data == 'object' ? JSON.stringify(post_data) : post_data,
        true,
        xhr => xhr.responseType = 'blob')
      :
      this.get_ex(url, true, xhr => xhr.responseType = 'blob');

		return show_blob(req);
	},

	/**
	 * Получает с сервера двоичные данные (pdf отчета или картинку или произвольный файл) и показывает диалог сохранения в файл
	 * @method get_and_save_blob
	 * @param url {String} - адрес, по которому будет произведен запрос
	 * @param post_data {Object|String} - данные запроса
	 * @param file_name {String} - имя файла для сохранения
	 * @return {Promise.<T>}
	 */
	get_and_save_blob(url, post_data, file_name) {

		return this.post_ex(url,
			typeof post_data == 'object' ? JSON.stringify(post_data) : post_data, true, function (xhr) {
				xhr.responseType = 'blob';
			})
			.then(function (req) {
				saveAs(req.response, file_name);
			});
	},

  /**
   * Даёт процессору отдохнуть
   * @param time {Number}
   * @param res {Any}
   * @return {Promise<Any>}
   */
  sleep(time = 100, res) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(res), time);
    });
  },

	/**
	 * Копирует все свойства из src в текущий объект исключая те, что в цепочке прототипов src до Object
	 * @method _mixin
	 * @for Object
	 * @param obj {Object} - приемник
	 * @param src {Object} - источник
	 * @param [include] {Array} - массив включаемых полей
	 * @param [exclude] {Array} - массив исключаемых полей
	 * @param [clone] {Boolean} - клонировать, а не устанавливать объектные свойства
	 * @return {Object}
	 */
	_mixin(obj, src, include, exclude, clone) {
		const tobj = {}; // tobj - вспомогательный объект для фильтрации свойств, которые есть у объекта Object и его прототипа

		function exclude_cpy(f) {
			if (!(exclude && exclude.includes(f))) {
				// копируем в dst свойства src, кроме тех, которые унаследованы от Object
				if ((typeof tobj[f] == 'undefined') || (tobj[f] != src[f])) {
					obj[f] = clone ? utils._clone(src[f]) : src[f];
				}
			}
		}

    if(include && include.length) {
      for (let i = 0; i < include.length; i++) {
        exclude_cpy(include[i]);
      }
    }
    else {
      for (let f in src) {
        exclude_cpy(f);
      }
    }
		return obj;

	},

	/**
	 * ### Подмешивает в объект свойства с иерархией объекта patch
	 * В отличии от `_mixin`, не замещает, а дополняет одноименные свойства
	 *
	 * @method _patch
	 * @param obj {Object}
	 * @param patch {Object}
	 * @return {Object} - исходный объект с подмешанными свойствами
	 */
	_patch(obj, patch) {
		for (let area in patch) {
			if (typeof patch[area] == 'object') {
				if (obj[area] && typeof obj[area] == 'object') {
					this._patch(obj[area], patch[area]);
				}
				else {
					obj[area] = patch[area];
				}
			} else {
				obj[area] = patch[area];
			}
		}
		return obj;
	},

	/**
	 * ### Создаёт копию объекта и вложенных объектов
	 * @method _clone
	 * @for Object
	 * @param {Object|Array} obj - исходный объект
	 * @param {Boolean} [patch_date] - приводит даты к строкам
	 * @returns {Object|Array} - копия объекта
	 */
	_clone(obj, patch_date) {
		if (!obj || 'object' !== typeof obj) return obj;
		let p, v, c = 'function' === typeof obj.pop ? [] : {};
		for (p in obj) {
			if (obj.hasOwnProperty(p)) {
        v = obj[p];
        if(v) {
          if(patch_date && v instanceof Date) {
            c[p] = v.toJSON();
          }
          else if('function' === typeof v || v instanceof DataObj || v instanceof DataManager || v instanceof Date) {
            c[p] = v;
          }
          else if('object' === typeof v) {
            c[p] = utils._clone(v, patch_date);
          }
          else {
            c[p] = v;
          }
        }
        else {
          c[p] = v;
        }
      }
		}
		return c;
	},

	/**
	 * Абстрактный поиск значения в коллекции
	 * @method _find
	 * @param src {Array|Object}
	 * @param val {DataObj|String}
	 * @param columns {Array|String} - имена полей, в которых искать
	 * @return {*}
	 * @private
	 */
	_find(src, val, columns) {
		if (typeof val != 'object') {
			for (let i in src) { // ищем по всем полям объекта
				const o = src[i];
				for (let j in o) {
					if (typeof o[j] !== 'function' && utils.is_equal(o[j], val)) {
						return o;
					}
				}
			}
		} else {
			for (let i in src) { // ищем по ключам из val
				const o = src[i];
				let finded = true;
				for (let j in val) {
					if (typeof o[j] !== 'function' && !utils.is_equal(o[j], val[j])) {
						finded = false;
						break;
					}
				}
				if (finded) {
					return o;
				}
			}
		}
	},

  /**
   * Сравнивает левое значение с правым
   * @param left              {Any}
   * @param right             {Any}
   * @param comparison_type   {EnumObj}
   * @param comparison_types  {EnumManager}
   * @return {*}
   */
  check_compare(left, right, comparison_type, comparison_types) {
      const {ne, gt, gte, lt, lte, nin, inh, ninh, lke, nlk, filled, nfilled} = comparison_types;
      switch (comparison_type) {
      case ne:
        return left != right;
      case gt:
        return left > right;
      case gte:
        return left >= right;
      case lt:
        return left < right;
      case lte:
        return left <= right;
      case nin:
        if(Array.isArray(left) && !Array.isArray(right)) {
          return !left.includes(right);
        }
        else if(!Array.isArray(left) && Array.isArray(right)) {
          return !right.includes(left);
        }
        else if(!Array.isArray(left) && !Array.isArray(right)) {
          return right != left;
        }
        else if(Array.isArray(left) && Array.isArray(right)) {
          return right.every((val) => !left.includes(val));
        }
        break;
      case comparison_types.in:
        if(Array.isArray(left) && !Array.isArray(right)) {
          return left.includes(right);
        }
        else if(!Array.isArray(left) && Array.isArray(right)) {
          return right.includes(left);
        }
        else if(!Array.isArray(left) && !Array.isArray(right)) {
          return left == right;
        }
        else if(Array.isArray(left) && Array.isArray(right)) {
          return right.some((val) => left.includes(val));
        }
        break;
      case nlk:
        if(Array.isArray(left) && !Array.isArray(right)) {
          if(left.every(v => typeof v?.contains === "function")) {
            return !left.some(v => v.contains(right, null, true) || right?.contains?.(v, null, true));
          }
          return !left.includes(right);
        }
        else if(!Array.isArray(left) && Array.isArray(right)) {
          if(right.every(v => typeof v?.contains === "function")) {
            return !right.some(v => v.contains(left, null, true) || left?.contains?.(v, null, true));
          }
          return !right.includes(left);
        }
        else if(!Array.isArray(left) && !Array.isArray(right)) {
          return right != left;
        }
        else if(Array.isArray(left) && Array.isArray(right)) {
          return right.every((val) => !left.includes(val));
        }
        break;
      case lke:
        if(Array.isArray(left) && !Array.isArray(right)) {
          if(left.every(v => typeof v?.contains === "function")) {
            return left.some(v => v.contains(right, null, true) || right?.contains?.(v, null, true));
          }
          return left.includes(right);
        }
        else if(!Array.isArray(left) && Array.isArray(right)) {
          if(right.every(v => typeof v?.contains === "function")) {
            return right.some(v => v.contains(left, null, true) || left?.contains?.(v, null, true));
          } 
          return right.includes(left);
        }
        else if(!Array.isArray(left) && !Array.isArray(right)) {
          return left == right;
        }
        else if(Array.isArray(left) && Array.isArray(right)) {
          return right.some((val) => left.includes(val));
        }
        break;
      case inh:
        return utils.is_data_obj(left) ? left._hierarchy(right) : left == right;
      case ninh:
        return utils.is_data_obj(left) ? !left._hierarchy(right) : left != right;
      case lke:
        return left.indexOf && right && left.indexOf(right) !== -1;
      case nlk:
        return left.indexOf && left.indexOf(right) === -1;
      case filled:
        return left && left != utils.blank.guid;
      case nfilled:
        return !left || left == utils.blank.guid;
      default:
        return left == right;
      }
    },

  /**
   * Выясняет, содержит ли left подстроку right
   * @param left
   * @param right
   * @return {boolean}
   * @private
   */
  _like(left, right) {
    return left && left.toString().toLowerCase().includes(right.toLowerCase());
  },

	/**
	 * Выясняет, удовлетворяет ли объект `o` условию `selection`
	 * @method _selection
	 * @param o {Object}
	 * @param [selection]
	 * @private
	 */
	_selection(o, selection) {

		let ok = true;

		if (selection) {
			// если отбор является функцией, выполняем её, передав контекст
			if (typeof selection == 'function') {
				ok = selection.call(this, o);
			}
			else {
				// бежим по всем свойствам `selection`
				for (let j in selection) {

					const sel = selection[j];
					const is_obj = sel && typeof(sel) === 'object';

					// пропускаем служебные свойства
					if (j.substr(0, 1) == '_') {
            if(j === '_search' && sel.fields && sel.value) {
              ok = sel.value.every((str) => sel.fields.some((fld) => utils._like(o[fld], str)));
              if(!ok) {
                break;
              }
            }
						continue;
					}

					// если свойство отбора является функцией, выполняем её, передав контекст
					if (typeof sel == 'function') {
						ok = sel.call(this, o, j);
            if(!ok) {
              break;
            }
            continue;
          }

					if (Array.isArray(sel)) {
            // если свойство отбора является объектом `or`, выполняем Array.some() TODO: здесь напрашивается рекурсия
					  if(j === 'or') {
              ok = sel.some((el) => {
                const key = Object.keys(el)[0];
                if(el[key].hasOwnProperty('like')) {
                  return utils._like(o[key], el[key].like);
                }
                else {
                  return utils.is_equal(o[key], el[key]);
                }
              });
            }
            // выполняем все отборы текущего sel
					  else {
              ok = sel.every((el) => utils._selection(o, {[j]: el}));
            }
            if(!ok) {
              break;
            }
            continue;
          }

          // получаем имя вида сравнения
          let ctname;
					if(is_obj) {
            for(const ct in sel) {
              if(ctnames.includes(ct) && Object.keys(sel).length === 1) {
                ctname = ct;
              }
            }
          }

          if(!ctname) {
            if (!utils.is_equal(o[j], sel)) {
              ok = false;
              break;
            }
          }

					// если свойство отбора является объектом `like`, сравниваем подстроку
          else if(['like','lke'].includes(ctname)) {
						if (!utils._like(o[j], sel[ctname])) {
							ok = false;
							break;
						}
					}
          // это вид сравнения `не содержит`
          else if(ctname === 'nlk') {
            if (utils._like(o[j], sel[ctname])) {
              ok = false;
              break;
            }
          }
					// если свойство отбора является объектом `not`, сравниваем на неравенство
          else if(['not', 'ne', '$ne'].includes(ctname)) {
						if (utils.is_equal(o[j], sel[ctname])) {
							ok = false;
							break;
						}
					}
					// если свойство отбора является объектом `in`, выполняем Array.some()
          else if(['in', '$in'].includes(ctname)) {
						ok = sel[ctname].some((el) => utils.is_equal(el, o[j]));
            if(!ok) {
              break;
            }
          }
          // если свойство отбора является объектом `nin`, выполняем Array.every(!=)
          else if(['nin', '$nin'].includes(ctname)) {
            ok = sel[ctname].every((el) => !utils.is_equal(el, o[j]));
            if(!ok) {
              break;
            }
          }
          // если свойство отбора является объектом `inh`, вычисляем иерархию
          else if(ctname === 'inh') {
            const tmp = utils.is_data_obj(o) ? o : (this.get && this.get(o)) || o;
            ok = j === 'ref' ? tmp._hierarchy && tmp._hierarchy(sel.inh) : tmp[j]._hierarchy && tmp[j]._hierarchy(sel.inh);
            if(!ok) {
              break;
            }
          }
          // если свойство отбора является объектом `ninh`, вычисляем иерархию
          else if(ctname === 'ninh') {
            const tmp = utils.is_data_obj(o) ? o : (this.get && this.get(o)) || o;
            ok = !(j === 'ref' ? tmp._hierarchy && tmp._hierarchy(sel.ninh) : tmp[j]._hierarchy && tmp[j]._hierarchy(sel.ninh));
            if(!ok) {
              break;
            }
          }
					// если свойство отбора является объектом `lt`, сравниваем на _меньше_
          else if(['lt','$lt'].includes(ctname)) {
						ok = o[j] < sel[ctname];
            if(!ok) {
              break;
            }
          }
          else if(['lte','$lte'].includes(ctname)) {
            ok = o[j] <= sel[ctname];
            if(!ok) {
              break;
            }
          }
					// если свойство отбора является объектом `gt`, сравниваем на _больше_
					else if (['gt','$gt'].includes(ctname)) {
						ok = o[j] > sel[ctname];
            if(!ok) {
              break;
            }
          }
          else if (['gte','$gte'].includes(ctname)) {
            ok = o[j] >= sel[ctname];
            if(!ok) {
              break;
            }
          }
					// если свойство отбора является объектом `between`, сравниваем на _вхождение_
					else if (ctname === 'between') {
						let tmp = o[j];
            if(typeof tmp != 'number') {
              tmp = utils.fix_date(o[j]);
            }
            ok = (tmp >= sel.between[0]) && (tmp <= sel.between[1]);
            if(!ok) {
              break;
            }
          }
          else if (ctname === '$eq') {
            if (!utils.is_equal(o[j], sel.$eq)) {
              ok = false;
              break;
            }
          }
					else if (!utils.is_equal(o[j], sel)) {
						ok = false;
						break;
					}
				}
			}
		}

		return ok;
	},

  /**
   * ### Поиск массива значений в коллекции
   * Кроме стандартного поиска по равенству значений,
   * поддержаны операторы `in`, `not` и `like` и фильтрация через внешнюю функцию
   * @method _find_rows_with_sort
   * @param src {Array}
   * @param selection {Object|function} - в ключах имена полей, в значениях значения фильтра или объект {like: "значение"} или {not: значение}
   * @return {{docs: Array, count: number}}
   * @private
   */
  _find_rows_with_sort(src, selection) {
    let pre = [], docs = [], sort, top = 300, skip = 0, count = 0, skipped = 0;

    if(selection) {
      if(selection._sort) {
        sort = selection._sort;
        delete selection._sort;
      }
      if(selection.hasOwnProperty('_top')) {
        top = selection._top;
        delete selection._top;
      }
      if(selection.hasOwnProperty('_skip')) {
        skip = selection._skip;
        delete selection._skip;
      }
      if(selection.hasOwnProperty('_ref')) {
        delete selection._ref;
      }
    }

    // фильтруем
    for (const o of src) {
      // выполняем колбэк с элементом и пополняем итоговый массив
      if (utils._selection.call(this, o, selection)) {
        pre.push(o);
      }
    }

    // сортируем
    if(sort && sort.length && typeof alasql !== 'undefined') {
      pre = alasql(`select * from ? order by ${sort.map(({field, direction}) => `${field} ${direction}`).join(',')}`, [pre]);
    }

    // обрезаем кол-во возвращаемых элементов
    for (const o of pre) {
      if(skip){
        skipped++;
        if (skipped <= skip) {
          continue;
        }
      }
      docs.push(o);
      if (top) {
        count++;
        if (count >= top) {
          break;
        }
      }
    }

    return {docs, count: pre.length};
  },

	/**
	 * ### Поиск массива значений в коллекции
	 * Кроме стандартного поиска по равенству значений,
	 * поддержаны операторы `in`, `not` и `like` и фильтрация через внешнюю функцию
	 * @method _find_rows
	 * @param src {Object|Array}
	 * @param selection {Object|function} - в ключах имена полей, в значениях значения фильтра или объект {like: "значение"} или {not: значение}
	 * @param callback {Function}
	 * @return {Array}
	 * @private
	 */
	_find_rows(src, selection, callback) {

		const res = [];
		let top, skip, count = 0, skipped = 0;

    if(selection) {
      if(selection.hasOwnProperty('_top')) {
        top = selection._top;
        delete selection._top;
      }
      else {
        top = 300;
      }
      if(selection.hasOwnProperty('_skip')) {
        skip = selection._skip;
        delete selection._skip;
      }
      else {
        skip = 0;
      }
    }

    if(!src[Symbol.iterator]) {
      src = Object.values(o);
    }
		for (const o of src) {
			// выполняем колбэк с элементом и пополняем итоговый массив
			if (utils._selection.call(this, o, selection)) {
			  if(skip){
          skipped++;
          if (skipped <= skip) {
            continue;
          }
        }
				if (callback) {
					if (callback.call(this, o) === false) {
						break;
					}
				} else {
					res.push(o);
				}
				// ограничиваем кол-во возвращаемых элементов
				if (top) {
					count++;
					if (count >= top) {
						break;
					}
				}
			}

		}
		return res;
	},

  /**
   * Вспомогательная таблица для crc32
   */
  crcTable: Object.freeze(function () {
      let c, crcTable = [];
      for (let n = 0; n < 256; n++) {
        c = n;
        for (let k = 0; k < 8; k++) {
          c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
        crcTable[n] = c;
      }
      return crcTable;
    }()
  ),

  /**
   * Вычисляет crc32 строки
   * @param str
   * @return {number}
   */
  crc32(str) {
    const {crcTable} = this;
    let crc = 0 ^ (-1);
    for (let i = 0; i < str.length; i++ ) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
    }
    return (crc ^ (-1)) >>> 0;
  },

};

/**
 * ### Пустые значения даты и уникального идентификатора
 *
 * @property blank
 * @type Object
 * @final
 */
utils.__define('blank', {
	value: Object.freeze({
		date: utils.fix_date('0001-01-01T00:00:00'),
		guid: '00000000-0000-0000-0000-000000000000',
		by_type: function (mtype) {
			let v;
			if (mtype.is_ref)
				v = this.guid;
			else if (mtype.date_part)
				v = this.date;
			else if (mtype['digits'])
				v = 0;
			else if (mtype.types && mtype.types[0] == 'boolean')
				v = false;
			else
				v = '';
			return v;
		},
	}),
	enumerable: true,
	configurable: false,
	writable: false,
});

export default utils;
