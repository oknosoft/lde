/**
 * Конструкторы табличных частей
 *
 */

import {own, alias} from './meta/symbols';


/**
 * Абстрактный объект табличной части
 * Предоставляет методы для доступа и манипуляции данными табчасти
 *
 * @param name {String} - имя табчасти
 * @param owner {DataObj} - владелец табличной части
 */
export class TabularSection extends Array {

  /**
   * Объект-владелец табличной части
   * @type DataObj
   */
  #own;

  /**
   * Метаданные табличной части
   * @type MetaTabular
   */
  #meta;

	constructor(owner, name, raw) {
    super();
    this.#own = owner;
    this.#meta = owner._manager.metadata(name);
    if(Array.isArray(raw)) {
      this.load(raw);
    }
	}

  toString() {
	  const {_manager: root} = this;
    return `${root.msg.tabular} ${this.#meta.className}`;
  }

  get [own]() {
    return this.#own;
  }

  /**
   * Указатель на менеджера данного объекта
   * @property _manager
   * @type DataManager
   * @final
   */
  get _manager() {
    return this[own]._manager;
  }

  get _data() {
    return this[own]._data;
  }

  /**
   * Метаданные табчасти
   * @param {String} name - имя поля, данные которого интересуют
   * @return {MetaTabular|MetaField}
   */
  _metadata(name) {
    return this.#meta.get(name);
  }

  count() {
    return this.length;
  }

