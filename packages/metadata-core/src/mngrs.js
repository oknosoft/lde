/**
 * Конструкторы менеджеров данных
 *
 * @module  metadata
 * @submodule meta_mngrs
 */

/**
 * ### Абстрактный менеджер данных
 * Не используется для создания прикладных объектов, но является базовым классом,
 * от которого унаследованы менеджеры как ссылочных данных, так и объектов с суррогратным ключом и несохраняемых обработок<br />
 * См. так же:
 * - {{#crossLink "EnumManager"}}{{/crossLink}} - менеджер перечислений
 * - {{#crossLink "RefDataManager"}}{{/crossLink}} - абстрактный менеджер ссылочных данных
 * - {{#crossLink "CatManager"}}{{/crossLink}} - менеджер регистров накопления
 * - {{#crossLink "ChartOfCharacteristicManager"}}{{/crossLink}} - менеджер регистров накопления
 * - {{#crossLink "ChartOfAccountManager"}}{{/crossLink}} - менеджер регистров накопления
 * - {{#crossLink "DocManager"}}{{/crossLink}} - менеджер регистров накопления
 * - {{#crossLink "DataProcessorsManager"}}{{/crossLink}} - менеджер обработок
 * - {{#crossLink "RegisterManager"}}{{/crossLink}} - абстрактный менеджер регистра (накопления, сведений и бухгалтерии)
 * - {{#crossLink "InfoRegManager"}}{{/crossLink}} - менеджер регистров сведений
 * - {{#crossLink "LogManager"}}{{/crossLink}} - менеджер журнала регистрации
 * - {{#crossLink "AccumRegManager"}}{{/crossLink}} - менеджер регистров накопления
 * - {{#crossLink "TaskManager"}}{{/crossLink}} - менеджер задач
 * - {{#crossLink "BusinessProcessManager"}}{{/crossLink}} - менеджер бизнес-процессов
 *
 * @class DataManager
 * @constructor
 * @param class_name {string} - имя типа менеджера объекта. например, "doc.calc_order"
 * @menuorder 10
 * @tooltip Менеджер данных
 */

import utils from './utils';
import msg from './i18n.ru';
import {DataObj, EnumObj, DocObj, RegisterRow} from './objs';
import MetaEventEmitter from './emitter';

const rp = 'promise';
const string = 'string';

class Iterator {

  constructor(by_ref, alatable) {
    this._by_ref = by_ref;
    this._alatable = alatable;
    this._idx = 0;
  }

  value(_alatable) {
    const value = this._by_ref[_alatable[this._idx]?.ref];
    this._idx++;
    return value?.empty?.() ? null : value;
  }

  next() {
    const {_alatable} = this;
    let value = this.value(_alatable);
    while (!value && (this._idx < _alatable.length)) {
      value = this.value(_alatable);
    }
    return {value, done: !value || this._idx > _alatable.length};
  }
}


export class DataManager extends MetaEventEmitter{

	constructor(owner, class_name) {

		super();

		/**
		 * ### Владелец менеджера
		 * например, справочники, документы - верхний уровень
		 */
		this._owner = owner;

		/**
		 * ### Имя типа объектов этого менеджера
		 * @property class_name
		 * @type String
		 * @final
		 */
		this.class_name = class_name;
    this.name = class_name.split('.')[1];

		/**
		 * В этом свойстве хранятся имена конструктора объекта и конструкторов табличных частей
		 */
		this.constructor_names = {};

		/**
		 * ### Хранилище объектов данного менеджера
		 */
		this.by_ref = {};

    /**
     * ### Индекс по коду-номеру
     */
    this._by_id = {};

	}

	toString(){
		return msg.meta_mgrs[this._owner.name]
	}

  /**
   * ### toJSON
   * для сериализации возвращаем внутренний _obj
   */
  toJSON() {
    return {type: 'DataManager', class_name: this.class_name};
  }

	/**
	 * ### Метаданные объекта
	 * указатель на фрагмент глобальных метаданных, относящийся к текущему классу данных
	 *
	 * @method metadata
	 * @for DataManager
	 * @return {Object} - объект метаданных
	 */
	metadata(field_name) {
	  const {md} = this._owner.$p;
	  const _meta = md.get(this) || {};
		if(field_name){
			return _meta.fields && _meta.fields[field_name] || md.get(this, field_name);
		}
		else{
			return _meta;
		}
	}

	/**
	 * Указатель на адаптер данных этого менеджера
	 */
	get adapter(){
    const {adapters} = this._owner.$p;
    return adapters[this.cachable] || adapters.pouch;
	}

	/**
	 * ### Указатель на массив, сопоставленный с таблицей локальной базы данных
	 * Фактически - хранилище объектов данного класса
	 * @property alatable
	 * @type Array
	 * @final
	 */
	get alatable(){
		const {table_name, _owner} = this;
		const {tables} = _owner.$p.wsql.aladb;
		return tables[table_name] ? tables[table_name].data : []
	}

  /**
   * ### Права текущего пользователя на объекты этого менеджера
   * @property acl
   * @type Array
   * @final
   */
	get acl() {
	  const {current_user} = this._owner.$p;
    return current_user ? current_user.get_acl(this.class_name) : 'r';
  }

	/**
	 * ### Способ кеширования объектов этого менеджера
	 *
	 * Выполняет две функции:
	 * - Указывает, нужно ли сохранять (искать) объекты в локальном кеше или сразу топать на сервер
	 * - Указывает, нужно ли запоминать представления ссылок (инверсно).
	 * Для кешируемых, представления ссылок запоминать необязательно, т.к. его быстрее вычислить по месту
	 * @property cachable
	 * @for DataManager
	 * @type String - ("ram", "doc", "remote", "meta", "e1cib")
	 * @final
	 */
	get cachable(){

    const {class_name, _cachable} = this;
    if(_cachable) {
      return _cachable;
    }

    const _meta = this.metadata();

    // перечисления кешируются всегда
    if(class_name.indexOf('enm.') != -1) {
      return 'ram';
    }

    // Если в метаданных явно указано правило кеширования, используем его
    if(_meta && _meta.cachable) {
      return _meta.cachable;
    }

    // документы, отчеты и обработки по умолчанию кешируем в idb, но в память не загружаем
    if(class_name.indexOf('doc.') != -1 || class_name.indexOf('dp.') != -1 || class_name.indexOf('rep.') != -1) {
      return 'doc';
    }

    // остальные классы по умолчанию кешируем и загружаем в память при старте
    return 'ram';
  }

	/**
	 * ### Имя таблицы объектов этого менеджера в базе alasql
	 * @property table_name
	 * @type String
	 * @final
	 */
	get table_name(){
    return this.class_name.replace('.', '_');
	}

	/**
	 * ### Найти строки
	 * Возвращает массив дата-объектов, обрезанный отбором _selection_<br />
	 * Eсли отбор пустой, возвращаются все строки, закешированные в менеджере.
	 * Имеет смысл для объектов, у которых _cachable = "ram"_
	 * @method find_rows
	 * @param selection {Object} - в ключах имена полей, в значениях значения фильтра или объект {like: значение}
	 * @param [callback] {Function} - в который передается текущий объект данных на каждой итерации
	 * @return {Array}
	 */
	find_rows(selection, callback){
		return utils._find_rows.call(this, this, selection, callback);
	}

	/**
	 * ### Найти строки на сервере
	 * @param selection
	 * @async
	 */
	find_rows_remote(selection) {
		return this.adapter.find_rows(this, selection);
	}

	/**
	 * ### Дополнительные реквизиты
	 * Массив дополнителных реквизитов (аналог подсистемы `Свойства` БСП) вычисляется через
	 * ПВХ `НазначениеДополнительныхРеквизитов` или справочник `НазначениеСвойствКатегорийОбъектов`
	 *
	 * @property extra_fields
	 * @type Array
	 */
  extra_fields(obj) {
    const {cat, cch, md} = this._owner.$p;
    // ищем предопределенный элемент, сответствующий классу данных
    const dests = cat.destinations || cch.destinations;
    const res = [];
    if(dests) {
      const condition = this._destinations_condition || {predefined_name: md.class_name_to_1c(this.class_name).replace('.', '_')};
      dests.find_rows(condition, destination => {
        const ts = destination.extra_fields || destination.ДополнительныеРеквизиты;
        if(ts) {
          ts.each(row => {
            if(!row._deleted && !row.ПометкаУдаления) {
              res.push(row.property || row.Свойство);
            }
          });
        }
        return false;
      });
    }
    return res;
  }

