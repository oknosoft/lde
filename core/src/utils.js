/**
 * ### Moment для операций с интервалами и датами
 *
 * @property moment
 * @type Function
 * @final
 */

import {OwnerObj} from './meta/metaObjs';
import {own} from './meta/symbols';

import Aes from '../lib/aes';
const {v1: uuidv1} = require('uuid');
const moment = require('dayjs');
require('dayjs/locale/ru');
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

export const object = 'object';
export const number = 'number';
export const string = 'string';
export const boolean = 'boolean';

/**
 * Отбрасываем часовой пояс при сериализации даты
 * @method toJSON
 * @for Date
 */
Date.prototype.toJSON = Date.prototype.toISOString = function () {
	return moment(this).format(moment._masks.iso);
};


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

const dateFormats = [
  'DD-MM-YYYY',
  'DD-MM-YYYY HH:mm',
  'DD-MM-YYYY HH:mm:ss',
  'DD-MM-YY HH:mm',
  'YYYYDDMMHHmmss',
  'YYYY-MM-DDTHH:mm:ss[Z]',
  'DD.MM.YYYY',
  'DD.MM.YYYY HH:mm',
  'DD.MM.YYYY HH:mm:ss',
  'DD.MM.YY HH:mm',
];

const rxref = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

/**
 * Вспомогательная таблица для crc32
 */
const crcTable = Object.freeze(function () {
  let c, crcTable = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
    crcTable[n] = c;
  }
  return crcTable;
}());

/**
 * Коллекция вспомогательных методов
 */
class MetaUtils extends OwnerObj {

