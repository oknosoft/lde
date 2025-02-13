/**
 * Конструкторы табличных частей
 *
 * @module  metadata
 * @submodule meta_tabulars
 */

import utils from './utils';

class Iterator {

  constructor(_obj) {
    this._obj = _obj;
    this._idx = 0;
  }

  next() {
    if(this._idx >= this._obj.length) {
      return {done: true}; // проверка на последний элемент
    }
    const _row = this._obj[this._idx];
    this._idx++;
    if(_row) {
      return {value: _row._row, done: false};
    }
    return this.next();
  }
}

/**
 * @summary Абстрактный объект табличной части
 * @desc Класс предоставляет методы для доступа и манипуляции данными табчасти
 * Физически, данные хранятся в {{#crossLink "DataObj"}}{{/crossLink}}, а точнее - в поле типа массив и именем табчасти объекта `_obj` 
 *
 * @param name {String} - имя табчасти
 * @param owner {DataObj} - владелец табличной части
 */
export class TabularSection {

	constructor(name, owner) {

		// Если табчасти нет в данных владельца - создаём
		if (!owner._obj[name]){
			owner._obj[name] = []
		}

    /**
     * Имя табличной части
     * @property _name
     * @type String
     */
		this._name = name;

    /**
     * Объект-владелец табличной части
     * @property _owner
     * @type DataObj
     */
    this._owner = owner;

	}

  toString() {
	  const {_owner: {_manager}, _name} = this;
    const {msg} = _manager._owner.$p;
    return msg.tabular + ' ' + _manager.class_name + '.' + _name;
  }

	/**
	 * ### Фактическое хранилище данных объекта
	 * Оно же, запись в таблице объекта локальной базы данных
	 * @property _obj
	 * @type Object
	 */
  get _obj() {
    const {_owner: {_obj}, _name} = this;
    return _obj ? _obj[_name] : [];
  }

	/**
	 * ### Возвращает строку табчасти по индексу
	 * @method get
	 * @param index {Number} - индекс строки табчасти
	 * @return {TabularSectionRow}
	 */
  get(index) {
    const row = this._obj[index];
    return row ? row._row : null;
  }

	/**
	 * ### Возвращает количество элементов в табчасти
	 * @method count
	 * @return {Number}
	 *
	 * @example
	 *     // количество элементов в табчасти
	 *     var count = ts.count();
	 */
  count() {
    return this._obj.length;
  }

	/**
	 * ### Очищает табличную часть
	 * @method clear
	 * @return {TabularSection}
	 *
	 * @example
	 *     // Очищает табличнут часть
	 *     ts.clear();
	 *
	 */
  clear(selection) {
    if(selection) {
      this.find_rows(selection).forEach((row) => this.del(row.row - 1));
    }
    else {
      const {_obj, _owner, _name} = this;
      _obj.length = 0;
      !_owner._data._loading && _owner._manager.emit_async('rows', _owner, {[_name]: true});
    }
    return this;
  }

	/**
	 * @summary Удаляет строку табличной части
	 * @param val {Number|TabularSectionRow} - индекс или строка табчасти
	 */
	del(val) {

		const {_obj, _owner, _name} = this;
    const {_data, _manager} = _owner;

		let index;

    if(typeof val == 'undefined') {
      return;
    }
    else if(typeof val == 'number') {
      index = val;
    }
		else if (val.row && _obj[val.row - 1] && _obj[val.row - 1]._row === val){
      index = val.row - 1;
    }
		else {
		  for(let i = 0; i < _obj.length; i++){
        if (_obj[i]._row === val) {
          index = i;
          break;
        }
      }
		}
		if (index == undefined || !_obj[index]){
      return;
    }

		// триггер
    const row = _obj[index];
    if(!_data._loading && _owner.del_row(row._row) === false){
      return;
    }

    index = _obj.indexOf(row);
    if(index >= 0) {
      _obj.splice(index, 1);
    }

		_obj.forEach((row, index) => row.row = index + 1);

    // триггер
    !_data._loading && index >= 0 && _owner.after_del_row(_name, [row]);

    // obj, {ts_name: null}
    !_data._loading && _manager.emit_async('rows', _owner, {[_name]: true});
		_data._modified = true;
	}

	/**
	 * ### Находит первую строку, содержащую значение
	 * @method find
	 * @param val {*} - значение для поиска
	 * @param columns {String|Array} - колонки, в которых искать
	 * @return {TabularSectionRow}
	 */
	find(val, columns) {
		const res = utils._find(this._obj, val, columns);
		return res && res._row;
	}