	/**
	 * ### Дополнительные свойства
	 * Массив дополнителных свойств (аналог подсистемы `Свойства` БСП) вычисляется через
	 * ПВХ `НазначениеДополнительныхРеквизитов` или справочник `НазначениеСвойствКатегорийОбъектов`
	 *
	 * @property extra_properties
	 * @type Array
	 */
	extra_properties(obj){
		return [];
	}

	/**
	 * ### Имя функции - конструктора объектов или строк табличных частей
	 *
	 * @method obj_constructor
	 * @param [ts_name] {String}
	 * @param [mode] {Boolean | Object }
	 * @return {String | Function | DataObj}
	 */
	obj_constructor(ts_name = "", mode) {

		if(!this.constructor_names[ts_name]){
			const parts = this.class_name.split("."),
				fn_name = parts[0].charAt(0).toUpperCase() + parts[0].substr(1) + parts[1].charAt(0).toUpperCase() + parts[1].substr(1);
			this.constructor_names[ts_name] = ts_name ? fn_name + ts_name.charAt(0).toUpperCase() + ts_name.substr(1) + "Row" : fn_name;
		}

		ts_name = this.constructor_names[ts_name];

		// если режим не указан, возвращаем имя функции - конструктора
		if(!mode){
			return ts_name;
		}
		// если булево - возвращаем саму функцию - конструктор
		const constructor = this._owner.$p[ts_name];
		if(mode === true ){
			return constructor;
		}
		// если массив - создаём объект с параметрами, указанными в массиве
		if(Array.isArray(mode)){
			return new constructor(...mode);
		}
		// иначе - создаём объект и передаём в конструктор единственный параметр
		return new constructor(mode);
	}

	/**
	 * ### Возвращает массив доступных значений для комбобокса
	 * @method get_option_list
	 * @for DataManager
	 * @param [selection] {Object} - отбор, который будет наложен на список
	 * @param [selection._top] {Number} - ограничивает длину возвращаемого массива
	 * @return {Promise.<Array>}
	 */
	get_option_list(selection = {}, val){

		let t = this, l = [], input_by_string, text;

    function push(v){
      if(selection._dhtmlx){
        const opt = {
          text: v.presentation,
          value: v.ref
        }
        if(utils.is_equal(opt.value, val)){
          opt.selected = true;
        }
        if(v.class_name == 'cat.property_values' && v.css) {
          opt.css = v.css;
        }
        l.push(opt);
      }
      else if(!v.empty()){
        l.push(v);
      }
    }

    // поиск по строке
    if(selection.presentation && (input_by_string = t.metadata().input_by_string)) {
      text = selection.presentation.like;
      delete selection.presentation;
      selection.or = [];
      input_by_string.forEach((fld) => {
        const sel = {};
        sel[fld] = {like: text};
        selection.or.push(sel);
      });
    }

    if(t.cachable.endsWith('ram') || t._direct_ram || (selection && selection._local)) {
      t.find_rows(selection._mango ? selection.selector : selection, push);
      return Promise.resolve(l);
    }
    else if(t.cachable != 'e1cib') {
      if(selection._mango){
        if(selection.selector.hasOwnProperty('$and')) {
          selection.selector.push({class_name: t.class_name})
        }
        else {
          selection.selector.class_name = t.class_name;
        }
      }
      return t.adapter.find_rows(t, selection)
        .then((data) => {
          for (const v of data) {
            push(v);
          };
          return l;
        });
    }
    else {
      // для некешируемых выполняем запрос к серверу
      let attr = {selection: selection, top: selection._top},
        is_doc = t instanceof DocManager || t instanceof BusinessProcessManager;
      delete selection._top;

      if(is_doc) {
        attr.fields = ['ref', 'date', 'number_doc'];
      }
      else if(t.metadata().main_presentation_name) {
        attr.fields = ['ref', 'name'];
      }
      else {
        attr.fields = ['ref', 'id'];
      }

      return _rest.load_array(attr, t)
        .then((data) => {
          data.forEach(push);
          return l;
        });
    }
  }

	/**
	 * ### Возвращает менеджер значения по свойству строки
	 * @method value_mgr
	 * @param row {Object|TabularSectionRow} - строка табчасти или объект
	 * @param f {String} - имя поля
	 * @param mf {Object} - описание типа поля mf.type
	 * @param array_enabled {Boolean} - возвращать массив для полей составного типа или первый доступный тип
	 * @param v {*} - устанавливаемое значение
	 * @return {DataManager|Array|undefined}
	 */
	value_mgr(row, f, mf, array_enabled, v) {

    if(mf._mgr) {
      return mf._mgr;
    }

    const {$p} = this._owner;

		if (mf.types.length == 1) {
      const tnames = mf.types[0].split('.');
      if(tnames.length > 1 && $p[tnames[0]]) {
        return DataManager.mf_mgr($p[tnames[0]][tnames[1]], mf);
      }
    }
		else if (v && v.type) {
      const tnames = v.type.split('.');
      if(tnames.length > 1 && $p[tnames[0]]) {
        return DataManager.mf_mgr($p[tnames[0]][tnames[1]], mf);
      }
    }

		let property = row.property || row.param;
    if(f != 'value' || !property) {

      const rt = [];
      mf.types.forEach((v) => {
        const tnames = v.split('.');
        if(tnames.length > 1 && $p[tnames[0]][tnames[1]]) {
          rt.push($p[tnames[0]][tnames[1]]);
        }
      });
      if(!rt.length) {
        return ;
      }
      if(rt.length === 1) {
        return DataManager.mf_mgr(rt[0], mf);
      }
      else if(array_enabled) {
        return rt;
      }
      else if((property = row[f]) instanceof DataObj) {
        return property._manager;
      }
      else if(mf?.default && (!property || property === utils.blank.guid)) {
        const tnames = mf.default.split('.');
        return $p[tnames[0]][tnames[1]];
      }
      else if(property && property != utils.blank.guid) {
        for (const mgr of rt) {
          const v = mgr.by_ref[property?.ref || property];
          if(v && !v.is_new()) {
            return mgr;
          }
        }
        // на втором проходе, разрешаем незаписанные
        for (const mgr of rt) {
          if(mgr.by_ref[property]) {
            return mgr;
          }
        }
      }
    }
		else {

			// Получаем объект свойства
      let oproperty;
			if (utils.is_data_obj(property)){
				oproperty = property;
			}
			else if (utils.is_guid(property)){
				oproperty = $p.cch.properties.get(property);
			}
			else{
				return;
			}

			if (utils.is_data_obj(oproperty)) {

				if (oproperty.is_new()){
					return $p.cat.property_values;
				}

				// и через его тип выходми на мнеджера значения
        const rt = [];
        oproperty.type.types.some((v) => {
          const tnames = v.split('.');
          if(tnames.length > 1 && $p[tnames[0]][tnames[1]]) {
            rt.push($p[tnames[0]][tnames[1]]);
          }
          else if(v == 'boolean') {
            rt.push({types: ['boolean']});
            return true;
          }
        });
				if(rt.length == 1 || row[f] == utils.blank.guid){
					return DataManager.mf_mgr(rt[0], mf);
				}
				else if(array_enabled){
					return rt;
				}
				else if((property = row[f]) instanceof DataObj){
					return property._manager;
				}
				else if(utils.is_guid(property) && property != utils.blank.guid){
					for(const mgr of rt){
						if(mgr.by_ref[property]){
							return mgr;
						}
					}
				}
			}
		}
	}