	/**
	 * @summary Очищает табличную часть
	 * @return {TabularSection}
	 *
	 * @example
	 * // Очищает табличнут часть
	 * ts.clear();
	 *
	 */
  clear(selection) {
    if(selection) {
      for(const row of this.find_rows(selection)) {
        this.splice(this.indexOf(row), 1);
      }
    }
    else {
      this.length = 0;
    }
    const {_data, _manager} = this;
    !_data.loading && _manager.emit_async('rows', this[own], {[this.#meta[alias]]: true});
    return this;
  }

	/**
	 * Удаляет строку табличной части
	 * @param val {Number|TabularSectionRow} - индекс или строка табчасти
	 */
	del(val) {

    const {_manager, _data} = this;
    const owner = this[own];

    let index;
    if(typeof val === "number") {
      index = val;
      val = this[index];
    }
    else {
      index = this.indexOf(val);
    }

		// триггер
    if(!_data.loading && owner.beforeDelRow(val) === false){
      return;
    }

		const drows = this.splice(index, 1);

    // триггер
    !_data.loading && drows.length && owner.afterDelRow(drows[0]);

    // obj, {ts_name: null}
    !_data.loading && _manager.emit_async('rows', owner, {[_name]: true});
		_data.modified = true;
	}

	/**
	 * Находит первую строку, содержащую значение
	 * @param val {*} - значение для поиска
	 * @param [columns] {String|Array} - колонки, в которых искать
	 * @return {TabularSectionRow}
	 */
	find(val, columns) {
    if(typeof val === 'function') {
      return this.filter(val);
    }
		const res = this[own]._manager.utils.find(this, val, columns);
		return res && res._row;
	}

  filter(filterFunc) {
    const res = [];
    for(const row of this) {
      if(filterFunc(row)) {
        res.push(row);
      }
    }
    return res;
  }

	/**
	 * Находит строки, соответствующие отбору
	 * Если отбор пустой, возвращаются все строки табчасти
	 *
	 * @method find_rows
	 * @param [selection] {Object} - в ключах имена полей, в значениях значения фильтра или объект {like: "значение"}
	 * @param [callback] {Function} - в который передается строка табчасти на каждой итерации
	 * @return {Array}
	 */
	findRows(selection, callback) {

		// поддержка индекса
		const {index, root} = this.#meta;
		if(index && selection.hasOwnProperty(index)) {
		  // if(!_index) {
      //   _index = this._index = new Map();
      // }
      // _obj = _index.get(selection[index]);
		  // if(!_obj) {
		  //   _obj = this._obj.filter((row) => row[index] == selection[index]);
      //   _index.set(selection[index], _obj);
      // }
		  // selection = Object.assign({}, selection);
		  // delete selection[index];
    }

		return root.utils.find.rows(this, selection, callback);
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
    !_data.loading && _manager.emit_async('rows', _owner, {[_name]: true});
    _data.modified = true;
	}

	/**
	 * Добавляет строку табчасти
	 * @method add
	 * @param {object} attr - объект со значениями полей. если некого поля нет в attr, для него используется пустое значение типа
	 * @param {Boolean} [silent] - тихий режим, без генерации событий изменения объекта
   * @param {Function} [Constructor] - альтернативный конструктор строки
	 * @return {TabularSectionRow}
	 *
	 * @example
	 *     // Добавляет строку в табчасть и заполняет её значениями, переданными в аргументе
	 *     const row = ts.add({field1: value1});
	 */
	add(attr = {}, silent, Constructor) {

    const {_manager, _data} = this;
    const owner = this[own];
    //attr, owner, loading, direct
    if(!Constructor) {
      Constructor = _manager.objConstructor(this.#meta[alias], true);
    }
		const row = new Constructor(attr, this, _data.loading || silent, true);

    // триггер
		if(!_data.loading && owner.beforeAddRow(row, attr) === false){
		  return;
    }

    this.push(row);
    _data.modified = true;
    !_data.loading && !silent && _manager.emit_async('rows', owner, {[this.#meta[alias]]: true});

    // триггер
    !_data.loading && owner.afterAddRow(row, attr);

		return row;
	}


	/**
	 * Сворачивает табличную часть
	 * детали см. в {{#crossLink "TabularSection/aggregate:method"}}{{/crossLink}}
	 * @method groupBy
	 * @param [dimensions] {Array|String}
	 * @param [resources] {Array|String}
	 */
	groupBy(dimensions, resources) {

		try {
      const res = this.aggregate(dimensions, resources, 'SUM', true);
			return this.load(res);
		}
		catch (err) {
			this._owner._manager._owner.$p.record_log(err);
		}
	}

  /**
   * Вычисляет агрегатную функцию по табличной части
   * - Не изменяет исходный объект. Если пропущен аргумент `aggr` - вычисляет сумму.
   * - Стандартные агрегаторы: SUM, COUNT, MIN, MAX, FIRST, LAST, AVG, AGGR, ARRAY, REDUCE
   * - AGGR - позволяет задать собственный агрегатор (функцию) для расчета итогов
   *
   * @method aggregate
   * @param {Array|String} [dimensions] - список измерений
   * @param {Array|String} [resources] - список ресурсов
   * @param {String|Function} [aggr] - агрегатная функция
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
    dimensions.forEach(function (f) {
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
      if (!ret_array) {
        if (resources.length == 1)
          res = res.length ? res[0][resources[0]] : 0;
        else
          res = res.length ? res[0] : {};
      }
      return res;

    } catch (err) {
      $p.record_log(err);
    }
  };

  /**
	 * Сортирует табличную часть
	 *
	 * @method sort
	 * @param fields {Array|String}
	 */
	sort(fields) {
    if(typeof fields == 'string') {
      fields = fields.split(',');
    }
	}

	/**
	 * Загружает табличную часть из массива объектов
	 *
	 * @param {Array.<Object>} raw - массив объектов к загрузке
	 */
	load(raw) {

    const {_manager, _data} = this;
    const {loading} = _data;

    if (!loading) {
      _data.loading = true;
    }

    this.clear();

    for (const row of raw) {
      this.add(row);
    }

    // obj, {ts_name: null}
    _data.loading = loading;

		return this;
	}

	/**
	 * Выгружает колонку табчасти в массив
	 *
	 * @param column {String} - имя колонки
	 * @return {Array}
	 */
	unloadColumn(column) {

		const res = [];

		this.each((row) => {
			res.push(row[column])
		})

		return res;
	}

	/**
	 * Обработчик сериализации
	 * @return {Object}
	 */
	toJSON() {
	  const {_owner, _obj, _name} = this;
	  const {fields} = _owner._metadata(_name);
	  const _manager = {
      _owner: _owner._manager._owner,
      metadata(fld) {
        return fields[fld];
      }
    };
	  const {toJSON} = _owner.constructor.prototype;
		return _obj.map(_obj => toJSON.call({_obj, _manager}));
	}

}