	/**
	 * ### Находит строки, соответствующие отбору
	 * Если отбор пустой, возвращаются все строки табчасти
	 *
	 * @method find_rows
	 * @param [selection] {Object} - в ключах имена полей, в значениях значения фильтра или объект {like: "значение"}
	 * @param [callback] {Function} - в который передается строка табчасти на каждой итерации
	 * @return {Array}
	 */
	find_rows(selection, callback) {
		const cb = callback ? (row) => callback.call(this, row._row) : null;

		// поддержка индекса
		let {_obj, _owner, _name, _index} = this;
		const {index} = _owner._metadata(_name);
		if(index && selection.hasOwnProperty(index)) {
		  if(!_index) {
        _index = this._index = new Map();
      }
      _obj = _index.get(selection[index]);
		  if(!_obj) {
		    _obj = this._obj.filter((row) => row[index] == selection[index]);
        _index.set(selection[index], _obj);
      }
		  selection = Object.assign({}, selection);
		  delete selection[index];
    }

		return utils._find_rows.call(this, _obj, selection, cb);
	}

	/**
	 * ### Меняет местами строки табчасти
	 * @method swap
	 * @param rowid1 {number|TabularSectionRow}
	 * @param rowid2 {number|TabularSectionRow}
	 */
	swap(rowid1, rowid2) {
    const {_obj, _owner, _name} = this;
    if(typeof rowid1 !== 'number') {
      rowid1 = rowid1.row - 1;
    }
    if(typeof rowid2 !== 'number') {
      rowid2 = rowid2.row - 1;
    }
		[_obj[rowid1], _obj[rowid2]] = [_obj[rowid2], _obj[rowid1]];
		_obj[rowid1].row = rowid1 + 1;
		_obj[rowid2].row = rowid2 + 1;

    // obj, {ts_name: null}
    const {_data, _manager} = _owner;
    !_data._loading && _manager.emit_async('rows', _owner, {[_name]: true});
    _data._modified = true;
	}

	/**
	 * ### Добавляет строку табчасти
	 * @method add
	 * @param {Object} attr - объект со значениями полей. если некого поля нет в attr, для него используется пустое значение типа
	 * @param {Boolean} [silent] - тихий режим, без генерации событий изменения объекта
   * @param {Function} [Constructor] - альтернативный конструктор строки
   * @param {Boolean} [raw] - использовать сырые данные из attr
	 * @return {TabularSectionRow}
	 *
	 * @example
	 *     // Добавляет строку в табчасть и заполняет её значениями, переданными в аргументе
	 *     const row = ts.add({field1: value1});
	 */
	add(attr = {}, silent, Constructor, raw) {

    if(raw && attr.hasOwnProperty('_row')) {
      raw = false;
    }
		const {_owner, _name, _obj} = this;
    const {_manager, _data} = _owner;
		const row = Constructor ? new Constructor(this) : _manager.obj_constructor(_name, raw ? [this, attr] : this);

    // триггер
		if(!_data._loading && _owner.add_row && _owner.add_row(row, attr) === false){
		  return;
    }

		// присваиваем типизированные значения по умолчанию
    const data = row._obj; 
    if(!silent) {
      for (const f in row._metadata().fields){
        if(!data.hasOwnProperty(f)) {
          row[f] = attr[f] || '';
        }
      }
    }

    data.row = _obj.push(data);
    Object.defineProperty(data, '_row', {
      value: row,
      enumerable: false
    });

    // obj, {ts_name: null}
    !_data._loading && !silent && _manager.emit_async('rows', _owner, {[_name]: true});
		_data._modified = true;

		return row;
	}

	/**
	 * ### Выполняет цикл "для каждого"
	 * @method each
	 * @param fn {Function} - callback, в который передается строка табчасти
	 */
	each(fn) {
	  for(const row of this._obj){
	    if(fn.call(this, row._row) === false) break;
    }
	}

	/**
	 * ### Псевдоним для each
	 * @method forEach
	 * @type {TabularSection.each|*}
	 */
	get forEach() {
		return this.each
	}

  /**
   * ala map массива
   * @param fn {Function}
   */
	map(fn) {
    return this._obj.map((row, index) => fn(row._row, index));
  }