	/**
	 * Возвращает промис со структурой печатных форм объекта
	 * @return {Promise.<Object>}
	 */
	printing_plates(){
		const rattr = {};
		const {ajax} = this._owner.$p;

		if(!this._printing_plates){
			if(this.metadata().printing_plates){
        this._printing_plates = this.metadata().printing_plates;
			}
			else {
			  const {cachable} = this.metadata();
        if(cachable && (cachable.indexOf('doc') == 0 || cachable.indexOf('ram') == 0)){
          this._printing_plates = {};
        }
      }
		}

		// атавизм совместимости с 1С
    if(!this._printing_plates && ajax.authorized) {
      ajax.default_attr(rattr, job_prm.irest_url());
      rattr.url += this.rest_name + '/Print()';
      return ajax.get_ex(rattr.url, rattr)
        .then((req) => {
          this._printing_plates = JSON.parse(req.response);
          return this._printing_plates;
        })
        .catch(() => null)
        .then((pp) => pp || (this._printing_plates = {}));
    }

		return Promise.resolve(this._printing_plates);

	}

  /**
   * Удаляет объект из alasql и локального кеша
   * @method unload_obj
   * @param ref
   */
  unload_obj(ref) {
    if(ref === utils.blank.ref) {
      return;
    }
    delete this.by_ref[ref];
    this.alatable.some((o, i, a) => {
      if(o.ref == ref){
        if(o.id && this._by_id[o.id]) {
          delete this._by_id[o.id];
        }
        else if(o.number_doc && this._by_id[o.number_doc]) {
          delete this._by_id[o.number_doc];
        }
        a.splice(i, 1);
        return true;
      }
    });
  }

  /**
   * Синоним для each()
   */
  forEach(fn) {
    return this.each(fn);
  }

  /**
   * Итератор
   * @return {Iterator}
   */
  [Symbol.iterator]() {
    return new Iterator(this.by_ref, this.alatable);
  }

  /**
   * Вспомогательный метод для value_mgr
   * @param mgr {DataManager}
   * @param mf {Object} - метаданные текущего поля
   * @returns {DataManager}
   */
  static mf_mgr(mgr, mf) {
    if (mgr && mf.types.length == 1){
      mf._mgr = mgr;
    }
    return mgr;
  }
}

/**
 * ### Aбстрактный менеджер ссылочных данных
 * От него унаследованы менеджеры документов, справочников, планов видов характеристик и планов счетов
 *
 * @class RefDataManager
 * @extends DataManager
 * @constructor
 * @param class_name {string} - имя типа менеджера объекта
 */
export class RefDataManager extends DataManager{

	/**
	 * Помещает элемент ссылочных данных в локальную коллекцию
	 * @method push
	 * @param o {DataObj}
	 * @param [new_ref] {String} - новое значение ссылки объекта
	 */
	push(o, new_ref){
		if(new_ref && (new_ref != o.ref)){
			delete this.by_ref[o.ref];
			this.by_ref[new_ref] = o;
		}else
			this.by_ref[o.ref] = o;
	}

	/**
	 * Выполняет перебор элементов локальной коллекции
	 * @method each
	 * @param fn {Function} - функция, вызываемая для каждого элемента локальной коллекции
	 */
	each(fn){
    for (const i in this.by_ref) {
      if(!i || i === utils.blank.guid) {
        continue;
      }
      if(fn.call(this, this.by_ref[i]) === true) {
        break;
      }
    }
  }

	/**
	 * Возвращает объект по ссылке (читает из датабазы или локального кеша) если идентификатор пуст, создаёт новый объект
	 * @method get
	 * @param [ref] {String|Object} - ссылочный идентификатор
	 * @param [no_create] {Boolean} - Не создавать новый. Например, когда поиск элемента выполняется из конструктора
	 * @return {DataObj|undefined}
	 */
	get(ref, no_create){

		if(!ref || typeof ref !== string){
      ref = utils.fix_guid(ref);
    }
		let o = this.by_ref[ref];

		if(arguments.length == 3){
			if(no_create){
				no_create = rp;
			}
			else{
				no_create = arguments[2];
			}
		}
		let created;
		if(!o){
			if(no_create && no_create != rp){
				return;
			}
			else{
				o = this.obj_constructor('', [ref, this]);
        created = true;
			}
		}

		if(ref === utils.blank.guid){
			return no_create == rp ? Promise.resolve(o) : o;
		}

		if(o.is_new()){
			if(no_create == rp){
        // читаем из базы
				return o.load()
          .then(() => {
            return o.is_new() ? o.after_create() : o;
          });
			}
			else{
        created && arguments.length !== 3 && o.after_create();
				return o;
			}
		}else{
			return no_create == rp ? Promise.resolve(o) : o;
		}
	}

	/**
	 * ### Создаёт новый объект типа объектов текущего менеджера
	 * Для кешируемых объектов, все действия происходят на клиенте<br />
	 * Для некешируемых, выполняется обращение к серверу для получения guid и значений реквизитов по умолчанию
	 *
	 * @method create
	 * @param [attr] {Object} - значениями полей этого объекта будет заполнен создаваемый объект
	 * @param [do_after_create] {Boolean} - признак, надо ли заполнять (инициализировать) создаваемый объект значениями полей по умолчанию
	 * @return {Promise.<*>}
	 */
	create(attr, do_after_create, force_obj){

		if(!attr || typeof attr !== "object"){
			attr = {};
		}
		else if(utils.is_data_obj(attr)){
			return Promise.resolve(attr);
		}

		if(!attr.ref || !utils.is_guid(attr.ref) || utils.is_empty_guid(attr.ref)){
			attr.ref = utils.generate_guid();
		}

		let o = this.by_ref[attr.ref];

		if(!o){

			o = this.obj_constructor('', [attr, this, do_after_create === false]);

      // Триггер после создания
      const after_create_res = do_after_create === false ? false : o.after_create();

      if(o instanceof DocObj && o.date == utils.blank.date){
        o.date = new Date();
      }

      if(force_obj){
        return o;
      }

      // Если новый код или номер не были назначены в триггере - устанавливаем стандартное значение
      let call_new_number_doc;
      if((this instanceof DocManager || this instanceof TaskManager || this instanceof BusinessProcessManager)){
        call_new_number_doc = !o.number_doc;
      }
      else{
        call_new_number_doc = !o.id;
      }

      return (call_new_number_doc ? o.new_number_doc() : Promise.resolve(o))
        .then(() => {

          // выполняем обработчик после создания объекта и стандартные действия, если их не запретил обработчик
          if(this.cachable == 'e1cib' && do_after_create) {
            const {ajax} = this._owner.$p;
            const rattr = {};
            ajax.default_attr(rattr, job_prm.irest_url());
            rattr.url += this.rest_name + '/Create()';
            return ajax.get_ex(rattr.url, rattr)
              .then(function (req) {
                return o._mixin(JSON.parse(req.response), undefined, ['ref']);
              });
          }
          else {
            return after_create_res instanceof Promise ? after_create_res : o;
          }
        });
		}

		return force_obj ? o : Promise.resolve(o);

	}

	/**
	 * Находит первый элемент, в любом поле которого есть искомое значение
	 * @method find
	 * @param val {*} - значение для поиска
	 * @param columns {String|Array} - колонки, в которых искать
	 * @return {DataObj}
	 */
	find(val, columns){
		return utils._find(this.by_ref, val, columns);
	}

	/**
	 * ### Сохраняет массив объектов в менеджере
	 *
	 * @method load_array
	 * @param aattr {Array} - массив объектов для трансформации в объекты ссылочного типа
	 * @param [forse] {Boolean|String} - перезаполнять объект
   * при forse == "update_only", новые объекты не создаются, а только перезаполняются ранее загруженные в озу
	 */
	load_array(aattr, forse){
		const res = [];
    const {wsql} = this._owner.$p;
    const {grouping, tabular_sections} = this.metadata();
		for(const attr of aattr){
		  if(grouping === 'array' && attr.ref.length <= 3) {
		    res.push.apply(res, this.load_array(attr.rows, forse));
		    continue;
      }
			let obj = this.by_ref[utils.fix_guid(attr)];
			if(!obj){
        if(forse === 'update_only') {
					continue;
				}
				obj = this.obj_constructor('', [attr, this, true]);
				obj.is_new() && obj._set_loaded();
			}
			else if(obj.is_new() || forse){
			  if(obj.is_new() || forse !== 'update_only') {
          obj._data._loading = true;
        }
        else if(forse === 'update_only' && attr.timestamp) {
          if(attr.timestamp.user === (this.adapter.authorized || wsql.get_user_param('user_name'))) {
            if(new Date() - moment(attr.timestamp.moment, "YYYY-MM-DDTHH:mm:ss ZZ").toDate() < 30000) {
              attr._rev && (obj._obj._rev = attr._rev);
              continue;
            }
          }
        }
				obj._mixin(attr);
        attr._rev && (obj._obj._rev = attr._rev);
			}
      for(const ts in tabular_sections) {
        obj[ts]._index && obj[ts]._index.clear();
      }
			res.push(obj);
		}
		return res;
	}