  constructor(owner) {
    super(owner, 'utils');

    this.blob = {
      /**
       * ### Читает данные из блоба
       * Возвращает промис с прочитанными данными
       *
       * @param blob {Blob}
       * @param [type] {String} - если type == "data_url", в промисе будет возвращен DataURL, а не текст
       * @return {Promise}
       */
      asText(blob, type) {

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

      /**
       * Получает с сервера двоичные данные (pdf отчета или картинку или произвольный файл) и показывает его в новом окне, используя data-url
       * @method get_and_show_blob
       * @param url {String} - адрес, по которому будет произведен запрос
       * @param post_data {Object|String} - данные запроса
       * @param [method] {String}
       * @async
       */
      getAndShow(url, post_data, method) {

        function show_blob(req) {
          url = window.URL.createObjectURL(req.response);
          const wnd_print = window.open(url, 'wnd_print', 'menubar=no,toolbar=no,location=no,status=no,directories=no,resizable=yes,scrollbars=yes');
          wnd_print.onload = () => window.URL.revokeObjectURL(url);
          return wnd_print;
        }

        const req = (!method || (typeof method == string && method.toLowerCase().indexOf('post') != -1)) ?
          this.post_ex(url,
            typeof post_data == object ? JSON.stringify(post_data) : post_data,
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
      getAndSave(url, post_data, file_name) {

        return this.post_ex(url,
          typeof post_data == object ? JSON.stringify(post_data) : post_data, true, function (xhr) {
            xhr.responseType = 'blob';
          })
          .then(function (req) {
            saveAs(req.response, file_name);
          });
      },

    }

    /**
     * @typedef MetaDeflate
     * @prop {Function} base64ToBufferAsync
     * @prop {Function} bufferToBase64Async
     * @prop {Function} compress
     * @prop {Function} decompress
     */

    /**
     * Mетоды создания и чтения сжатых данных
     * @type MetaDeflate
     * @final
     */
    this.deflate = {
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
    };

    /**
     * Aes для шифрования - дешифрования строк
     *
     * @property aes
     * @type Aes
     * @final
     */
    this.aes = new Aes('metadata.js');

    /**
     * @typedef UtilsIs
     * @prop {Function} guid
     * @prop {Function} emptyGuid
     * @prop {Function} dataObj
     * @prop {Function} docObj
     * @prop {Function} dataMgr
     * @prop {Function} enmMgr
     * @prop {Function} tabular
     * @prop {Function} equal
     * @prop {Function} equals
     * @prop {Function} like
     */

    /**
     * Методы проверки на типы и значения
     * @type UtilsIs
     */
    this.is = {

      /**
       * Проверяет, является ли значение guid-ом
       *
       * @param v {*} - проверяемое значение
       * @return {Boolean} - true, если значение соответствует регурярному выражению guid
       */
      guid(v) {
        if (typeof v !== string) {
          return false;
        }
        const {length} = v;
        if (length < 36) {
          return false;
        }
        else if (length === 72) {
          return rxref.test(v.substr(0, 36)) && rxref.test(v.substr(36));
        }
        else if (length > 36) {
          const parts = v.split('|');
          v = parts.length === 2 ? parts[1] : v.substr(0, 36);
        }
        return rxref.test(v);
      },

      /**
       * Проверяет, является ли значение пустым идентификатором
       *
       * @param v {*} - проверяемое значение
       * @return {Boolean} - true, если v эквивалентен пустому guid
       */
      emptyGuid: (v) => !v || v == this.blank.guid,

      /**
       * Проверяет, является ли значенние Data-объектным типом
       *
       * @param v {*} - проверяемое значение
       * @return {Boolean} - true, если значение является ссылкой
       */
      dataObj: (v) => v instanceof this.classes.DataObj,

      /**
       * Проверяет, является ли значенние Data-документом
       *
       * @param v {*} - проверяемое значение
       * @return {Boolean} - true, если значение является ссылкой
       */
      docObj: (v) => v instanceof this.classes.DocObj,

      /**
       * Проверяет, является ли значенние менеджером объектов данных
       *
       * @param v {*} - проверяемое значение
       * @return {Boolean} - true, если значение является менеджером данных
       */
      dataMgr: (v)=> v instanceof this.classes.DataManager,

      /**
       * Проверяет, является ли значенние менеджером перечисления
       *
       * @param v {*} - проверяемое значение
       * @return {Boolean} - true, если значение является менеджером данных
       */
      enmMgr: (v) => v instanceof this.classes.EnumManager,

      /**
       * Проверяет, является ли значенние табличной частью или строкой табличной части
       *
       * @param v {*} - проверяемое значение
       * @return {Boolean} - true, если значение является табличной частью
       */
      tabular: (v) => {
        const {classes} = this;
        return v instanceof classes.TabularSectionRow || v instanceof classes.TabularSection;
      },

      /**
       * Сравнивает на равенство ссылочные типы и примитивные значения
       *
       * @param v1 {DataObj|String}
       * @param v2 {DataObj|String}
       * @return {boolean} - true, если значенния эквивалентны
       */
      equal: (v1, v2) => {
        if (v1 == v2) {
          return true;
        }
        const tv1 = typeof v1,  tv2 = typeof v2;
        if (tv1 === string && tv2 === string && v1.trim() === v2.trim()) {
          return true;
        }
        if (tv1 === tv2) {
          return false;
        }
        if (tv1 === 'boolean' || tv2 === 'boolean') {
          return Boolean(v1) === Boolean(v2);
        }
        return (this.fix.guid(v1, false) == this.fix.guid(v2, false));
      },

      /**
       * Сравнивает на равенство массивы и простые объекты
       *
       * @param [v1] {Object|Array}
       * @param [v2] {Object|Array}
       * @return {boolean} - true, если значенния эквивалентны
       */
      equals: (v1, v2) => {
        if(Array.isArray(v1) && Array.isArray(v2)) {
          return v1.length === v2.length && v1.every((elm1, index) => this.equals(elm1, v2[index]));
        }
        if(typeof v1 !== object || typeof v2 !== object) {
          return false;
        }
        return Object.keys(v1).every((key) => v1[key] === v2[key]);
      },

      /**
       * Выясняет, содержит ли left подстроку right
       * @param left
       * @param right
       * @return {boolean}
       * @private
       */
      like(left, right) {
        return left && left.toString().toLowerCase().includes(right.toLowerCase());
      }
    };

    /**
     * @typedef FixTypes
     * @prop {Function} date
     * @prop {Function} guid
     * @prop {Function} number
     * @prop {Function} boolean
     * @prop {Function} type
     * @prop {Function} collection
     */

    /**
     * Методы приведения примитивных типов
     * @type FixTypes
     */
    this.fix = {

      /**
       * Приводит значение к типу Дата
       *
       * @param {String|Number|Date} str - приводиме значение
       * @param {Boolean} [strict=false] - если истина и значение не приводится к дате, возвращать пустую дату
       * @return {Date|*}
       */
      date: (str, strict) => {
        if (str instanceof Date){
          return str;
        }
        const m = moment(str, dateFormats);
        return m.isValid() ? m.toDate() : (strict ? this.blank.date : str);
      },

      /**
       * Извлекает guid из строки или ссылки или объекта
       *
       * @param {String|Object|DataObj} ref - значение, из которого надо извлечь идентификатор
       * @param {Boolean} [generate] - указывает, генерировать ли новый guid для пустого значения
       * @return {String}
       */
      guid: (ref, generate) => {

        if (ref instanceof this.classes.DataObj) {
          return ref.ref;
        }

        if (ref && typeof ref == object) {
          if (ref.hasOwnProperty('ref')){
            ref = ref.ref;
          }
          else if (ref.hasOwnProperty('name')){
            ref = ref.name;
          }
        }

        if(typeof ref === string) {
          const i = ref.indexOf('|');
          if(i >= 0) {
            ref = ref.substring(i + 1);
          }
        }

        if (generate === false || this.is.guid(ref)) {
          return ref;
        }
        else if (generate) {
          return this.generateGuid();
        }
        return this.blank.guid;
      },

      /**
       * Приводит значение к типу Число
       *
       * @param {*} str - приводиме значение
       * @param {Boolean} [strict=false] - конвертировать NaN в 0
       * @return {Number}
       */
      number(str, strict) {
        if(typeof str === number) {
          return str;
        }
        else if(typeof str === string) {
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
       * Приводит значение к типу Булево
       *
       * @param str {String}
       * @return {boolean}
       */
      boolean(str) {
        if (typeof str === string) {
          return !(!str || str.toLowerCase() === 'false');
        }
        return !!str;
      },

      /**
       * Приводит тип значения v к типу метаданных
       *
       * @param str {*} - значение (обычно, строка, полученная из html поля ввода)
       * @param {Object} type - поле type объекта метаданных (field.type)
       * @return {*}
       */
      type: (str, type) => {
        if(this.is.dataObj(str) && type?.types.includes(str?.className)) {
          return str;
        }
        if (type?.isRef) {
          if(type.types && type.types.some((type) => type.startsWith('enm') || type.startsWith(string))){
            return str;
          }
          return this.fix.guid(str);
        }
        if (type?.datePart) {
          return this.fix.date(str, true);
        }
        if (type?.['digits']) {
          return this.fix.number(str, true);
        }
        if (type?.types?.[0] === 'boolean') {
          return this.fix.boolean(str);
        }
        return str ? str : (typeof str === 'number' ? str : '');
      },

    };

    /**
     * Пустые значения даты и уникального идентификатора
     */
    this.blank = Object.freeze({
      date: new Date('0001-01-01T00:00:00'),
      guid: '00000000-0000-0000-0000-000000000000',
      by_type: function (mtype) {
        let v;
        if (mtype.isRef)
          v = this.guid;
        else if (mtype.datePart)
          v = this.date;
        else if (mtype['digits'])
          v = 0;
        else if (mtype.types && mtype.types[0] === 'boolean')
          v = false;
        else
          v = '';
        return v;
      },
    });

    /**
     * Абстрактный поиск значения в коллекции
     * @param src {Array|Object}
     * @param val {DataObj|String}
     * @param columns {Array|String} - имена полей, в которых искать
     * @return {*}
     * @private
     */
    this.find = (src, val, columns) => {
      const {is} = this;
      if (typeof val != object) {
        for (let i in src) { // ищем по всем полям объекта
          const o = src[i];
          for (let j in o) {
            if (typeof o[j] !== 'function' && is.equal(o[j], val)) {
              return o;
            }
          }
        }
      }
      else {
        for (let i in src) { // ищем по ключам из val
          const o = src[i];
          let finded = true;
          for (let j in val) {
            if (typeof o[j] !== 'function' && !is.equal(o[j], val[j])) {
              finded = false;
              break;
            }
          }
          if (finded) {
            return o;
          }
        }
      }
    };

    /**
     * @summary Поиск массива значений в коллекции
     * @desc Кроме стандартного поиска по равенству значений,
     * поддержаны операторы `in`, `not` и `like` и фильтрация через внешнюю функцию
     * @param src {Object|Array}
     * @param selection {Object|function} - в ключах имена полей, в значениях значения фильтра или объект {like: "значение"} или {not: значение}
     * @param callback {Function}
     * @return {Array}
     * @private
     */
    this.find.rows = (src, selection, callback) => {

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
          if (this.selection.call(this, o, selection)) {
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
      };

    /**
     * ### Поиск массива значений в коллекции
     * Кроме стандартного поиска по равенству значений,
     * поддержаны операторы `in`, `not` и `like` и фильтрация через внешнюю функцию
     * @param src {Array}
     * @param selection {Object|function} - в ключах имена полей, в значениях значения фильтра или объект {like: "значение"} или {not: значение}
     * @return {{docs: Array, count: number}}
     * @private
     */
    this.find.with_sort = (src, selection) => {
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
        if (this.selection(o, selection)) {
          pre.push(o);
        }
      }

      // сортируем
      // if(sort && sort.length && typeof alasql !== 'undefined') {
      //   pre = alasql(`select * from ? order by ${sort.map(({field, direction}) => `${field} ${direction}`).join(',')}`, [pre]);
      // }

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
    }

  }

  get classes() {
    return this[own].classes;
  }

  /**
   * @typedef MetaRandom
   * @prop {Crypto} crypto
   * @prop {Uint16Array} rnds16
   * @prop {Number} counter
   * @prop {Function} rngs
   * @prop {Function} random
   */

  /**
   * Методы из библиотек uuid и crypto, чтобы с версиями импорта не париться
   * @type MetaRandom
   * @final
   */
  rnd = {
    crypto: typeof crypto !== 'undefined' ? crypto : require('crypto'),
    rnds32: new Uint32Array(32),
    counter: 0,

    // массив случайных чисел
    rngs() {
      const {rnds32, crypto} = this;
      return crypto.getRandomValues ? crypto.getRandomValues(rnds32) : crypto.randomFillSync(rnds32);
    },

    // случайное число с помощью Crypto
    random() {
      if (!this.counter) {
        this.rngs();
      }
      this.counter++;
      if (this.counter > 31) {
        this.counter = 0;
      }
      return this.rnds32[this.counter];
    },

  };

  /**
   * Работа с датами
   * @type Function
   */
  get moment() {
    return moment;
  }

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
  }

  deepFreeze(obj) {
    // Retrieve the property names defined on object
    const propNames = Reflect.ownKeys(obj);
    // Freeze properties before freezing self
    for (const name of propNames) {
      const value = obj[name];
      if ((value && typeof value === object && !this.is.dataObj(value)) || typeof value === "function") {
        this.deepFreeze(value);
      }
    }

    return Object.freeze(obj);
  }

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
  }

  /**
   * Генерирует новый guid
   *
   * @return {String}
   */
  generateGuid() {
    return uuidv1();
  }

  /**
   * Заменяет в строке минусы на '_' и добавляет '_' в начало
   * @param {String} str
   * @return {String}
   */
  snakeStr(str) {
    return '_' + str.replace(/-/g, '_');
  }

  /**
   * Вычисляет crc32 строки
   * @param str
   * @return {number}
   */
  crc32(str) {
    let crc = 0 ^ (-1);
    for (let i = 0; i < str.length; i++ ) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
    }
    return (crc ^ (-1)) >>> 0;
  }

  /**
   * Загружает скрипты и стили синхронно и асинхронно
   * @param {String} src - url ресурса
   * @param {'script'|'link'} type - тип загружаемых данных
   * @return {Promise}
   */
  loadScript(src, type) {

    return new Promise((resolve, reject) => {

      const r = setTimeout(reject, 20000);

      const s = document.createElement(type);
      if (type === 'script') {
        s.type = 'text/javascript';
        s.src = src;
        s.async = true;
        const listener = () => {
          s.removeEventListener('load', listener);
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
  }

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
  }

  /**
   * Сравнивает левое значение с правым
   * @param left              {Any}
   * @param right             {Any}
   * @param comparisonType   {EnumObj}
   * @param comparison_types  {EnumManager}
   * @return {*}
   */
  checkCompare(left, right, comparisonType, comparison_types) {
    const {ne, gt, gte, lt, lte, nin, inh, ninh, lke, nlk} = comparison_types;
    switch (comparisonType) {
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
      case inh:
        return this.is.dataObj(left) ? left._hierarchy(right) : left == right;
      case ninh:
        return this.is.dataObj(left) ? !left._hierarchy(right) : left != right;
      case lke:
        return left.indexOf && right && left.indexOf(right) !== -1;
      case nlk:
        return left.indexOf && left.indexOf(right) === -1;
      default:
        return left == right;
    }
  }

  /**
   * Копирует все свойства из src в текущий объект исключая те, что в цепочке прототипов src до Object
   * @param {Object} obj - приемник
   * @param {Object} src - источник
   * @param {Array} [include] - массив включаемых полей
   * @param {Array} [exclude] - массив исключаемых полей
   * @param {Boolean} [clone] - клонировать, а не устанавливать объектные свойства
   * @return {Object}
   */
  mixin = (obj, src, include, exclude, clone) => {
    const tobj = {}; // tobj - вспомогательный объект для фильтрации свойств, которые есть у объекта Object и его прототипа

    const excludeCpy = (f) => {
      if (!(exclude && exclude.includes(f))) {
        // копируем в dst свойства src, кроме тех, которые унаследованы от Object
        if ((typeof tobj[f] == 'undefined') || (tobj[f] != src[f])) {
          obj[f] = clone ? this.clone(src[f]) : src[f];
        }
      }
    }

    if(include && include.length) {
      for (let i = 0; i < include.length; i++) {
        excludeCpy(include[i]);
      }
    }
    else {
      for (let f in src) {
        excludeCpy(f);
      }
    }
    return obj;
  };

  /**
   * Подмешивает в объект свойства с иерархией объекта patch
   * В отличии от `mixin`, не замещает, а дополняет одноименные свойства
   *
   * @param {Object} obj
   * @param {Object} patch
   * @return {Object} - исходный объект с подмешанными свойствами
   */
  patch = (obj, patch) => {
    for (let area in patch) {
      if (typeof patch[area] == object) {
        if (obj[area] && typeof obj[area] == object) {
          this.patch(obj[area], patch[area]);
        }
        else {
          obj[area] = patch[area];
        }
      } else {
        obj[area] = patch[area];
      }
    }
    return obj;
  };

  /**
   * Создаёт копию объекта и вложенных объектов
   * @param {Object|Array} obj - исходный объект
   * @return {Object|Array} - копия объекта
   */
  clone = (obj) => {
    const {DataObj, DataManager} = this.classes;
    if (!obj || object !== typeof obj) return obj;
    let p, v, c = 'function' === typeof obj.pop ? [] : {};
    for (p in obj) {
      if (obj.hasOwnProperty(p)) {
        v = obj[p];
        if(v) {
          if('function' === typeof v || v instanceof DataObj || v instanceof DataManager || v instanceof Date) {
            c[p] = v;
          }
          else if(object === typeof v) {
            c[p] = this.clone(v);
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
  };

  /**
   * Выясняет, удовлетворяет ли объект `o` условию `selection`
   * @method selection
   * @param o {Object}
   * @param [selection]
   * @private
   */
  selection = (o, selection) => {

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
          const is_obj = sel && typeof(sel) === object;

          // пропускаем служебные свойства
          if (j.substring(0, 1) == '_') {
            if(j === '_search' && sel.fields && sel.value) {
              ok = sel.value.every((str) => sel.fields.some((fld) => this.is._like(o[fld], str)));
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
                  return this.is._like(o[key], el[key].like);
                }
                else {
                  return this.is.equal(o[key], el[key]);
                }
              });
            }
            // выполняем все отборы текущего sel
            else {
              ok = sel.every((el) => this.selection(o, {[j]: el}));
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
            if (!this.is.equal(o[j], sel)) {
              ok = false;
              break;
            }
          }

          // если свойство отбора является объектом `like`, сравниваем подстроку
          else if(['like','lke'].includes(ctname)) {
            if (!this.is._like(o[j], sel[ctname])) {
              ok = false;
              break;
            }
          }
          // это вид сравнения `не содержит`
          else if(ctname === 'nlk') {
            if (this.is._like(o[j], sel[ctname])) {
              ok = false;
              break;
            }
          }
          // если свойство отбора является объектом `not`, сравниваем на неравенство
          else if(['not', 'ne', '$ne'].includes(ctname)) {
            if (this.is.equal(o[j], sel[ctname])) {
              ok = false;
              break;
            }
          }
          // если свойство отбора является объектом `in`, выполняем Array.some()
          else if(['in', '$in'].includes(ctname)) {
            ok = sel[ctname].some((el) => this.is.equal(el, o[j]));
            if(!ok) {
              break;
            }
          }
          // если свойство отбора является объектом `nin`, выполняем Array.every(!=)
          else if(['nin', '$nin'].includes(ctname)) {
            ok = sel[ctname].every((el) => !this.is.equal(el, o[j]));
            if(!ok) {
              break;
            }
          }
          // если свойство отбора является объектом `inh`, вычисляем иерархию
          else if(ctname === 'inh') {
            const tmp = this.is.dataObj(o) ? o : (this.get && this.get(o)) || o;
            ok = j === 'ref' ? tmp._hierarchy && tmp._hierarchy(sel.inh) : tmp[j]._hierarchy && tmp[j]._hierarchy(sel.inh);
            if(!ok) {
              break;
            }
          }
          // если свойство отбора является объектом `ninh`, вычисляем иерархию
          else if(ctname === 'ninh') {
            const tmp = this.is.dataObj(o) ? o : (this.get && this.get(o)) || o;
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
            if(typeof tmp != number) {
              tmp = this.fix.date(o[j]);
            }
            ok = (tmp >= sel.between[0]) && (tmp <= sel.between[1]);
            if(!ok) {
              break;
            }
          }
          else if (ctname === '$eq') {
            if (!this.is.equal(o[j], sel.$eq)) {
              ok = false;
              break;
            }
          }
          else if (!this.is.equal(o[j], sel)) {
            ok = false;
            break;
          }
        }
      }
    }

    return ok;
  };

  /**
   * Запись журнала регистрации
   *
   * @param {Error} err
   * @param {Promise} promise
   */
  record_log = (err, promise) => {
    this[own].ireg?.log?.record?.(err, promise);
    console?.log(err, promise);
  };

}

export default MetaUtils;