	/**
	 * ### Сворачивает табличную часть
	 * детали см. в {{#crossLink "TabularSection/aggregate:method"}}{{/crossLink}}
	 * @method group_by
	 * @param [dimensions] {Array|String}
	 * @param [resources] {Array|String}
	 */
	group_by(dimensions, resources) {

		try {
      const res = this.aggregate(dimensions, resources, 'SUM', true);
			return this.load(res);
		}
		catch (err) {
			this._owner._manager._owner.$p.record_log(err);
		}
	}

	/**
	 * ### Сортирует табличную часть
	 *
	 * @method sort
	 * @param fields {Array|String}
	 */
	sort(fields) {

    if(typeof fields == 'string') {
      fields = fields.split(',');
    }

    let sql = 'select * from ? order by ';
		let	res = true;
		let	has_dot;

		for(let f of fields){
      has_dot = has_dot || f.indexOf('.') !== -1;
      f = f.trim().replace(/\s{1,}/g, ' ').split(' ');
      if (res){
        res = false;
      }
      else{
        sql += ', ';
      }

      sql += '`' + f[0] + '`';
      if(f[1]) {
        sql += ' ' + f[1];
      }
    }

    const {$p} = this._owner._manager._owner;
		try {
			res = $p.wsql.alasql(sql, [has_dot ? this._obj.map((row) => row._row) : this._obj]);
			return this.load(res);
		}
		catch (err) {
			$p.record_log(err);
		}
	}

	/**
	 * ### Вычисляет агрегатную функцию по табличной части
	 * - Не изменяет исходный объект. Если пропущен аргумент `aggr` - вычисляет сумму.
	 * - Стандартные агрегаторы: SUM, COUNT, MIN, MAX, FIRST, LAST, AVG, AGGR, ARRAY, REDUCE
	 * - AGGR - позволяет задать собственный агрегатор (функцию) для расчета итогов
	 *
	 * @method aggregate
	 * @param [dimensions] {Array|String} - список измерений
	 * @param [resources] {Array|String} - список ресурсов
	 * @param [aggr] {String} - агрегатная функция
	 * @param [ret_array] {Boolran} - указывает возвращать массив значений
	 * @return {Number|Array} - Значение агрегатной фукнции или массив значений
	 *
	 * @example
	 *     // вычисляем сумму (итог) по полю amount табличной части
	 *     var total = ts.aggregate("", "amount");
	 *
	 *     // вычисляем максимальные суммы для всех номенклатур табличной части
	 *     // вернёт массив объектов {nom, amount}
	 *     var total = ts.aggregate("nom", "amount", "MAX", true);
	 */
	aggregate(dimensions, resources, aggr = "sum", ret_array) {

		if (typeof dimensions == "string") {
      dimensions = dimensions.length ? dimensions.split(",") : []
    }
    if (typeof resources == "string") {
      resources = resources.length ? resources.split(",") : [];
    }

		// для простых агрегатных функций, sql не используем
		if (!dimensions.length && resources.length == 1 && aggr == "sum") {
			return this._obj.reduce(function (sum, row, index, array) {
				return sum + row[resources[0]];
			}, 0);
		}
    if(!this.count()) {
      const res = {};
      resources.forEach((f) => {
        res[f] = 0;
      });
      return res;
    }

		let sql, res = true;

		resources.forEach((f) => {
			if (!sql){
        sql = "select ";
      }
      else{
        sql += ", ";
      }
      sql += aggr + "(`" + f + "`) `" + f + "`";
		});
		dimensions.forEach((f) => {
			if (!sql)
				sql = "select `" + f + "`";
			else
				sql += ", `" + f + "`";
		});
		sql += " from ? ";
		dimensions.forEach(function (f) {
			if (res) {
				sql += "group by ";
				res = false;
			}
			else
				sql += ", ";
			sql += "`" + f + "`";
		});

		const {$p} = this._owner._manager._owner;
		try {
			res = $p.wsql.alasql(sql, [this._obj]);
      // alasql bug https://github.com/AlaSQL/alasql/pull/1537#issuecomment-1338647771
      for(const row of res) {
        resources.forEach((f) => {
          if(!row[f] || row[f] === 'NULL') {
            row[f] = 0;
          }
        });
      }
			if (!ret_array) {
        if (resources.length == 1) {
          res = res.length ? res[0][resources[0]] : 0;
        }
        else {
          res = res.length ? res[0] : {};
        }         
			}
			return res;
		} 
    catch (err) {
			$p.record_log(err);
		}
	};