	/**
	 * Находит перую папку в пределах подчинения владельцу
	 * @method first_folder
	 * @param owner {DataObj|String}
	 * @return {DataObj} - ссылка найденной папки или пустая ссылка
	 */
	first_folder(owner){
		for(let i in this.by_ref){
			const o = this.by_ref[i];
			if(o.is_folder && (!owner || utils.is_equal(owner, o.owner))) return o;
		}
		return this.get();
	}

	/**
	 * Возаращает массив запросов для создания таблиц объекта и его табличных частей
	 * @method get_sql_struct
	 * @param attr {Object}
	 * @param attr.action {String} - [create_table, drop, insert, update, replace, select, delete]
	 * @return {Object|String}
	 */
	get_sql_struct(attr){
		const {sql_mask, sql_type} = this._owner.$p.md;
		var t = this,
			cmd = t.metadata(),
			res = {}, f, f0, trunc_index = 0,
			action = attr && attr.action ? attr.action : "create_table";


		function sql_selection(){

			let ignore_parent = !attr.parent,
				parent = attr.parent || utils.blank.guid,
				owner,
				initial_value = attr.initial_value || utils.blank.guid,
				filter = attr.filter || "",
				set_parent = utils.blank.guid;
      const and = '\n AND ';

			function list_flds(){
				var flds = [], s = "_t_.ref, _t_.`_deleted`";

				if(cmd.form && cmd.form.selection){
					cmd.form.selection.fields.forEach(function (fld) {
						flds.push(fld);
					});
				}
				else if(t instanceof DocManager){
					flds.push("posted");
					flds.push("date");
					flds.push("number_doc");
				}
				else{
          if(cmd.hierarchical && cmd.group_hierarchy) {
            flds.push('is_folder');
          }
          else {
            flds.push('0 as is_folder');
          }

          if(t instanceof ChartOfAccountManager) {
            flds.push('id');
            flds.push('name as presentation');
          }
          else if(cmd.main_presentation_name) {
            flds.push('name as presentation');
          }
          else {
            if(cmd['code_length']) {
              flds.push("id as presentation");
            }
            else {
              flds.push("'...' as presentation");
            }
          }

          if(cmd.has_owners) {
            flds.push('owner');
          }

          if(cmd.code_length) {
            flds.push("id");
          }
        }

				flds.forEach(fld => {
					if(fld.indexOf(" as ") != -1)
						s += ", " + fld;
					else
						s += sql_mask(fld, true);
				});
				return s;

			}

			function join_flds(){

				var s = "", parts;

				if(cmd.form && cmd.form.selection){
					for(var i in cmd.form.selection.fields){
						if(cmd.form.selection.fields[i].indexOf(" as ") == -1 || cmd.form.selection.fields[i].indexOf("_t_.") != -1)
							continue;
						parts = cmd.form.selection.fields[i].split(" as ");
						parts[0] = parts[0].split(".");
						if(parts[0].length > 1){
							if(s)
								s+= "\n";
							s+= "left outer join " + parts[0][0] + " on " + parts[0][0] + ".ref = _t_." + parts[1];
						}
					}
				}
				return s;
			}

			function where_flds(){

				var s;

				if(t instanceof ChartOfAccountManager){
					s = " WHERE (" + (filter ? 0 : 1);
				}
				else if(cmd["hierarchical"]){
					if(cmd.has_owners)
						s = " WHERE (" + (ignore_parent || filter ? 1 : 0) + " OR _t_.parent = '" + parent + "') AND (" +
							(owner == utils.blank.guid ? 1 : 0) + " OR _t_.owner = '" + owner + "') AND (" + (filter ? 0 : 1);
					else
						s = " WHERE (" + (ignore_parent || filter ? 1 : 0) + " OR _t_.parent = '" + parent + "') AND (" + (filter ? 0 : 1);
				}
				else{
					if(cmd.has_owners)
						s = " WHERE (" + (owner == utils.blank.guid ? 1 : 0) + " OR _t_.owner = '" + owner + "') AND (" + (filter ? 0 : 1);
					else
						s = " WHERE (" + (filter ? 0 : 1);
				}

				if(t.sql_selection_where_flds){
					s += t.sql_selection_where_flds(filter);
				}
				else if(t instanceof DocManager){
          s += " OR _t_.number_doc LIKE '" + filter + "'";
        }
				else{
					if(cmd["main_presentation_name"] || t instanceof ChartOfAccountManager)
						s += " OR _t_.name LIKE '" + filter + "'";

					if(cmd["code_length"])
						s += " OR _t_.id LIKE '" + filter + "'";
				}

				s += ") AND (_t_.ref != '" + utils.blank.guid + "')";

				// добавляет условие
				const sel_el = (sel) => {
          for(let key in sel){
            if(typeof sel[key] == "function"){
              s += and + sel[key](t, key) + " ";
            }
            else if(Array.isArray(sel[key])) {
              sel[key].forEach((el) => sel_el({[key]: el}));
            }
            else if(cmd.fields.hasOwnProperty(key) || key === "ref"){
              if(sel[key] === true){
                s += and + "_t_." + key + " ";
              }
              else if(sel[key] === false){
                s += and + "(not _t_." + key + ") ";
              }
              else if(typeof sel[key] == "object"){
                if(utils.is_data_obj(sel[key]) || utils.is_guid(sel[key])){
                  s += and + "(_t_." + key + " = '" + sel[key] + "') ";
                }
                else{
                  var keys = Object.keys(sel[key]),
                    val = sel[key][keys[0]],
                    mf = cmd.fields[key] || t.metadata(key),
                    vmgr;

                  if(mf && mf.type.is_ref){
                    vmgr = t.value_mgr({}, key, mf.type, true, val);
                  }

                  if(['not', 'ne', '$ne'].includes(keys[0])){
                    s += and + "(not _t_." + key + " = '" + val + "') ";
                  }
                  else if(keys[0] == "in"){
                    if(Array.isArray(attr.params)) {
                      s += and +  "(_t_." + key + " in @(?))";
                      attr.params.push(Array.isArray(val) ? val.map(v => v && v.valueOf()) : [val && val.valueOf()]);
                    }
                    else {
                      s += and +  "(_t_." + key + " in (" + (Array.isArray(val) ? val : [val]).reduce((sum, val) => {
                        if(sum){
                          sum+=",";
                        }
                        sum+= typeof val == "number" ? val.toString() : "'" + val + "'";
                        return  sum;
                      }, "") + ")) ";
                    }
                  }
                  else if(keys[0] == "nin"){
                    s += and +  "(_t_." + key + " not in (" + (Array.isArray(val) ? val : [val]).reduce((sum, val) => {
                      if(sum){
                        sum+=",";
                      }
                      sum+= typeof val == "number" ? val.toString() : "'" + val + "'";
                      return  sum;
                    }, "") + ")) ";
                  }
                  else if(keys[0] == "inh"){
                    // получаем массив папок в иерархии текущих
                    const folders = [];
                    (Array.isArray(val) ? val : [val]).forEach((val) => {
                      const folder = vmgr.get(val, true);
                      if(folder) {
                        if(folders.indexOf(folder) === -1){
                          folders.push(folder);
                          folder.is_folder && folder._children().forEach((child) => folders.indexOf(child) === -1 && folders.push(child));
                        }
                      }
                    });
                    s += and +  "(_t_." + key + " in (" + folders.reduce((sum, val) => {
                      if(sum){
                        sum+=",";
                      }
                      sum+= "'" + val.ref + "'";
                      return  sum;
                    }, "") + ")) ";
                  }
                  else{
                    s += and + "(_t_." + key + " = '" + val + "') ";
                  }
                }

              }else if(typeof sel[key] === string)
                s += and + "(_t_." + key + " = '" + sel[key] + "') ";

              else
                s += and + "(_t_." + key + " = " + sel[key] + ") ";

            }
            else if(key=="is_folder" && cmd.hierarchical && cmd.group_hierarchy){
              //if(sel[key])
              //	s += and + "_t_." + key + " ";
              //else
              //	s += and + "(not _t_." + key + ") ";
            }
          }
        };


				// допфильтры форм и связей параметров выбора
				if(attr.selection){
					if(typeof attr.selection === "function"){
            attr.selection(s);
					}
					else{
            attr.selection.forEach(sel_el);
          }
				}

				return s;
			}

      function order_flds() {
        if(t instanceof ChartOfAccountManager) {
          return 'ORDER BY id';
        }
        else if(cmd.hierarchical) {
          if(cmd.group_hierarchy) {
            return 'ORDER BY _t_.is_folder desc, is_initial_value, presentation';
          }
          else {
            return 'ORDER BY _t_.parent desc, is_initial_value, presentation';
          }
        }
        else {
          return 'ORDER BY is_initial_value, presentation';
        }
      }

			function selection_prms(){

				// т.к. в процессе установки может потребоваться получение объектов, код асинхронный
				function on_parent(o){

					// ссылка родителя для иерархических справочников
					if(o){
						set_parent = (attr.set_parent = o.parent.ref);
						parent = set_parent;
						ignore_parent = false;

					}

					// строка фильтра
					if(filter && filter.indexOf("%") == -1)
						filter = "%" + filter + "%";

				}

				// установим владельца
				if(cmd.has_owners){
					owner = attr.owner;
					if(attr.selection && typeof attr.selection != "function"){
						attr.selection.forEach(sel => {
							if(sel.owner){
								owner = typeof sel.owner == "object" ?  sel.owner.valueOf() : sel.owner;
								delete sel.owner;
							}
						});
					}
					if(!owner)
						owner = utils.blank.guid;
				}

				// ссылка родителя во взаимосвязи с начальным значением выбора
				if(initial_value !=  utils.blank.guid && ignore_parent){
					if(cmd["hierarchical"]){
						on_parent(t.get(initial_value))
					}else
						on_parent();
				}else
					on_parent();

			}

			selection_prms();

			const sql = t.sql_selection_list_flds ? t.sql_selection_list_flds(initial_value) :
        `SELECT ${list_flds()}, case when _t_.ref = '${initial_value}' then 0 else 1 end as is_initial_value
				 FROM ${t.table_name} AS _t_ ${join_flds()} %3 %4 LIMIT 300`;

      return sql.replace('%4', order_flds()).replace('%3', where_flds());

		}

		function sql_create(){

			var sql = "CREATE TABLE IF NOT EXISTS ";

			if(attr && attr.postgres){
				sql += t.table_name+" (ref uuid PRIMARY KEY NOT NULL, _deleted boolean";

				if(t instanceof DocManager)
					sql += ", posted boolean, date timestamp with time zone, number_doc character(11)";
				else{
					if(cmd.code_length)
						sql += ", id character("+cmd.code_length+")";
					sql += ", name character varying(50), is_folder boolean";
				}

				for(f in cmd.fields){
					if(f.length > 30){
						if(cmd.fields[f].short_name)
							f0 = cmd.fields[f].short_name;
						else{
							trunc_index++;
							f0 = f[0] + trunc_index + f.substr(f.length-27);
						}
					}else
						f0 = f;
					sql += ", " + f0 + sql_type(t, f, cmd.fields[f].type, true);
				}

				for(f in cmd["tabular_sections"])
					sql += ", " + "ts_" + f + " JSON";

			}else{
				sql += "`"+t.table_name+"` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN";

				if(t instanceof DocManager)
					sql += ", posted boolean, date Date, number_doc CHAR";
				else
					sql += ", id CHAR, name CHAR, is_folder BOOLEAN";

				for(f in cmd.fields)
					sql += sql_mask(f) + sql_type(t, f, cmd.fields[f].type);

				for(f in cmd["tabular_sections"])
					sql += ", " + "`ts_" + f + "` JSON";
			}

			sql += ")";

			return sql;
		}

		function sql_update(){
			// "INSERT OR REPLACE INTO user_params (prm_name, prm_value) VALUES (?, ?);
			var fields = ["ref", "_deleted"],
				sql = "INSERT INTO `"+t.table_name+"` (ref, `_deleted`",
				values = "(?";

			if(t.class_name.substr(0, 3)=="cat"){
				sql += ", id, name, is_folder";
				fields.push("id");
				fields.push("name");
				fields.push("is_folder");

			}else if(t.class_name.substr(0, 3)=="doc"){
				sql += ", posted, date, number_doc";
				fields.push("posted");
				fields.push("date");
				fields.push("number_doc");

			}
			for(f in cmd.fields){
				sql += sql_mask(f);
				fields.push(f);
			}
			for(f in cmd["tabular_sections"]){
				sql += ", `ts_" + f + "`";
				fields.push("ts_" + f);
			}
			sql += ") VALUES ";
			for(f = 1; f<fields.length; f++){
				values += ", ?";
			}
			values += ")";
			sql += values;

			return {sql: sql, fields: fields, values: values};
		}


    if(action == 'create_table') {
      res = sql_create();
    }
    else if(['insert', 'update', 'replace'].indexOf(action) != -1) {
      res[t.table_name] = sql_update();
    }
    else if(action == 'select') {
      res = 'SELECT * FROM `' + t.table_name + '` WHERE ref = ?';
    }
    else if(action == 'select_all') {
      res = 'SELECT * FROM `' + t.table_name + '`';
    }
    else if(action == 'delete') {
      res = 'DELETE FROM `' + t.table_name + '` WHERE ref = ?';
    }
    else if(action == 'drop') {
      res = 'DROP TABLE IF EXISTS `' + t.table_name + '`';
    }
    else if(action == 'get_tree') {
      res = 'SELECT ref, parent, name as presentation FROM `' + t.table_name + '`';
      if(!attr.filter || attr.filter.is_folder) {
        res += ' WHERE is_folder ';
        if(attr.filter && attr.filter.ref) {
          res += `and ref in (${attr.filter.ref.in.map(v => `"${v.ref}"`).join(',')})`;
        }
      }
      else if(attr.filter && attr.filter.ref) {
        if(attr.filter && attr.filter.ref) {
          res += ` WHERE ref in (${attr.filter.ref.in.map(v => `"${v.ref}"`).join(',')})`;
        }
      }
      res += ' order by parent, name';
    }
    else if(action == 'get_selection') {
      res = sql_selection();
    }

    return res;
	}

	/**
	 * Возаращает предопределенный элемент по имени предопределенных данных
	 * @method predefined
	 * @param name {String} - имя предопределенного
	 * @return {DataObj}
	 */
	predefined(name){
		if(!this._predefined){
      this._predefined = {};
      this.find_rows({predefined_name: {not: ''}}, (el) => {
        this._predefined[el.predefined_name] = el;
      });
    }
		else if(!this._predefined[name]){
      this.find_rows({predefined_name: name}, (el) => {
        this._predefined[name] = el;
      });
    }
		return this._predefined[name];
	}

  /**
   * Получает присоединенный к объекту файл
   * @param ref
   * @param att_id
   * @return {Promise}
   */
  get_attachment(ref, att_id) {
    const {adapter} = this;
    return adapter.get_attachment ? adapter.get_attachment(this, ref, att_id) : Promise.reject();
  }

  /**
   * ### Сохраняет присоединенный файл
   *
   * @method save_attachment
   * @for DataManager
   * @param ref
   * @param att_id
   * @param attachment
   * @param type
   * @return {Promise}
   * @async
   */
  save_attachment(ref, att_id, attachment, type) {
    const {adapter} = this;
    return adapter.save_attachment ? adapter.save_attachment(this, ref, att_id, attachment, type) : Promise.reject();
  }

  /**
   * Удаляет присоединенный к объекту файл
   * @param ref
   * @param att_id
   * @return {Promise}
   */
  delete_attachment(ref, att_id) {
    const {adapter} = this;
    return adapter.delete_attachment ? adapter.delete_attachment(this, ref, att_id) : Promise.reject();
  }