	/**
	 * @summary Загружает табличнут часть из массива объектов
	 *
	 * @method load
	 * @param {Array.<Object>} aattr - массив объектов к загрузке
	 * @param {Boolean} [raw] - признак не пересоздавать сырые данные строк, а использовать из aattr
	 */
	load(aattr, raw) {

    const {_owner, _name, _obj} = this;
    const {_manager, _data} = _owner;
    const {_loading} = _data;

    if(!_loading){
      _data._loading = true;
    }

    this.clear();

		for(let row of aattr instanceof TabularSection ? aattr._obj : (Array.isArray(aattr) ? aattr : [])){
      this.add(row, raw, null, raw);
    }

    // obj, {ts_name: null}
    _data._loading = _loading;
    !_loading && _manager.emit_async('rows', _owner, {[_name]: true});

		return this;
	}

	/**
	 * @summary Выгружает колонку табчасти в массив
	 *
	 * @method unload_column
	 * @param column {String} - имя колонки
	 * @return {Array}
	 */
	unload_column(column) {

		const res = [];

		this.each((row) => {
			res.push(row[column])
		})

		return res;
	}

	/**
	 * @summary Обработчик сериализации
	 * @return {Object}
	 */
	toJSON() {
	  const {_owner, _obj, _name} = this;
	  const {fields, uid} = _owner._metadata(_name);
	  const _manager = {
      _owner: _owner._manager._owner,
      metadata(fld) {
        if(fld === 'uid' && fld) {
          return {type: {types: ['string'], str_len: 36}};
        }
        return fields[fld];
      }
    };
	  const {toJSON} = _owner.constructor.prototype;
		return _obj.map(_obj => toJSON.call({_obj, _manager}));
	}

  /**
   * Итератор
   * @return {Iterator}
   */
  [Symbol.iterator]() {
    return new Iterator(this._obj);
  }
}


/**
 * @summary Aбстрактная строка табличной части
 *
 * @param owner {TabularSection} - табличная часть, которой принадлежит строка
 */
export class TabularSectionRow {

	constructor(owner, attr) {

		Object.defineProperties(this, {

			/**
			 * Указатель на владельца данной строки табличной части
			 * @type TabularSection
			 */
			_owner: {
				value: owner
			},

			/**
			 * @summary Фактическое хранилище данных объекта
			 * @desc Отображается в поле типа json записи в таблице объекта локальной базы данных
			 * @type Object
			 */
			_obj: {
				value: attr ? attr : {}
			}
		});
    if(this._metadata().uid && !utils.is_guid(this._obj.uid)) {
      this._obj.uid = utils.generate_guid();
    }
	}
  
  /**
   * @summary Метаданые строки табличной части 
   * @param {String} [name]
   * @return {*}
   */
  _metadata(name) {
    const {_owner} = this;
    return name ? _owner._owner._metadata(_owner._name).fields[name] : _owner._owner._metadata(_owner._name);
  }

	get _manager() {
		return this._owner._owner._manager;
	}

	get _data() {
    return this._owner._owner._data;
  }

	/**
	 * @summary Номер строки табличной части
	 * @type Number
	 * @final
	 */
	get row() {
		return this._obj.row || 0;
	}

  /**
   * @summary Идентификатор строки табличной части
   * @type String
   * @final
   */
  get uid() {
    return this._obj.uid || utils.blank.guid;
  }

	/**
	 * @summary Копирует строку табличной части
	 * @return {TabularSectionRow}
	 */
	_clone() {
		const {_owner, _obj} = this
		return utils._mixin(_owner._owner._manager.obj_constructor(_owner._name, _owner), _obj);
	}

	_setter(f, v) {

		const {_owner, _obj} = this;
		const _meta = this._metadata(f);

		if (_obj[f] == v || (!v && _obj[f] == utils.blank.guid)){
      return;
    }

    // obj, {f: oldValue}
    const {_manager, _data} = _owner._owner;

		// признак того, что тип уже приведён
		let fetched_type;

		// учтём связь по типу
		if (_meta.choice_type) {
			const prop = _meta.choice_type.path.length == 2 ? this[_meta.choice_type.path[1]] : _owner._owner[_meta.choice_type.path[0]];
			if (prop && prop.type){
        fetched_type = prop.type;
        v = utils.fetch_type(v, fetched_type);
      }
		}

		// установим модифицированность и оповестим мир
		if(!_data._loading){
      _manager.emit_async('update', this, {[f]: _obj[f]});
      _data._modified = true;
    }

		this.__setter(f, v, fetched_type);

	}

  /**
   * @summary При изменении реквизита шапки или табличной части
   *
   * @event VALUE_CHANGE
   */
  value_change(f, mf, v) {
    return this;
  }

};