  /**
   * Возвращает массив оборванных ссылок в объектах текущего менеджера
   * @return {Array}
   */
  broken_links() {
    const res = [];
    const push = res.push.bind(res);
    for(const ref in this.by_ref) {
      this.by_ref[ref].broken_links().forEach(push);
    }
    return res;
  }

}

/**
 * ### Абстрактный менеджер обработок
 * Экземпляры объектов этого класса создаются при выполнении конструктора {{#crossLink "Meta"}}{{/crossLink}}
 * в соответствии с описанием метаданных конфигурации и помещаются в коллекцию {{#crossLink "DataProcessors"}}{{/crossLink}}
 *
 * @class DataProcessorsManager
 * @extends DataManager
 * @param class_name {string} - имя типа менеджера объекта
 * @constructor
 */
export class DataProcessorsManager extends DataManager{

	/**
	 * Создаёт экземпляр объекта обработки
	 * @method create
	 * @return {DataProcessorObj}
	 */
	create(attr = {}, loading){
		return this.obj_constructor('', [attr, this, loading]);
	}

	/**
	 * Создаёт экземпляр объекта обработки - псевдоним create()
	 * @method get
	 * @return {DataProcessorObj}
	 */
	get(ref){
		if(ref){
			if(!this.by_ref[ref]){
				this.by_ref[ref] = this.create()
			}
			return this.by_ref[ref];
		}else
			return this.create();
	}

	/**
	 * fake-метод, не имеет смысла для обработок, т.к. они не кешируются в alasql. Добавлен, чтобы не ругалась форма объекта при закрытии
	 * @method unload_obj
	 */
	unload_obj() {	}
}

/**
 * ### Абстрактный менеджер перечисления
 * Экземпляры объектов этого класса создаются при выполнении конструктора {{#crossLink "Meta"}}{{/crossLink}}
 * в соответствии с описанием метаданных конфигурации и помещаются в коллекцию {{#crossLink "Enumerations"}}{{/crossLink}}
 *
 * @class EnumManager
 * @extends RefDataManager
 * @param class_name {string} - имя типа менеджера объекта. например, "enm.open_types"
 * @constructor
 */
export class EnumManager extends RefDataManager{

	constructor(owner, class_name) {
		super(owner, class_name);
		for(var v of this.metadata()){
      if('order' in v && v.name) {
        const value = new EnumObj(v, this);
        if(v.latin) {
          Object.defineProperty(this, v.latin, {value});
        }
      }
      else if(v.default) {
        Object.defineProperty(this, '_', {value: this.get(v.default)});
      }
		}
	}

  /**
   * Метаданные перечисления
   * @param field_name
   */
  metadata(field_name) {
	  const res = super.metadata(field_name);
	  if(!res.input_by_string){
      res.input_by_string = ['ref', 'synonym'];
    }
    return res;
  }

	get(ref, do_not_create){

		if(ref instanceof EnumObj){
      return ref;
    }
		else if(!ref || ref == utils.blank.guid){
      ref = "_";
    }
    else if(ref?.ref) {
      ref = ref.ref;
    }

		return this[ref] || new EnumObj({name: ref}, this);
	}

	push(value, new_ref){
    this.by_ref[new_ref] = value;
		Object.defineProperty(this, new_ref, {value});
	}

	each(fn) {
		this.alatable.forEach(v => {
			if(v.ref && v.ref != "_" && v.ref != utils.blank.guid)
				fn.call(this[v.ref]);
		});
	}

	/**
	 * Bозаращает массив запросов для создания таблиц объекта и его табличных частей
	 * @param attr {Object}
	 * @param attr.action {String} - [create_table, drop, insert, update, replace, select, delete]
	 * @return {Object|String}
	 */
	get_sql_struct(attr){

		var res = "CREATE TABLE IF NOT EXISTS ",
			action = attr && attr.action ? attr.action : "create_table";

		if(attr && attr.postgres){
			if(action == "create_table")
				res += this.table_name+
					" (ref character varying(255) PRIMARY KEY NOT NULL, sequence INT, synonym character varying(255))";
			else if(["insert", "update", "replace"].indexOf(action) != -1){
				res = {};
				res[this.table_name] = {
					sql: "INSERT INTO "+this.table_name+" (ref, sequence, synonym) VALUES ($1, $2, $3)",
					fields: ["ref", "sequence", "synonym"],
					values: "($1, $2, $3)"
				};

			}else if(action == "delete")
				res = "DELETE FROM "+this.table_name+" WHERE ref = $1";

		}else {
			if(action == "create_table")
				res += "`"+this.table_name+
					"` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR)";

			else if(["insert", "update", "replace"].indexOf(action) != -1){
				res = {};
				res[this.table_name] = {
					sql: "INSERT INTO `"+this.table_name+"` (ref, sequence, synonym) VALUES (?, ?, ?)",
					fields: ["ref", "sequence", "synonym"],
					values: "(?, ?, ?)"
				};

			}else if(action == "delete")
				res = "DELETE FROM `"+this.table_name+"` WHERE ref = ?";
		}



		return res;

	}

	/**
	 * Возвращает массив доступных значений для комбобокса
	 * @method get_option_list
	 * @param [selection] {Object}
	 * @param [selection._top] {Number}
	 * @return {Promise.<Array>}
	 */
	get_option_list(selection = {}, val){
		let l = [], synonym = "", sref;

    function push(v){
      if(selection._dhtmlx){
        v = {
          text: v.presentation,
          value: v.ref
        }
        if(utils.is_equal(v.value, val)){
          v.selected = true;
        }
        l.push(v);
      }
      else if(!v.empty()){
        l.push(v);
      }
    }

    for(const i in selection){
      if(i.substr(0,1)!="_"){
        if(i == "ref"){
          sref = selection[i].hasOwnProperty("in") ? selection[i].in : selection[i];
        }
        else
          synonym = selection[i];
      }
    }

		if(!selection._dhtmlx){
      l.push(this.get());
		}

		if(typeof synonym == "object"){
      synonym = synonym.like ? synonym.like : '';
		}
		synonym = synonym.toLowerCase();

		this.alatable.forEach(v => {
			if(synonym){
				if(!v.synonym || v.synonym.toLowerCase().indexOf(synonym) == -1){
          return;
        }
			}
			if(sref){
				if(Array.isArray(sref)){
					if(!sref.some(sv => sv.name == v.ref || sv.ref == v.ref || sv == v.ref))
						return;
				}else{
					if(sref.name != v.ref && sref.ref != v.ref && sref != v.ref)
						return;
				}
			}
			push(this[v.ref]);
		});

		return Promise.resolve(l);
	}

}

/**
 * ### Абстрактный менеджер регистра (накопления, сведений и бухгалтерии)
 *
 * @class RegisterManager
 * @extends DataManager
 * @constructor
 * @param class_name {string} - имя типа менеджера объекта. например, "ireg.prices"
 */
export class RegisterManager extends DataManager{

	/**
	 * Помещает элемент ссылочных данных в локальную коллекцию
	 * @method push
	 * @param o {RegisterRow}
	 * @param [new_ref] {String} - новое значение ссылки объекта
	 */
	push(o, new_ref) {
		if (new_ref && (new_ref != o.ref)) {
			delete this.by_ref[o.ref];
			this.by_ref[new_ref] = o;
		} else
			this.by_ref[o.ref] = o;
	}

	/**
	 * Возвращает массив записей c заданным отбором либо запись по ключу
	 * @method get
	 * @for InfoRegManager
	 * @param attr {Object} - объект {key:value...}
	 * @param return_row {Boolean} - возвращать запись, а не массив
	 * @return {*}
	 */
	get(attr, return_row) {

		if (!attr)
			attr = {};
		else if (typeof attr == string)
			attr = {ref: attr};

		if (attr.ref && return_row)
			return this.by_ref[attr.ref];

		attr.action = "select";

		const {alasql} = this._owner.$p.wsql;
		const arr = wsql.alasql(this.get_sql_struct(attr), attr._values);

		let res;

		delete attr.action;
		delete attr._values;

		if (arr.length) {
			if (return_row)
				res = this.by_ref[this.get_ref(arr[0])];
			else {
				res = [];
				for (var i in arr)
					res.push(this.by_ref[this.get_ref(arr[i])]);
			}
		}

		return res;
	}

	/**
	 * сохраняет массив объектов в менеджере
	 * @method load_array
	 * @param aattr {Array} - массив объектов для трансформации в объекты ссылочного типа
	 * @param forse {Boolean} - перезаполнять объект
	 */
	load_array(aattr, forse) {

		const res = [];

    for (const row of aattr) {
      const ref = this.get_ref(row);
      let obj = this.by_ref[ref];

      if (!obj && !row._deleted) {
        obj = this.obj_constructor('', [row, this, true]);
        obj.is_new() && obj._set_loaded();
      }
      else if (obj && row._deleted) {
        obj.unload();
        continue;
      }
      else if (forse) {
        obj._data._loading = true;
        obj._mixin(row);
      }

      res.push(obj);
    }

		return res;
	}

	/**
	 * Возаращает запросов для создания таблиц или извлечения данных
	 * @method get_sql_struct
	 * @for RegisterManager
	 * @param attr {Object}
	 * @param attr.action {String} - [create_table, drop, insert, update, replace, select, delete]
	 * @return {Object|String}
	 */
	get_sql_struct(attr) {
		const {sql_mask, sql_type} = this._owner.$p.md;
		var t = this,
			cmd = t.metadata(),
			res = {}, f,
			action = attr && attr.action ? attr.action : "create_table";

		function sql_selection(){

			var filter = attr.filter || "";

			function list_flds(){
				var flds = [], s = "_t_.ref";

        if(cmd.form && cmd.form.selection) {
          cmd.form.selection.fields.forEach(fld => flds.push(fld));
        }
        else {
          for (var f in cmd.dimensions) {
            flds.push(f);
          }
        }

        flds.forEach(fld => {
          if(fld.indexOf(' as ') != -1) {
            s += ', ' + fld;
          }
          else {
            s += sql_mask(fld, true);
          }
        });
        return s;

			}

			function join_flds(){

				var s = "", parts;

				if(cmd.form && cmd.form.selection){
					for(var i in cmd.form.selection.fields){
						if(cmd.form.selection.fields[i].indexOf(" as ") == -1 || cmd.form.selection.fields[i].indexOf("_t_.") != -1)
							continue;
						parts = cmd.form.selection.fields[i].split(" as ");
						parts[0] = parts[0].split(".");
						if(parts[0].length > 1){
							if(s)
								s+= "\n";
							s+= "left outer join " + parts[0][0] + " on " + parts[0][0] + ".ref = _t_." + parts[1];
						}
					}
				}
				return s;
			}

			function where_flds(){

				var s = " WHERE (" + (filter ? 0 : 1);

				if(t.sql_selection_where_flds){
					s += t.sql_selection_where_flds(filter);

				}

				s += ")";


				// допфильтры форм и связей параметров выбора
				if(attr.selection){
					if(typeof attr.selection == "function"){

					}
					else
						attr.selection.forEach(sel => {
							for(var key in sel){

								if(typeof sel[key] == "function"){
									s += "\n AND " + sel[key](t, key) + " ";

								}else if(cmd.fields.hasOwnProperty(key)){
									if(sel[key] === true)
										s += "\n AND _t_." + key + " ";

									else if(sel[key] === false)
										s += "\n AND (not _t_." + key + ") ";

									else if(typeof sel[key] == "object"){

                    if(utils.is_data_obj(sel[key])) {
                      s += "\n AND (_t_." + key + " = '" + sel[key] + "') ";
                    }
                    else {
											const keys = Object.keys(sel[key]), val = sel[key][keys[0]];

											if(['not', 'ne', '$ne'].includes(keys[0]))
												s += "\n AND (not _t_." + key + " = '" + val.valueOf() + "') ";

											else
												s += "\n AND (_t_." + key + " = '" + val.valueOf() + "') ";
										}

									}
									else if(typeof sel[key] === string)
										s += "\n AND (_t_." + key + " = '" + sel[key] + "') ";

									else
										s += "\n AND (_t_." + key + " = " + sel[key] + ") ";

								} else if(key=="is_folder" && cmd.hierarchical && cmd.group_hierarchy){
									//if(sel[key])
									//	s += "\n AND _t_." + key + " ";
									//else
									//	s += "\n AND (not _t_." + key + ") ";
								}
							}
						});
				}

				return s;
			}

			function order_flds(){

				return "";
			}

			// строка фильтра
			if(filter && filter.indexOf("%") == -1)
				filter = "%" + filter + "%";

			var sql;
			if(t.sql_selection_list_flds)
				sql = t.sql_selection_list_flds();
			else
				sql = ("SELECT %2 FROM `" + t.table_name + "` AS _t_ %j %3 %4 LIMIT 300")
					.replace("%2", list_flds())
					.replace("%j", join_flds())
				;

			return sql.replace("%3", where_flds()).replace("%4", order_flds());

		}

		function sql_create(){

			var sql = "CREATE TABLE IF NOT EXISTS ",
				first_field = true;

			if(attr && attr.postgres){
				sql += t.table_name+" (";

				if(cmd.splitted){
					sql += "zone integer";
					first_field = false;
				}

				for(f in cmd.dimensions){
					if(first_field){
						sql += f;
						first_field = false;
					}else
						sql += ", " + f;
					sql += sql_type(t, f, cmd.dimensions[f].type, true);
				}

				for(f in cmd.resources)
					sql += ", " + f + sql_type(t, f, cmd.resources[f].type, true);

				for(f in cmd.attributes)
					sql += ", " + f + sql_type(t, f, cmd.attributes[f].type, true);

				sql += ", PRIMARY KEY (";
				first_field = true;
				if(cmd.splitted){
					sql += "zone";
					first_field = false;
				}
				for(f in cmd["dimensions"]){
					if(first_field){
						sql += f;
						first_field = false;
					}else
						sql += ", " + f;
				}

			}else{
				sql += "`"+t.table_name+"` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN";

				//sql += md.sql_mask(f) + md.sql_type(t, f, cmd.dimensions[f].type);

				for(f in cmd.dimensions)
					sql += sql_mask(f) + sql_type(t, f, cmd.dimensions[f].type);

				for(f in cmd.resources)
					sql += sql_mask(f) + sql_type(t, f, cmd.resources[f].type);

				for(f in cmd.attributes)
					sql += sql_mask(f) + sql_type(t, f, cmd.attributes[f].type);

				// sql += ", PRIMARY KEY (";
				// first_field = true;
				// for(f in cmd["dimensions"]){
				// 	if(first_field){
				// 		sql += "`" + f + "`";
				// 		first_field = false;
				// 	}else
				// 		sql += md.sql_mask(f);
				// }
			}

			sql += ")";

			return sql;
		}

		function sql_update(){
			// "INSERT OR REPLACE INTO user_params (prm_name, prm_value) VALUES (?, ?);
			var sql = "INSERT OR REPLACE INTO `"+t.table_name+"` (",
				fields = [],
				first_field = true;

			for(f in cmd.dimensions){
				if(first_field){
					sql += f;
					first_field = false;
				}else
					sql += ", " + f;
				fields.push(f);
			}
			for(f in cmd.resources){
				sql += ", " + f;
				fields.push(f);
			}
			for(f in cmd.attributes){
				sql += ", " + f;
				fields.push(f);
			}

			sql += ") VALUES (?";
			for(f = 1; f<fields.length; f++){
				sql += ", ?";
			}
			sql += ")";

			return {sql: sql, fields: fields};
		}

		function sql_select(){
			var sql = "SELECT * FROM `"+t.table_name+"` WHERE ",
				first_field = true;
			attr._values = [];

			for(var f in cmd["dimensions"]){

				if(first_field)
					first_field = false;
				else
					sql += " and ";

				sql += "`" + f + "`" + "=?";
				attr._values.push(attr[f]);
			}

			if(first_field)
				sql += "1";

			return sql;
		}


		if(action == "create_table")
			res = sql_create();

		else if(action in {insert:"", update:"", replace:""})
			res[t.table_name] = sql_update();

		else if(action == "select")
			res = sql_select();

		else if(action == "select_all")
			res = sql_select();

		else if(action == "delete")
			res = "DELETE FROM `"+t.table_name+"` WHERE ref = ?";

		else if(action == "drop")
			res = "DROP TABLE IF EXISTS `"+t.table_name+"`";

		else if(action == "get_selection")
			res = sql_selection();

		return res;
	}

	get_ref(attr){

		if(attr instanceof RegisterRow)
			attr = attr._obj;

		if(attr.ref)
			return attr.ref;

		var key = "",
			dimensions = this.metadata().dimensions;

		for(var j in dimensions){
			key += (key ? "¶" : "");
			if(dimensions[j].type.is_ref)
				key += utils.fix_guid(attr[j]);

			else if(!attr[j] && dimensions[j].type.digits)
				key += "0";

			else if(dimensions[j].date_part)
				key += moment(attr[j] || utils.blank.date).format(moment.defaultFormatUtc);

			else if(attr[j]!=undefined)
				key += String(attr[j]);

			else
				key += "$";
		}
		return key;
	}

  create(attr) {

    if(!attr || typeof attr != 'object') {
      attr = {};
    }

    let o = this.by_ref[attr.ref];
    if(!o) {

      o = this.obj_constructor('', [attr, this]);

      // Триггер после создания
      let after_create_res = {};
      this.emit('after_create', o, after_create_res);

      if(after_create_res === false) {
        return Promise.resolve(o);
      }
      else if(typeof after_create_res === 'object' && after_create_res.then) {
        return after_create_res;
      }
    }

    return Promise.resolve(o);
  }

  /**
   * Выполняет перебор элементов локальной коллекции
   * @method each
   * @param fn {Function} - функция, вызываемая для каждого элемента локальной коллекции
   */
  each(fn) {
    for (const i in this.by_ref) {
      if(fn.call(this, this.by_ref[i]) === true) {
        break;
      }
    }
  }

}

/**
 * ### Абстрактный менеджер регистра сведений
 * Экземпляры объектов этого класса создаются при выполнении конструктора {{#crossLink "Meta"}}{{/crossLink}}
 * в соответствии с описанием метаданных конфигурации и помещаются в коллекцию {{#crossLink "InfoRegs"}}{{/crossLink}}
 *
 * @class InfoRegManager
 * @extends RegisterManager
 * @constructor
 * @param class_name {string} - имя типа менеджера объекта. например, "ireg.prices"
 */
export class InfoRegManager extends RegisterManager{

	/**
	 * Возаращает массив записей - срез первых значений по ключам отбора
	 * @method slice_first
	 * @for InfoRegManager
	 * @param filter {Object} - отбор + период
	 */
	slice_first(filter){

	}

	/**
	 * Возаращает массив записей - срез последних значений по ключам отбора
	 * @method slice_last
	 * @for InfoRegManager
	 * @param filter {Object} - отбор + период
	 */
	slice_last(filter){

	}
}

/**
 * ### Абстрактный менеджер регистра накопления
 * Экземпляры объектов этого класса создаются при выполнении конструктора {{#crossLink "Meta"}}{{/crossLink}}
 * в соответствии с описанием метаданных конфигурации и помещаются в коллекцию {{#crossLink "AccumRegs"}}{{/crossLink}}
 *
 * @class AccumRegManager
 * @extends RegisterManager
 * @constructor
 * @param class_name {string} - имя типа менеджера объекта. например, "areg.goods_on_stores"
 */
export class AccumRegManager extends RegisterManager{

}

/**
 * ### Абстрактный менеджер справочника
 * Экземпляры объектов этого класса создаются при выполнении конструктора {{#crossLink "Meta"}}{{/crossLink}}
 * в соответствии с описанием метаданных конфигурации и помещаются в коллекцию {{#crossLink "Catalogs"}}{{/crossLink}}
 *
 * @class CatManager
 * @extends RefDataManager
 * @constructor
 * @param class_name {string}
 */
export class CatManager extends RefDataManager{

	constructor(owner, class_name) {

		super(owner, class_name);

		const _meta = this.metadata() || {}

		// реквизиты по метаданным
		if (_meta.hierarchical && _meta.group_hierarchy) {

			/**
			 * ### Признак "это группа"
			 * @property is_folder
			 * @for CatObj
			 * @type {Boolean}
			 */
			Object.defineProperty(this.obj_constructor('', true).prototype, 'is_folder', {
				get(){ return this._obj.is_folder || false},
				set(v){ this._obj.is_folder = utils.fix_boolean(v)},
				enumerable: true,
				configurable: true
			})
		}
	}

	/**
	 * Возвращает объект по наименованию
	 * @method by_name
	 * @param name {String|Object} - искомое наименование
	 * @return {DataObj}
	 */
	by_name(name) {
		let o;
		this.find_rows({name}, obj => {
			o = obj;
			return false;
		});
		return o || this.get();
	}

	/**
	 * Возвращает объект по коду
	 * @method by_id
	 * @param id {String|Object} - искомый код
	 * @return {DataObj}
	 */
	by_id(id) {
    let o = this._by_id[id];
    if(!o) {
      this.find_rows({id}, obj => {
        o = obj;
        this._by_id[id] = o;
        return false;
      });
    }
    return o || this.get();
	};

	/**
	 * Для иерархических справочников возвращает путь элемента
	 * @param ref {String|CatObj} - ссылка или объект данных
	 * @return {string} - строка пути элемента
	 */
	path(ref) {
		var res = [], tobj;

		if (ref instanceof DataObj)
			tobj = ref;
		else
			tobj = this.get(ref, true);

		if (tobj)
			res.push({ref: tobj.ref, presentation: tobj.presentation});

		if (tobj && this.metadata().hierarchical) {
			while (true) {
				tobj = tobj.parent;
				if (tobj.empty())
					break;
				res.push({ref: tobj.ref, presentation: tobj.presentation});
			}
		}

		return res;
	};

}

/**
 * ### Абстрактный менеджер плана видов характеристик
 * Экземпляры объектов этого класса создаются при выполнении конструктора {{#crossLink "Meta"}}{{/crossLink}}
 * в соответствии с описанием метаданных конфигурации и помещаются в коллекцию {{#crossLink "ChartsOfCharacteristics"}}{{/crossLink}}
 *
 * @class ChartOfCharacteristicManager
 * @extends CatManager
 * @constructor
 * @param class_name {string}
 */
export class ChartOfCharacteristicManager extends CatManager{

}

/**
 * ### Абстрактный менеджер плана счетов
 * Экземпляры объектов этого класса создаются при выполнении конструктора {{#crossLink "Meta"}}{{/crossLink}}
 * в соответствии с описанием метаданных конфигурации и помещаются в коллекцию {{#crossLink "ChartsOfAccounts"}}{{/crossLink}}
 *
 * @class ChartOfAccountManager
 * @extends CatManager
 * @constructor
 * @param class_name {string}
 */
export class ChartOfAccountManager extends CatManager{

}

/**
 * ### Абстрактный менеджер документов
 * Экземпляры объектов этого класса создаются при выполнении конструктора {{#crossLink "Meta"}}{{/crossLink}}
 * в соответствии с описанием метаданных конфигурации и помещаются в коллекцию {{#crossLink "Documents"}}{{/crossLink}}
 *
 * @class DocManager
 * @extends RefDataManager
 * @constructor
 * @param class_name {string}
 */
export class DocManager extends RefDataManager{

}

/**
 * ### Абстрактный менеджер задач
 * Экземпляры объектов этого класса создаются при выполнении конструктора {{#crossLink "Meta"}}{{/crossLink}}
 * в соответствии с описанием метаданных конфигурации и помещаются в коллекцию {{#crossLink "Tasks"}}{{/crossLink}}
 *
 * @class TaskManager
 * @extends CatManager
 * @constructor
 * @param class_name {string}
 */
export class TaskManager extends CatManager{

}

/**
 * ### Абстрактный менеджер бизнес-процессов
 * Экземпляры объектов этого класса создаются при выполнении конструктора {{#crossLink "Meta"}}{{/crossLink}}
 * в соответствии с описанием метаданных конфигурации и помещаются в коллекцию {{#crossLink "BusinessProcesses"}}{{/crossLink}}
 *
 * @class BusinessProcessManager
 * @extends CatManager
 * @constructor
 * @param class_name {string}
 */
export class BusinessProcessManager extends CatManager{

}

