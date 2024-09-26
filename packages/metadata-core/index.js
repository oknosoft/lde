/*!
 metadata-core v2.0.35-beta.2, built:2024-09-26
 © 2014-2024 Evgeniy Malyarov and the Oknosoft team http://www.oknosoft.ru
 metadata.js may be freely distributed under the MIT
 To obtain commercial license and technical support, contact info@oknosoft.ru
 */


'use strict';

var EventEmitter = require('events');

class I18Handler {
	get(target, name, receiver) {
		switch (name){
			case 'lang':
				return target._lang;
			case 'show_msg':
				return target._show_msg || function () {
				};
			default:
				return target.i18n[target._lang][name];
		}
	}
	set (target, name, val, receiver) {
		switch (name){
			case 'lang':
				target._lang = val;
				break;
			case 'show_msg':
        target._show_msg = val;
        break;
			default:
				target.i18n[target._lang][name] = val;
		}
		return true;
	}
}
class I18n {
	constructor(syn) {
		this._lang = Object.keys(syn)[0];
		if(typeof Proxy == 'function'){
      this.i18n = syn;
      return new Proxy(this, new I18Handler());
    }    return syn[this._lang];
	}
}
const msg = new I18n({
	ru: {
		store_url_od: 'https://chrome.google.com/webstore/detail/hcncallbdlondnoadgjomnhifopfaage',
		argument_is_not_ref: 'Аргумент не является ссылкой',
		addr_title: 'Ввод адреса',
		cache_update_title: 'Обновление кеша браузера',
		cache_update: 'Выполняется загрузка измененных файлов<br/>и их кеширование в хранилище браузера',
		cancel: 'Отмена',
		delivery_area_empty: 'Укажите район доставки',
    data_error: 'Ошибка в данных',
		empty_response: 'Пустой ответ сервера',
		empty_geocoding: 'Пустой ответ геокодера. Вероятно, отслеживание адреса запрещено в настройках браузера',
		error_geocoding: 'Ошибка геокодера',
		error_critical: 'Критическая ошибка',
		error_metadata: 'Ошибка загрузки метаданных конфигурации',
		error_network: 'Ошибка сети или сервера',
		get error_proxy() {return `proxy: ${this.error_network}. ${this.requery}`},
		error_rights: 'Ограничение доступа',
		error_low_acl: 'Недостаточно прав для выполнения операции',
    file_download: 'Загрузка файлов',
    file_select: 'Укажите строку для действий с файлом',
		file_size: 'Запрещена загрузка файлов размером более ',
		file_confirm_delete: 'Подтвердите удаление файла ',
		file_new_date: 'Файлы на сервере обновлены<br /> Рекомендуется закрыть браузер и войти<br />повторно для применения обновления',
		file_new_date_title: 'Версия файлов',
		init_catalogues: 'Загрузка справочников с сервера',
		init_catalogues_meta: ': Метаданные объектов',
		init_catalogues_tables: ': Реструктуризация таблиц',
		init_catalogues_nom: ': Базовые типы + номенклатура',
		init_catalogues_sys: ': Технологические справочники',
		init_login: 'Укажите имя пользователя и пароль',
		requery: 'Повторите попытку через 1-2 минуты',
		get limit_query() {
			return 'Превышено число обращений к серверу<br/>Запросов за минуту:%1<br/>Лимит запросов:%2<br/>' + this.requery;
		},
    login: {
		  title: 'Вход на сервер',
      wait: 'ожидание ответа',
      empty: 'Не указаны имя пользователя или пароль',
      network: 'Сервер недоступен, ошибка сети или сервера',
      need_logout: 'Для авторизации под новым именем, завершите сеанс текущего пользователя',
      error: 'Ошибка авторизации. Проверьте имя пользователя, пароль и параметры подключения',
      suffix: 'Суффикс пользователя не совпадает с суффиксом подключения',
    },
		long_operation: 'Длительная операция',
		logged_in: 'Авторизован под именем: ',
		log_out_title: 'Отключиться от сервера?',
		log_out_break: '<br/>Завершить синхронизацию?',
		sync_title: 'Обмен с сервером',
		sync_complite: 'Синхронизация завершена',
		main_title: 'Окнософт: заказ дилера ',
		mark_delete_confirm: 'Пометить объект %1 на удаление?',
		mark_undelete_confirm: 'Снять пометку удаления с объекта %1?',
		meta: {
			enm: 'Перечисление',
			cat: 'Справочник',
			doc: 'Документ',
			cch: 'План видов характеристик',
			cacc: 'План счетов',
			tsk: 'Задача',
			ireg: 'Регистр сведений',
			areg: 'Регистр накопления',
			accreg: 'Регистр бухгалтерии',
			bp: 'Бизнес процесс',
			ts_row: 'Строка табличной части',
			dp: 'Обработка',
			rep: 'Отчет',
		},
    meta_parents: {
      enm: 'перечисления',
      cat: 'справочника',
      doc: 'документа',
      cch: 'плана видов характеристик',
      cacc: 'плана счетов',
      tsk: 'задачи',
      ireg: 'регистра сведений',
      areg: 'регистра накопления',
      accreg: 'регистра бухгалтерии',
      bp: 'бизнес процесса',
      ts_row: 'строки табличной части',
      dp: 'обработки',
      rep: 'отчета',
    },
		meta_classes: {
			enm: 'Перечисления',
			cat: 'Справочники',
			doc: 'Документы',
			cch: 'Планы видов характеристик',
			cacc: 'Планы счетов',
			tsk: 'Задачи',
			ireg: 'Регистры сведений',
			areg: 'Регистры накопления',
			accreg: 'Регистры бухгалтерии',
			bp: 'Бизнес процессы',
			dp: 'Обработки',
			rep: 'Отчеты',
		},
		meta_mgrs: {
			mgr: 'Менеджер',
			get enm() {
				return this.mgr + ' перечисления';
			},
			get cat() {
				return this.mgr + ' справочника';
			},
			get doc() {
				return this.mgr + ' документов';
			},
			get cch() {
				return this.mgr + ' плана видов характеристик';
			},
			get cacc() {
				return this.mgr + ' плана счетов';
			},
			get tsk() {
				return this.mgr + ' задач';
			},
			get ireg() {
				return this.mgr + ' регистра сведений';
			},
			get areg() {
				return this.mgr + ' регистра накопления';
			},
			get accreg() {
				return this.mgr + ' регистра бухгалтерии';
			},
			get bp() {
				return this.mgr + ' бизнес-процесса';
			},
			get dp() {
				return this.mgr + ' обработки';
			},
			get rep() {
				return this.mgr + ' отчета';
			},
		},
		meta_cat_mgr: 'Менеджер справочников',
		meta_doc_mgr: 'Менеджер документов',
		meta_enn_mgr: 'Менеджер перечислений',
		meta_ireg_mgr: 'Менеджер регистров сведений',
		meta_areg_mgr: 'Менеджер регистров накопления',
		meta_accreg_mgr: 'Менеджер регистров бухгалтерии',
		meta_dp_mgr: 'Менеджер обработок',
		meta_task_mgr: 'Менеджер задач',
		meta_bp_mgr: 'Менеджер бизнес-процессов',
		meta_reports_mgr: 'Менеджер отчетов',
		meta_cacc_mgr: 'Менеджер планов счетов',
		meta_cch_mgr: 'Менеджер планов видов характеристик',
		meta_extender: 'Модификаторы объектов и менеджеров',
		modified_close: 'Объект изменен<br/>Закрыть без сохранения?',
		mandatory_title: 'Обязательный реквизит',
		mandatory_field: 'Укажите значение реквизита "%1"',
		no_metadata: 'Не найдены метаданные объекта "%1"',
		no_selected_row: 'Не выбрана строка табличной части "%1"',
		no_dhtmlx: 'Библиотека dhtmlx не загружена',
		not_implemented: 'Не реализовано в текущей версии',
    obj_parent: 'объекта',
		offline_request: 'Запрос к серверу в автономном режиме',
		onbeforeunload: 'Окнософт. Закрыть программу?',
    open_frm: 'Открыть форму',
		order_sent_title: 'Подтвердите отправку заказа',
		order_sent_message: 'Отправленный заказ нельзя изменить.<br/>После проверки менеджером<br/>он будет запущен в работу',
		report_error: '<i class="fa fa-exclamation-circle fa-2x fa-fw"></i> Ошибка',
		report_prepare: '<i class="fa fa-spinner fa-spin fa-2x fa-fw"></i> Подготовка отчета',
		report_need_prepare: '<i class="fa fa-info fa-2x fa-fw"></i> Нажмите "Сформировать" для получения отчета',
		report_need_online: '<i class="fa fa-plug fa-2x fa-fw"></i> Нет подключения. Отчет недоступен в автономном режиме',
		request_title: 'Запрос регистрации',
		request_message: 'Заявка зарегистрирована. После обработки менеджером будет сформировано ответное письмо',
    selection_parent: 'выбора',
		select_from_list: 'Выбор из списка',
		select_grp: 'Укажите группу, а не элемент',
		select_elm: 'Укажите элемент, а не группу',
		select_file_import: 'Укажите файл для импорта',
		srv_overload: 'Сервер перегружен',
		sub_row_change_disabled: 'Текущая строка подчинена продукции.<br/>Строку нельзя изменить-удалить в документе<br/>только через построитель',
		sync_script: 'Обновление скриптов приложения:',
		sync_data: 'Синхронизация с сервером выполняется:<br />* при первом старте программы<br /> * при обновлении метаданных<br /> * при изменении цен или технологических справочников',
		sync_break: 'Прервать синхронизацию',
		sync_no_data: 'Файл не содержит подходящих элементов для загрузки',
    tabular: 'Табличная часть',
		unsupported_browser_title: 'Браузер не поддерживается',
		unsupported_browser: 'Несовместимая версия браузера<br/>Рекомендуется Google Chrome',
		supported_browsers: 'Рекомендуется Chrome, Safari или Opera',
		unsupported_mode_title: 'Режим не поддерживается',
		get unsupported_mode() {
			return 'Программа не установлена<br/> в <a href="' + this.store_url_od + '">приложениях Google Chrome</a>';
		},
		unknown_error: 'Неизвестная ошибка в функции "%1"',
		value: 'Значение',
	},
});

let Iterator$1 = class Iterator {
  constructor(_obj) {
    this._obj = _obj;
    this._idx = 0;
  }
  next() {
    if(this._idx >= this._obj.length) {
      return {done: true};
    }
    const _row = this._obj[this._idx];
    this._idx++;
    if(_row) {
      return {value: _row._row, done: false};
    }
    return this.next();
  }
};
class TabularSection {
	constructor(name, owner) {
		if (!owner._obj[name]){
			owner._obj[name] = [];
		}
		this._name = name;
    this._owner = owner;
	}
  toString() {
	  const {_owner: {_manager}, _name} = this;
    const {msg} = _manager._owner.$p;
    return msg.tabular + ' ' + _manager.class_name + '.' + _name;
  }
  get _obj() {
    const {_owner: {_obj}, _name} = this;
    return _obj ? _obj[_name] : [];
  }
  get(index) {
    const row = this._obj[index];
    return row ? row._row : null;
  }
  count() {
    return this._obj.length;
  }
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
    const row = _obj[index];
    if(!_data._loading && _owner.del_row(row._row) === false){
      return;
    }
    index = _obj.indexOf(row);
    if(index >= 0) {
      _obj.splice(index, 1);
    }
		_obj.forEach((row, index) => row.row = index + 1);
    !_data._loading && index >= 0 && _owner.after_del_row(_name, [row]);
    !_data._loading && _manager.emit_async('rows', _owner, {[_name]: true});
		_data._modified = true;
	}
	find(val, columns) {
		const res = utils$1._find(this._obj, val, columns);
		return res && res._row;
	}
	find_rows(selection, callback) {
		const cb = callback ? (row) => callback.call(this, row._row) : null;
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
		return utils$1._find_rows.call(this, _obj, selection, cb);
	}
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
    const {_data, _manager} = _owner;
    !_data._loading && _manager.emit_async('rows', _owner, {[_name]: true});
    _data._modified = true;
	}
	add(attr = {}, silent, Constructor, raw) {
    if(raw && attr.hasOwnProperty('_row')) {
      raw = false;
    }
		const {_owner, _name, _obj} = this;
    const {_manager, _data} = _owner;
		const row = Constructor ? new Constructor(this) : _manager.obj_constructor(_name, raw ? [this, attr] : this);
		if(!_data._loading && _owner.add_row && _owner.add_row(row, attr) === false){
		  return;
    }
    const data = row._obj;
		for (const f in row._metadata().fields){
		  if(!data.hasOwnProperty(f)) {
        row[f] = attr[f] || '';
      }
		}
    data.row = _obj.push(data);
    Object.defineProperty(data, '_row', {
      value: row,
      enumerable: false
    });
    !_data._loading && !silent && _manager.emit_async('rows', _owner, {[_name]: true});
		_data._modified = true;
		return row;
	}
	each(fn) {
	  for(const row of this._obj){
	    if(fn.call(this, row._row) === false) break;
    }
	}
	get forEach() {
		return this.each
	}
	map(fn) {
    return this._obj.map((row, index) => fn(row._row, index));
  }
	group_by(dimensions, resources) {
		try {
      const res = this.aggregate(dimensions, resources, 'SUM', true);
			return this.load(res);
		}
		catch (err) {
			this._owner._manager._owner.$p.record_log(err);
		}
	}
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
      else {
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
	aggregate(dimensions, resources, aggr = "sum", ret_array) {
		if (typeof dimensions == "string") {
      dimensions = dimensions.length ? dimensions.split(",") : [];
    }
    if (typeof resources == "string") {
      resources = resources.length ? resources.split(",") : [];
    }
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
      else {
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
    _data._loading = _loading;
    !_loading && _manager.emit_async('rows', _owner, {[_name]: true});
		return this;
	}
	unload_column(column) {
		const res = [];
		this.each((row) => {
			res.push(row[column]);
		});
		return res;
	}
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
  [Symbol.iterator]() {
    return new Iterator$1(this._obj);
  }
}
class TabularSectionRow {
	constructor(owner, attr) {
		Object.defineProperties(this, {
			_owner: {
				value: owner
			},
			_obj: {
				value: attr ? attr : {}
			}
		});
    if(this._metadata().uid && !utils$1.is_guid(this._obj.uid)) {
      this._obj.uid = utils$1.generate_guid();
    }
	}
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
	get row() {
		return this._obj.row || 0;
	}
  get uid() {
    return this._obj.uid || utils$1.blank.guid;
  }
	_clone() {
		const {_owner, _obj} = this;
		return utils$1._mixin(_owner._owner._manager.obj_constructor(_owner._name, _owner), _obj);
	}
	_setter(f, v) {
		const {_owner, _obj} = this;
		const _meta = this._metadata(f);
		if (_obj[f] == v || (!v && _obj[f] == utils$1.blank.guid)){
      return;
    }
    const {_manager, _data} = _owner._owner;
		let fetched_type;
		if (_meta.choice_type) {
			const prop = _meta.choice_type.path.length == 2 ? this[_meta.choice_type.path[1]] : _owner._owner[_meta.choice_type.path[0]];
			if (prop && prop.type){
        fetched_type = prop.type;
        v = utils$1.fetch_type(v, fetched_type);
      }
		}
		if(!_data._loading){
      _manager.emit_async('update', this, {[f]: _obj[f]});
      _data._modified = true;
    }
		this.__setter(f, v, fetched_type);
	}
  value_change(f, mf, v) {
    return this;
  }
}

var data_tabulars = /*#__PURE__*/Object.freeze({
	__proto__: null,
	TabularSection: TabularSection,
	TabularSectionRow: TabularSectionRow
});

class InnerData {
  constructor(owner, loading) {
    this._ts_ = {};
    this._is_new = !(owner instanceof EnumObj);
    this._loading = !!loading;
    this._saving = 0;
    this._saving_trans = false;
    this._modified = false;
  }
}
class BaseDataObj {
  constructor(attr, manager, loading, direct) {
    Object.defineProperties(this, {
      _obj: {
        value: direct ? attr : {
          ref: manager instanceof EnumManager ? attr.name : (manager instanceof RegisterManager ? manager.get_ref(attr) : utils$1.fix_guid(attr))
        },
        configurable: true
      },
      _manager: {
        value: manager
      },
      _data: {
        value: new InnerData(this, loading),
        configurable: true
      }
    });
  }
  _getter(f) {
    const mf = this._metadata(f).type;
    const {_obj} = this;
    const res = _obj ? _obj[f] : '';
    if(f == 'type' && typeof res == 'object') {
      return res;
    }
    else if(f == 'ref') {
      return res;
    }
    else if(mf.is_ref) {
      if(mf.digits && typeof res === 'number') {
        return res;
      }
      if(mf.hasOwnProperty('str_len') && !utils$1.is_guid(res)) {
        return res;
      }
      const {_manager} = this;
      const mgr = _manager.value_mgr(_obj, f, mf);
      if(mgr) {
        if(utils$1.is_data_mgr(mgr)) {
          return mgr.get(res, false, false);
        }
        else {
          return utils$1.fetch_type(res, mgr);
        }
      }
      if(res) {
        typeof utils$1.debug === 'function' && utils$1.debug([f, mf, _obj]);
        return null;
      }
    }
    else if(mf.date_part) {
      return utils$1.fix_date(_obj[f], true);
    }
    else if(mf.digits) {
      return utils$1.fix_number(_obj[f], !mf.hasOwnProperty('str_len'));
    }
    else if(mf.types[0] == 'boolean') {
      return utils$1.fix_boolean(_obj[f]);
    }
    else if(mf.types[0] == 'json') {
      if(typeof res === 'object') {
        return res;
      }
      if(typeof res === 'string') {
        try {
          const v = JSON.parse(res);
          _obj[f] = v;
          return v;
        }
        catch (e) {}
      }
      return {};
    }
    else {
      return _obj[f] || '';
    }
  }
  __setter(f, v, mf) {
    const {_obj, _data} = this;
    if(!mf){
      mf = this._metadata(f).type;
    }
    if(!_data._loading) {
      _data._loading = true;
      const res = this.value_change(f, mf, v);
      _data._loading = false;
      if(res === false) {
        return;
      }
    }
    if(f === 'type' && v.types) {
      _obj[f] = v;
    }
    else if(f === 'ref') {
      _obj[f] = utils$1.fix_guid(v);
    }
    else if(mf instanceof DataObj || mf instanceof DataManager) {
      _obj[f] = utils$1.fix_guid(v, false);
    }
    else if(mf.is_ref) {
      if(mf.digits && typeof v === 'number' || mf.hasOwnProperty('str_len') && typeof v === 'string' && !utils$1.is_guid(v)) {
        _obj[f] = v;
      }
      else if(typeof v === 'boolean' && mf.types.indexOf('boolean') != -1) {
        _obj[f] = v;
      }
      else if(mf.date_part && v instanceof Date) {
        _obj[f] = v;
      }
      else {
        _obj[f] = utils$1.fix_guid(v);
        if(utils$1.is_data_obj(v) && mf.types.indexOf(v._manager.class_name) != -1) ;
        else {
          let mgr = this._manager.value_mgr(_obj, f, mf, false, v);
          if(mgr) {
            if(mgr instanceof EnumManager) {
              if(typeof v === 'string') {
                _obj[f] = v;
              }
              else if(!v) {
                _obj[f] = '';
              }
              else if(typeof v === 'object') {
                _obj[f] = v.ref || v.name || '';
              }
            }
            else if(v && v.presentation) {
              if(v.type && !(v instanceof DataObj)) {
                delete v.type;
              }
              mgr.create(v);
            }
            else if(!utils$1.is_data_mgr(mgr)) {
              _obj[f] = utils$1.fetch_type(v, mgr);
            }
          }
          else {
            if(typeof v !== 'object') {
              _obj[f] = v;
            }
          }
        }
      }
    }
    else if(mf.date_part) {
      _obj[f] = utils$1.fix_date(v, !mf.hasOwnProperty('str_len'));
    }
    else if(mf.digits) {
      _obj[f] = utils$1.fix_number(v, !mf.hasOwnProperty('str_len'));
    }
    else if(mf.types[0] == 'boolean') {
      _obj[f] = utils$1.fix_boolean(v);
    }
    else if(mf.types[0] == 'json') {
      if(v && typeof v === 'string') {
        try {
          v = JSON.parse(v);
        }
        catch (e) {}
      }
      if(typeof v === 'object') {
        const tmp = utils$1._clone(v);
        if(tmp && typeof _obj[f] === 'object') {
          Object.assign(_obj[f], tmp);
        }
        else {
          _obj[f] = tmp;
        }
      }
    }
    else {
      _obj[f] = v;
    }
  }
  __notify(f) {
    const {_data, _manager} = this;
    if(_data && !_data._loading) {
      _data._modified = true;
      _manager.emit_async('update', this, {[f]: this._obj[f]});
    }
  }
  _setter(f, v) {
    if(this._obj[f] != v) {
      this.__notify(f);
      this.__setter(f, v);
    }
  }
  _getter_ts(f) {
    const {_ts_} = this._data;
    return _ts_[f] || (_ts_[f] = new TabularSection(f, this));
  }
  _setter_ts(f, v) {
    const ts = this._getter_ts(f);
    ts instanceof TabularSection && Array.isArray(v) && ts.load(v, true);
  }
  _hash() {
    let str = '';
    const {_obj, _manager} = this;
    const {fields, tabular_sections} = _manager.metadata();
    const sfields = ['date','number_doc','posted','id','name','_deleted','is_folder','ref'];
    for(const fld of Object.keys(fields).concat(sfields)) {
      const v = _obj[fld];
      if(v !== undefined && v !== null) {
        str += v.valueOf();
      }
    }
    for (const ts in tabular_sections) {
      if(Array.isArray(_obj[ts])) {
        const fields = Object.keys(tabular_sections[ts].fields);
        for(const row of _obj[ts]) {
          for(const fld of fields) {
            const v = row[fld];
            if(v !== undefined && v !== null) {
              str += v.valueOf();
            }
          }
        }
      }
    }
    return utils$1.crc32(str);
  }
  valueOf() {
    return this.ref;
  }
  toJSON() {
    const res = {};
    const {_obj, _manager} = this;
    const {utils, classes: {Meta}} = _manager._owner.$p;
    for(const fld in _obj) {
      const mfld = _manager.metadata(fld);
      if(mfld || fld === '_attachments') {
        if(Array.isArray(_obj[fld])) {
          res[fld] = this[fld].toJSON();
        }
        else {
          if(!Meta._sys_fields.includes(fld) &&
            (_obj[fld] === utils.blank.guid || (_obj[fld] === '' && mfld?.type?.types?.length === 1 && mfld?.type?.types[0] === 'string'))) {
            continue;
          }
          res[fld] = _obj[fld];
          if(fld === 'type' && typeof res[fld] === 'object') {
            delete res[fld]._mgr;
          }
          else if(mfld?.type?.types?.includes('json') && typeof res[fld] === 'object') {
            for(const root in res[fld]) {
              if(utils.is_data_obj(res[fld][root])) {
                res[fld][root] = res[fld][root].valueOf();
              }
              else if (typeof res[fld][root] === 'object') {
                for(const prop in res[fld][root]) {
                  if(res[fld][root][prop].ref) {
                    res[fld][root][prop] = res[fld][root][prop].ref;
                  }
                }
              }
            }
          }
        }
      }
    }
    return res;
  }
  toString() {
    return this.presentation;
  }
  _metadata(field_name) {
    return this._manager.metadata(field_name);
  }
  get _deleted() {
    return !!this._obj._deleted;
  }
  set _deleted(v) {
    this._obj._deleted = !!v;
  }
  get _modified() {
    return !!this._data._modified;
  }
  set _modified(v) {
    this._data._modified = !!v;
  }
  is_new() {
    return !this._data || this._data._is_new;
  }
  _set_loaded(ref) {
    this._manager.push(this, ref || this.ref);
    Object.assign(this._data, {
      _modified: false,
      _is_new: false,
      _loading: false,
    });
    return this;
  }
  mark_deleted(deleted) {
    this._obj._deleted = !!deleted;
    return this.save();
  }
  get class_name() {
    return this._manager.class_name;
  }
  set class_name(v) {
    return this._obj.class_name = v;
  }
  empty() {
    return !this._obj || utils$1.is_empty_guid(this._obj.ref);
  }
  _mixin(attr, include, exclude, silent) {
    if(Object.isFrozen(this)) {
      return this;
    }
    if(attr && typeof attr == 'object') {
      const {_not_set_loaded} = attr;
      const {_data, _manager} = this;
      _not_set_loaded && delete attr._not_set_loaded;
      if(silent) {
        if(_data._loading) {
          silent = false;
        }
        _data._loading = true;
      }
      utils$1._mixin(this, attr, include, exclude);
      if(_data._loading) {
        _manager.emit('mixin', this);
      }
      if(silent) {
        _data._loading = false;
      }
      if(!_not_set_loaded && (_data._loading || (!utils$1.is_empty_guid(this.ref) && (attr.id || attr.name || attr.number_doc)))) {
        this._set_loaded(this.ref);
      }
    }
    return this;
  }
  _fix_plain() {
    const {_obj, _manager} = this;
    const {fields, tabular_sections, hierarchical, has_owners} = this._metadata();
    DataObj.fix_collection(this, _obj, fields);
    if(hierarchical || has_owners) {
      const sys_fields = {};
      if(hierarchical) {
        sys_fields.parent = this._metadata('parent');
      }
      if(has_owners) {
        sys_fields.owner = this._metadata('owner');
      }
      DataObj.fix_collection(this, _obj, sys_fields);
    }
    else if(utils$1.is_doc_obj(this)) {
      DataObj.fix_collection(this, _obj, {date: this._metadata('date')});
    }
    for (const ts in tabular_sections) {
      if(Array.isArray(_obj[ts])){
        const tabular = this[ts];
        const Constructor = _manager.obj_constructor(ts, true);
        if(Constructor) {
          const {fields} = tabular_sections[ts];
          for(let i = 0; i < _obj[ts].length; i++) {
            const row = _obj[ts][i];
            const _row = new Constructor(tabular, row);
            row.row = i + 1;
            Object.defineProperty(row, '_row', {value: _row});
            DataObj.fix_collection(_row, row, fields);
          }
        }
      }
    }
  }
  print(model, wnd) {
    return this._manager.print(this, model, wnd);
  }
  after_create() {
    return this;
  }
  after_load() {
    return this;
  }
  before_save() {
    return this;
  }
  after_save() {
    return this;
  }
  value_change(f, mf, v) {
    return this;
  }
  add_row(row) {
    return this;
  }
  del_row(row) {
    return this;
  }
  after_del_row(name) {
    return this;
  }
  static fix_collection(obj, _obj, fields) {
    for (const fld in fields) {
      let {type, choice_type} = fields[fld];
      if(choice_type?.path) {
        const tname = choice_type.path[choice_type.path.length - 1];
        let prop = obj[tname];
        if(prop && prop.type) {
          type = prop.type;
        }
        else if(tname === 'ТипЗначения' && _obj?.type?.types) {
          type = _obj?.type;
        }
      }
      if(_obj.hasOwnProperty(fld)) {
        if (type.is_ref && typeof _obj[fld] === 'object') {
          if(!(fld === 'type' && obj.class_name && obj.class_name.indexOf('cch.') === 0)) {
            _obj[fld] = utils$1.fix_guid(_obj[fld], false);
          }
        }
        else if (type.date_part && typeof _obj[fld] === 'string') {
          _obj[fld] = utils$1.fix_date(_obj[fld], type.types.length === 1);
        }
      }
      else {
        if(type.digits && !type.hasOwnProperty('str_len')) {
          _obj[fld] = 0;
        }
        else if (type.is_ref && !type.hasOwnProperty('str_len')) {
          _obj[fld] = utils$1.blank.guid;
        }
        else if (type.hasOwnProperty('str_len')) {
          _obj[fld] = '';
        }
      }
    }
  }
}
class DataObj extends BaseDataObj {
  constructor(attr, manager, loading, direct) {
    if(!(manager instanceof DataProcessorsManager) && !(manager instanceof EnumManager)) {
      const tmp = manager.get(attr, true);
      if(tmp) {
        return tmp;
      }
    }
    super(attr, manager, loading, direct);
    if(manager.alatable && manager.push) {
      manager.alatable.push(this._obj);
      manager.push(this, this._obj.ref);
    }
  }
  get _rev() {
    return this._obj._rev || '';
  }
  set _rev(v) {
  }
  load(attr) {
    const {_data} = this;
    if(this.ref == utils$1.blank.guid) {
      if(_data) {
        _data._loading = false;
        _data._modified = false;
      }
      return Promise.resolve(this);
    }
    else if(_data._loading) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(_data._loading ? this.load(attr) : this);
        }, 1000);
      });
    }
    else {
      _data._loading = true;
      return this._manager.adapter.load_obj(this, attr)
        .then(() => {
          _data._loading = false;
          _data._modified = false;
          return this.after_load();
        });
    }
  }
  unload() {
    const {_obj, ref, _data, _manager} = this;
    if(this.empty()) {
      const {job_prm} = _manager._owner.$p;
      if(job_prm.debug) {
        throw new Error('Попытка выгрузить пустой объект данных');
      }
      return;
    }
    _manager.unload_obj(ref);
    _data._loading = true;
    for (const ts in this._metadata().tabular_sections) {
      this[ts].clear();
    }
    for (const f in this) {
      if(this.hasOwnProperty(f)) {
        delete this[f];
      }
    }
    for (const f in _obj) {
      delete _obj[f];
    }
    delete this._obj;
  }
  check_mandatory(attr) {
    const {fields, tabular_sections} = this._metadata();
    const {_manager} = this;
    const {msg, cch: {properties}, classes} = _manager._owner.$p;
    const flds = Object.assign({}, fields);
    if(_manager instanceof classes.CatManager) {
      flds.name = this._metadata('name') || {};
      flds.id = this._metadata('id') || {};
    }
    for (const mf in flds) {
      if (flds[mf] && flds[mf].mandatory && (!this._obj[mf] || this._obj[mf] === utils$1.blank.guid)) {
        throw {
          obj: this,
          title: msg.mandatory_title,
          type: 'alert-error',
          text: msg.mandatory_field.replace('%1', this._metadata(mf).synonym)
        };
      }
    }
    if(properties) {
      for (const prts of ['extra_fields', 'product_params', 'params']) {
        if(!tabular_sections[prts]) {
          continue;
        }
        for (const row of this[prts]._obj) {
          const property = properties.get(row.property || row.param);
          if(property && property.mandatory) {
            const {value} = (row._row || row);
            if(utils$1.is_data_obj(value) ? value.empty() : !value) {
              throw {
                obj: this,
                row: row._row || row,
                title: msg.mandatory_title,
                type: 'alert-error',
                text: msg.mandatory_field.replace('%1', property.caption || property.name)
              };
            }
          }
        }
      }
    }
    return true;
  }
  save(post, operational, attachments, attr) {
    if(utils$1.is_empty_guid(this.ref)) {
      return Promise.resolve(this);
    }
    let initial_posted;
    if(this instanceof DocObj && typeof post == 'boolean') {
      initial_posted = this.posted;
      this.posted = post;
    }
    const {_data, _manager} = this;
    _data._saving_trans = true;
    return _manager.emit_promise('before_save', this, attr)
      .then(() => {
        return this.before_save(attr);
      })
      .then((before_save_res) => {
        const reset_modified = () => {
          if(before_save_res === false) {
            if(this instanceof DocObj && typeof initial_posted == 'boolean' && this.posted !== initial_posted) {
              this.posted = initial_posted;
            }
          }
          else {
            _data._modified = false;
          }
          _data._saving = 0;
          _data._saving_trans = false;
          return this;
        };
        if(before_save_res === false) {
          return Promise.reject(reset_modified());
        }
        else if(before_save_res === null) {
          return Promise.resolve(reset_modified());
        }
        else ;
        const reset_mandatory = (msg) => {
          before_save_res = false;
          reset_modified();
          _manager._owner.$p.md.emit('alert', msg);
          const err = new Error(msg.text);
          err.msg = msg;
          return Promise.reject(err);
        };
        if(this._metadata().hierarchical && !this._obj.parent) {
          this._obj.parent = utils$1.blank.guid;
        }
        let numerator;
        if(!this._deleted) {
          if(this instanceof DocObj || this instanceof TaskObj || this instanceof BusinessProcessObj) {
            if(utils$1.blank.date == this.date) {
              this.date = new Date();
            }
            if(!this.number_doc) {
              numerator = this.new_number_doc();
            }
          }
          else {
            if(!this.id) {
              numerator = this.new_number_doc();
            }
          }
        }
        try {
          this.check_mandatory();
        }
        catch (e) {
          return reset_mandatory(e);
        }
        return (numerator || Promise.resolve())
          .then(() => _manager.adapter.save_obj(this, Object.assign({post, operational, attachments}, attr)))
          .then(() => this.after_save())
          .then(reset_modified)
          .then(() => _manager.emit_promise('after_save', this))
          .catch((err) => {
            reset_modified();
            throw err;
          });
      });
  }
  load_linked_refs() {
    const adapters = new Map();
    const {fields, tabular_sections} = this._metadata();
    function add_refs(obj, meta) {
      for(const fld in meta) {
        if(meta[fld].type.is_ref) {
          const v = obj[fld];
          if(v instanceof DataObj && !v.empty() && v.is_new()) {
            const {_manager} = v;
            const {adapter} = _manager;
            const db = adapter.db(_manager);
            if(db) {
              if(!adapters.get(adapter)) {
                adapters.set(adapter, new Map());
              }
              if(!adapters.get(adapter).get(db)){
                adapters.get(adapter).set(db, new Set());
              }
              adapters.get(adapter).get(db).add(`${v.class_name}|${v.ref}`);
            }
          }
        }
      }
    }
    add_refs(this, fields);
    for(const tsname in tabular_sections) {
      const meta = tabular_sections[tsname].fields;
      for(const row of this[tsname]) {
        row && add_refs(row, meta);
      }
    }
    const res = [];
    for(const [adapter, mdb] of adapters) {
      for(const [db, refs] of mdb) {
        res.push(adapter
          .load_array(null, Array.from(refs), false, db)
          .catch((err) => null));
      }
    }
    return Promise.all(res).then(() => this);
  }
  get_attachment(att_id, dhtmlx) {
    const {_manager, ref} = this;
    return _manager.adapter
      .get_attachment(_manager, ref, att_id)
      .then((blob) => {
        if(blob?.type === 'application/internet-shortcut' && dhtmlx === 1 && typeof 'window' !== 'undefined') {
          return utils$1.blob_url_open(blob);
        }
        return blob;
      });
  }
  save_attachment(att_id, attachment, type) {
    const {_manager, ref, _obj, _attachments} = this;
    return _manager.save_attachment(ref, att_id, attachment, type)
      .then((att) => {
        if(!_attachments) {
          this._attachments = {};
        }
        if(att.rev && _obj) {
          _obj._rev = att.rev;
        }
        if(!this._attachments[att_id] || !att.stub) {
          this._attachments[att_id] = att;
        }
        return att;
      });
  }
  delete_attachment(att_id) {
    const {_manager, ref, _obj, _attachments} = this;
    return _manager.delete_attachment(ref, att_id)
      .then((att) => {
        if(_attachments) {
          delete _attachments[att_id];
        }
        if(att.rev && _obj) {
          _obj._rev = att.rev;
        }
        return att;
      });
  }
  broken_links() {
    const res = [];
    const {fields, tabular_sections} = this._metadata();
    const {_obj, _manager: {_owner}} = this;
    const {md} = _owner.$p;
    if(this.empty() || this.is_new()){
      return res;
    }
    for (const fld in fields) {
      const {type} = fields[fld];
      if (type.is_ref && _obj.hasOwnProperty(fld) && _obj[fld] && !utils$1.is_empty_guid(_obj[fld])) {
        const finded = type.types.some((type) => {
          const _mgr = md.mgr_by_class_name(type);
          return _mgr && !_mgr.get(_obj[fld], false, false).is_new();
        });
        if (!finded) {
          res.push({'obj': _obj, fld, 'ts': '', 'row': 0, 'value': _obj[fld], type});
        }
      }
    }
    for(const ts in tabular_sections) {
      if (_obj.hasOwnProperty(ts)) {
        const {fields} = tabular_sections[ts];
        _obj[ts].forEach((row) => {
          for(const fld in fields) {
            const {type} = fields[fld];
            if (type.is_ref && row.hasOwnProperty(fld) && row[fld] && !utils$1.is_empty_guid(row[fld])) {
              const finded = type.types.some((type) => {
                const _mgr = md.mgr_by_class_name(type);
                return _mgr && !_mgr.get(_obj[fld], false, false).is_new();
              });
              if (!finded) {
                res.push({'obj': _obj, fld, ts, 'row': row.row, 'value': row[fld], type});
              }
            }
          }
        });
      }
    }
    return res;
  }
  _links(set, excludeTypes = []) {
    const tmp = new Set();
    const {fields, tabular_sections} = this._metadata();
    const {_obj, _manager: {_owner}} = this;
    _owner.$p;
    if(this.empty() || this.is_new()){
      return tmp;
    }
    for (const fld in fields) {
      const {type} = fields[fld];
      if (type.is_ref && _obj.hasOwnProperty(fld) && _obj[fld] && !utils$1.is_empty_guid(_obj[fld])) {
        const v = this[fld];
        if(v instanceof DataObj && !v.empty() && !set.has(v)) {
          if(excludeTypes.includes(v.class_name)) {
            continue;
          }
          if(v.class_name.startsWith('enm')) {
            excludeTypes.push(v.class_name);
          }
          else {
            tmp.add(v);
          }
        }
      }
    }
    for(const ts in tabular_sections) {
      if (_obj.hasOwnProperty(ts)) {
        const {fields} = tabular_sections[ts];
        for(const row of this[ts]) {
          for(const fld in fields) {
            const {type} = fields[fld];
            if (type.is_ref) {
              const v = row[fld];
              if (v instanceof DataObj && !v.empty() && !set.has(v)) {
                if(excludeTypes.includes(v.class_name)) {
                  continue;
                }
                if(v.class_name.startsWith('enm')) {
                  excludeTypes.push(v.class_name);
                }
                else {
                  tmp.add(v);
                }
              }
            }
          }
        }
      }
    }
    return tmp;
  }
  _extra(property, value, list) {
    const {extra_fields, _manager: {_owner}} = this;
    const {cch, md} = _owner.$p;
    if(!extra_fields || !cch.properties) {
      return;
    }
    if(typeof property === 'string') {
      property = cch.properties.predefined(property);
    }
    if(!property) {
      return;
    }
    const row = extra_fields.find({property});
    if(value !== undefined) {
      if(row) {
        row.value = value;
      }
      else {
        extra_fields.add({property, value});
      }
    }
    else {
      const {type: {types, is_ref}} = property;
      if(!list) {
        list = property.list;
      }
      if(list === 4) {
        const res = new Map();
        try {
          const mgr = md.mgr_by_class_name(types[0]);
          const raw = row?.txt_row ? JSON.parse(row.txt_row) : {};
          for(const ref in raw) {
            res.set(mgr.get(ref), raw[ref]);
          }
        }
        catch (e) {
        }
        return res;
      }
      if(row) {
        return row.value;
      }
      if(is_ref && types.length === 1) {
        const mgr = md.mgr_by_class_name(types[0]);
        return mgr && mgr.get();
      }
    }
  }
}
Object.defineProperty(DataObj.prototype, 'ref', {
  get: function () {
    return this._obj ? this._obj.ref : utils$1.blank.guid;
  },
  set: function (v) {
    this._obj.ref = utils$1.fix_guid(v);
  },
  enumerable: true,
  configurable: true
});
TabularSectionRow.prototype._getter = DataObj.prototype._getter;
TabularSectionRow.prototype.__setter = DataObj.prototype.__setter;
class CatObj extends DataObj {
  constructor(attr, manager, loading) {
    const direct = loading && attr && utils$1.is_guid(attr.ref);
    super(attr, manager, loading, direct);
    if(direct) {
      this._fix_plain();
    }
    else {
      this._mixin(attr);
    }
  }
  get presentation() {
    return this.empty() ? '' : (this.name || this.id || this._presentation || '');
  }
  set presentation(v) {
    if(v) {
      this._presentation = String(v);
    }
  }
  get id() {
    return this._obj.id || '';
  }
  set id(v) {
    this.__notify('id');
    this._obj.id = v;
  }
  get name() {
    return this._obj.name || '';
  }
  set name(v) {
    this.__notify('name');
    this._obj.name = String(v);
  }
  _children(folders_only) {
    const res = [];
    this._manager.forEach((o) => {
      if(o != this && (!folders_only || o.is_folder) && o._hierarchy(this)) {
        res.push(o);
      }
    });
    return res;
  }
  _parents() {
    const res = [];
    let {parent} = this;
    while (parent && !parent.empty()) {
      res.push(parent);
      parent = parent.parent;
    }
    return res;
  }
  _hierarchy(group) {
    if(Array.isArray(group)) {
      return group.some((v) => this._hierarchy(v));
    }
    const {parent} = this;
    if(this == group || parent == group) {
      return true;
    }
    if(parent && !parent.empty()) {
      return parent._hierarchy(group);
    }
    return group == utils$1.blank.guid;
  }
}
const NumberDocAndDate = (superclass) => class extends superclass {
  get number_doc() {
    return this._obj.number_doc || '';
  }
  set number_doc(v) {
    this.__notify('number_doc');
    this._obj.number_doc = v;
  }
  get date() {
    return this._obj.date instanceof Date ? this._obj.date : utils$1.blank.date;
  }
  set date(v) {
    this.__notify('date');
    this._obj.date = utils$1.fix_date(v, true);
  }
};
class DocObj extends NumberDocAndDate(DataObj) {
  constructor(attr, manager, loading) {
    const direct = loading && attr && utils$1.is_guid(attr.ref);
    super(attr, manager, loading, direct);
    if(direct) {
      this._fix_plain(this);
    }
    else {
      this._mixin(attr);
    }
  }
  get presentation() {
    if(this.empty()) {
      return '';
    }
    const {number_doc, date, posted, _modified} = this;
    const meta = this._metadata();
    if(this.is_new()) {
      return `${meta.obj_presentation || meta.synonym} ${number_doc ? `№${number_doc}` : '(новый)'} (не записан) *`;
    }
    return number_doc ?
      `${meta.obj_presentation || meta.synonym}  №${number_doc} от ${moment(date).format(moment._masks.date_time)} (${posted ? '' : 'не '}проведен)${_modified ? ' *' : ''}`
      :
      `${meta.obj_presentation || meta.synonym} ${moment(date).format(moment._masks.date_time)} (${posted ? '' : 'не '}проведен)${_modified ? ' *' : ''}`;
  }
  set presentation(v) {
    if(v) {
      this._presentation = String(v);
    }
  }
  get posted() {
    return this._obj.posted || false;
  }
  set posted(v) {
    this.__notify('posted');
    this._obj.posted = utils$1.fix_boolean(v);
  }
  get deferredProcessing() {
    return this._obj.deferredProcessing || {};
  }
  set deferredProcessing(v) {
    if(typeof v !== 'object') {
      throw new Error('deferredProcessing value must be object type');
    }
    const {_obj} = this;
    if(!_obj.deferredProcessing) {
      _obj.deferredProcessing = {};
    }
    for(const fld in v) {
      if(v[fld] === undefined) {
        delete _obj.deferredProcessing[fld];
      }
      else {
        _obj.deferredProcessing[fld] = v[fld];
      }
    }
    if(!Object.keys(_obj.deferredProcessing).length) {
      delete _obj.deferredProcessing;
    }
  }
}
class DataProcessorObj extends DataObj {
  constructor(attr, manager, loading) {
    super(attr, manager, loading);
    if(!loading) {
      const {fields, tabular_sections} = manager.metadata();
      for (const fld in fields) {
        if(!attr[fld]) {
          attr[fld] = utils$1.fetch_type('', fields[fld].type);
        }
      }
      for (const fld in tabular_sections) {
        if(!attr[fld]) {
          attr[fld] = [];
        }
      }
    }
    utils$1._mixin(this, attr);
  }
}
class TaskObj extends NumberDocAndDate(CatObj) {
}
class BusinessProcessObj extends NumberDocAndDate(CatObj) {
}
class EnumObj extends DataObj {
  constructor(attr, manager, loading) {
    super(attr, manager, loading);
    if(attr && typeof attr == 'object') {
      const {_obj} = this;
      if(!_obj.ref && _obj.name) {
        _obj.ref = _obj.name;
      }
      _obj !== attr && utils$1._mixin(this, attr, null, ['latin']);
    }
  }
  get order() {
    return this._obj.sequence;
  }
  set order(v) {
    this._obj.sequence = parseInt(v);
  }
  get name() {
    return this._obj.ref;
  }
  set name(v) {
    this._obj.ref = String(v);
  }
  get synonym() {
    return this._obj.synonym || '';
  }
  set synonym(v) {
    this._obj.synonym = String(v);
  }
  get presentation() {
    return this.synonym || this.name;
  }
  empty() {
    return !this.ref || this.ref == '_';
  }
  toJSON() {
    return this.empty() ? '' : this.ref;
  }
  is(name) {
    return this._manager[name] === this;
  }
}
class RegisterRow extends DataObj {
  constructor(attr, manager, loading) {
    super(attr, manager, loading);
    if(attr && typeof attr == 'object') {
      let tref = attr.ref;
      if(tref) {
        delete attr.ref;
      }
      utils$1._mixin(this, attr);
      if(tref) {
        attr.ref = tref;
      }
    }
    for (var check in manager.metadata().dimensions) {
      if(!attr.hasOwnProperty(check) && attr.ref) {
        var keys = attr.ref.split('¶');
        Object.keys(manager.metadata().dimensions).forEach((fld, ind) => {
          this[fld] = keys[ind];
        });
        break;
      }
    }
  }
  _metadata(field_name) {
    const _meta = this._manager.metadata();
    if(!_meta.fields) {
      _meta.fields = Object.assign({}, _meta.dimensions, _meta.resources, _meta.attributes);
    }
    return field_name ? _meta.fields[field_name] : _meta;
  }
  get ref() {
    return this._manager.get_ref(this);
  }
  set ref(v) {
  }
  get presentation() {
    return this._metadata().obj_presentation || this._metadata().synonym;
  }
}

var data_objs = /*#__PURE__*/Object.freeze({
	__proto__: null,
	BaseDataObj: BaseDataObj,
	BusinessProcessObj: BusinessProcessObj,
	CatObj: CatObj,
	DataObj: DataObj,
	DataProcessorObj: DataProcessorObj,
	DocObj: DocObj,
	EnumObj: EnumObj,
	InnerData: InnerData,
	NumberDocAndDate: NumberDocAndDate,
	RegisterRow: RegisterRow,
	TaskObj: TaskObj
});

class MetaEventEmitter extends EventEmitter{
  constructor() {
    super();
    this.setMaxListeners(20);
  }
	on(type, listener){
		if(typeof listener == 'function' && typeof type != 'object'){
			super.on(type, listener);
			return [type, listener];
		}
		else {
			for(const fld in type){
        typeof type[fld] === 'function' && super.on(fld, type[fld]);
			}
			return this;
		}
	}
	off(type, listener){
		if(listener){
			super.removeListener(type, listener);
		}
		else if(Array.isArray(type)){
			super.removeListener(...type);
		}
		else if(typeof type === 'object'){
      for(const fld in type){
        typeof type[fld] === 'function' && super.removeListener(fld, type[fld]);
      }
    }
		else if(typeof type === 'function'){
			throw new TypeError('MetaEventEmitter.off: type must be a string')
		}
		else {
			super.removeAllListeners(type);
		}
	}
  _distinct(type, handler) {
    const res = [];
    switch (type){
      case 'update':
      case 'rows':
        for(const arg of handler.args){
          if(res.some(row => {
              if(row[0] == arg[0]){
                if(!row[1].hasOwnProperty(Object.keys(arg[1])[0])){
                  Object.assign(row[1], arg[1]);
                }
                return true;
              }
            })){
            continue;
          }
          res.push(arg);
        }
        break;
      default:
        let len = 0;
        for(const arg of handler.args){
          len = Math.max(len, arg.length);
          if(res.some(row => {
              for(let i = 0; i < len; i++){
                if(arg[i] != row[i]){
                  return true;
                }
              }
            })){
            continue;
          }
          res.push(arg);
        }
    }
    handler.timer = 0;
    handler.args.length = 0;
    return res;
  }
	_emit(type) {
    for(const args of this._distinct(type, this._async[type])){
      this.emit(type, ...args);
    }
  }
  emit_async(type, ...args) {
    if (!this._events || !this._events[type]){
      return;
    }
    if (!this._async){
      this._async = {};
    }
    if (!this._async[type]){
      this._async[type] = {'args': []};
    }
    const handler = this._async[type];
    handler.timer && clearTimeout(handler.timer);
    handler.args.push(args);
    handler.timer = setTimeout(this._emit.bind(this, type), 4);
  }
  emit_promise(type, ...args) {
    return this.listeners(type)
      .reduce((acc, curr) => acc.then(curr.bind(this, ...args)), Promise.resolve(args[0]));
  }
  emit_add_fields(obj, fields){
    const {_async} = this;
    _async && _async.update && _async.update.args.some(attr => {
      if(attr[0] === obj) {
        for(const fld of fields){
          if(!attr[1].hasOwnProperty(fld)){
            attr[1][fld] = undefined;
          }
        }
        return true;
      }
    });
  }
}

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
class DataManager extends MetaEventEmitter{
	constructor(owner, class_name) {
		super();
		this._owner = owner;
		this.class_name = class_name;
    this.name = class_name.split('.')[1];
		this.constructor_names = {};
		this.by_ref = {};
    this._by_id = {};
	}
	toString(){
		return msg.meta_mgrs[this._owner.name]
	}
  toJSON() {
    return {type: 'DataManager', class_name: this.class_name};
  }
	metadata(field_name) {
	  const {md} = this._owner.$p;
	  const _meta = md.get(this) || {};
		if(field_name){
			return _meta.fields && _meta.fields[field_name] || md.get(this, field_name);
		}
		else {
			return _meta;
		}
	}
	get adapter(){
    const {adapters} = this._owner.$p;
    return adapters[this.cachable] || adapters.pouch;
	}
	get alatable(){
		const {table_name, _owner} = this;
		const {tables} = _owner.$p.wsql.aladb;
		return tables[table_name] ? tables[table_name].data : []
	}
	get acl() {
	  const {current_user} = this._owner.$p;
    return current_user ? current_user.get_acl(this.class_name) : 'r';
  }
	get cachable(){
    const {class_name, _cachable} = this;
    if(_cachable) {
      return _cachable;
    }
    const _meta = this.metadata();
    if(class_name.indexOf('enm.') != -1) {
      return 'ram';
    }
    if(_meta && _meta.cachable) {
      return _meta.cachable;
    }
    if(class_name.indexOf('doc.') != -1 || class_name.indexOf('dp.') != -1 || class_name.indexOf('rep.') != -1) {
      return 'doc';
    }
    return 'ram';
  }
	get table_name(){
    return this.class_name.replace('.', '_');
	}
	find_rows(selection, callback){
		return utils$1._find_rows.call(this, this, selection, callback);
	}
	find_rows_remote(selection) {
		return this.adapter.find_rows(this, selection);
	}
  extra_fields(obj) {
    const {cat, cch, md} = this._owner.$p;
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
	extra_properties(obj){
		return [];
	}
	obj_constructor(ts_name = "", mode) {
		if(!this.constructor_names[ts_name]){
			const parts = this.class_name.split("."),
				fn_name = parts[0].charAt(0).toUpperCase() + parts[0].substr(1) + parts[1].charAt(0).toUpperCase() + parts[1].substr(1);
			this.constructor_names[ts_name] = ts_name ? fn_name + ts_name.charAt(0).toUpperCase() + ts_name.substr(1) + "Row" : fn_name;
		}
		ts_name = this.constructor_names[ts_name];
		if(!mode){
			return ts_name;
		}
		const constructor = this._owner.$p[ts_name];
		if(mode === true ){
			return constructor;
		}
		if(Array.isArray(mode)){
			return new constructor(...mode);
		}
		return new constructor(mode);
	}
	get_option_list(selection = {}, val){
		let t = this, l = [], input_by_string, text;
    function push(v){
      if(selection._dhtmlx){
        const opt = {
          text: v.presentation,
          value: v.ref
        };
        if(utils$1.is_equal(opt.value, val)){
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
          selection.selector.push({class_name: t.class_name});
        }
        else {
          selection.selector.class_name = t.class_name;
        }
      }
      return t.adapter.find_rows(t, selection)
        .then((data) => {
          for (const v of data) {
            push(v);
          }          return l;
        });
    }
    else {
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
      else if(mf?.default && (!property || property === utils$1.blank.guid)) {
        const tnames = mf.default.split('.');
        return $p[tnames[0]][tnames[1]];
      }
      else if(property && property != utils$1.blank.guid) {
        for (const mgr of rt) {
          const v = mgr.by_ref[property?.ref || property];
          if(v && !v.is_new()) {
            return mgr;
          }
        }
        for (const mgr of rt) {
          if(mgr.by_ref[property]) {
            return mgr;
          }
        }
      }
    }
		else {
      let oproperty;
			if (utils$1.is_data_obj(property)){
				oproperty = property;
			}
			else if (utils$1.is_guid(property)){
				oproperty = $p.cch.properties.get(property);
			}
			else {
				return;
			}
			if (utils$1.is_data_obj(oproperty)) {
				if (oproperty.is_new()){
					return $p.cat.property_values;
				}
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
				if(rt.length == 1 || row[f] == utils$1.blank.guid){
					return DataManager.mf_mgr(rt[0], mf);
				}
				else if(array_enabled){
					return rt;
				}
				else if((property = row[f]) instanceof DataObj){
					return property._manager;
				}
				else if(utils$1.is_guid(property) && property != utils$1.blank.guid){
					for(const mgr of rt){
						if(mgr.by_ref[property]){
							return mgr;
						}
					}
				}
			}
		}
	}
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
  unload_obj(ref) {
    if(ref === utils$1.blank.ref) {
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
  forEach(fn) {
    return this.each(fn);
  }
  [Symbol.iterator]() {
    return new Iterator(this.by_ref, this.alatable);
  }
  static mf_mgr(mgr, mf) {
    if (mgr && mf.types.length == 1){
      mf._mgr = mgr;
    }
    return mgr;
  }
}
class RefDataManager extends DataManager{
	push(o, new_ref){
		if(new_ref && (new_ref != o.ref)){
			delete this.by_ref[o.ref];
			this.by_ref[new_ref] = o;
		}else
			this.by_ref[o.ref] = o;
	}
	each(fn){
    for (const i in this.by_ref) {
      if(!i || i === utils$1.blank.guid) {
        continue;
      }
      if(fn.call(this, this.by_ref[i]) === true) {
        break;
      }
    }
  }
	get(ref, no_create){
		if(!ref || typeof ref !== string){
      ref = utils$1.fix_guid(ref);
    }
		let o = this.by_ref[ref];
		if(arguments.length == 3){
			if(no_create){
				no_create = rp;
			}
			else {
				no_create = arguments[2];
			}
		}
		let created;
		if(!o){
			if(no_create && no_create != rp){
				return;
			}
			else {
				o = this.obj_constructor('', [ref, this]);
        created = true;
			}
		}
		if(ref === utils$1.blank.guid){
			return no_create == rp ? Promise.resolve(o) : o;
		}
		if(o.is_new()){
			if(no_create == rp){
				return o.load()
          .then(() => {
            return o.is_new() ? o.after_create() : o;
          });
			}
			else {
        created && arguments.length !== 3 && o.after_create();
				return o;
			}
		}else {
			return no_create == rp ? Promise.resolve(o) : o;
		}
	}
	create(attr, do_after_create, force_obj){
		if(!attr || typeof attr !== "object"){
			attr = {};
		}
		else if(utils$1.is_data_obj(attr)){
			return Promise.resolve(attr);
		}
		if(!attr.ref || !utils$1.is_guid(attr.ref) || utils$1.is_empty_guid(attr.ref)){
			attr.ref = utils$1.generate_guid();
		}
		let o = this.by_ref[attr.ref];
		if(!o){
			o = this.obj_constructor('', [attr, this, do_after_create === false]);
      const after_create_res = do_after_create === false ? false : o.after_create();
      if(o instanceof DocObj && o.date == utils$1.blank.date){
        o.date = new Date();
      }
      if(force_obj){
        return o;
      }
      let call_new_number_doc;
      if((this instanceof DocManager || this instanceof TaskManager || this instanceof BusinessProcessManager)){
        call_new_number_doc = !o.number_doc;
      }
      else {
        call_new_number_doc = !o.id;
      }
      return (call_new_number_doc ? o.new_number_doc() : Promise.resolve(o))
        .then(() => {
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
	find(val, columns){
		return utils$1._find(this.by_ref, val, columns);
	}
	load_array(aattr, forse){
		const res = [];
    const {wsql} = this._owner.$p;
    const {grouping, tabular_sections} = this.metadata();
		for(const attr of aattr){
		  if(grouping === 'array' && attr.ref.length <= 3) {
		    res.push.apply(res, this.load_array(attr.rows, forse));
		    continue;
      }
			let obj = this.by_ref[utils$1.fix_guid(attr)];
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
	first_folder(owner){
		for(let i in this.by_ref){
			const o = this.by_ref[i];
			if(o.is_folder && (!owner || utils$1.is_equal(owner, o.owner))) return o;
		}
		return this.get();
	}
	get_sql_struct(attr){
		const {sql_mask, sql_type} = this._owner.$p.md;
		var t = this,
			cmd = t.metadata(),
			res = {}, f, f0, trunc_index = 0,
			action = attr && attr.action ? attr.action : "create_table";
		function sql_selection(){
			let ignore_parent = !attr.parent,
				parent = attr.parent || utils$1.blank.guid,
				owner,
				initial_value = attr.initial_value || utils$1.blank.guid,
				filter = attr.filter || "",
				set_parent = utils$1.blank.guid;
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
				else {
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
							(owner == utils$1.blank.guid ? 1 : 0) + " OR _t_.owner = '" + owner + "') AND (" + (filter ? 0 : 1);
					else
						s = " WHERE (" + (ignore_parent || filter ? 1 : 0) + " OR _t_.parent = '" + parent + "') AND (" + (filter ? 0 : 1);
				}
				else {
					if(cmd.has_owners)
						s = " WHERE (" + (owner == utils$1.blank.guid ? 1 : 0) + " OR _t_.owner = '" + owner + "') AND (" + (filter ? 0 : 1);
					else
						s = " WHERE (" + (filter ? 0 : 1);
				}
				if(t.sql_selection_where_flds){
					s += t.sql_selection_where_flds(filter);
				}
				else if(t instanceof DocManager){
          s += " OR _t_.number_doc LIKE '" + filter + "'";
        }
				else {
					if(cmd["main_presentation_name"] || t instanceof ChartOfAccountManager)
						s += " OR _t_.name LIKE '" + filter + "'";
					if(cmd["code_length"])
						s += " OR _t_.id LIKE '" + filter + "'";
				}
				s += ") AND (_t_.ref != '" + utils$1.blank.guid + "')";
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
                if(utils$1.is_data_obj(sel[key]) || utils$1.is_guid(sel[key])){
                  s += and + "(_t_." + key + " = '" + sel[key] + "') ";
                }
                else {
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
                  else {
                    s += and + "(_t_." + key + " = '" + val + "') ";
                  }
                }
              }else if(typeof sel[key] === string)
                s += and + "(_t_." + key + " = '" + sel[key] + "') ";
              else
                s += and + "(_t_." + key + " = " + sel[key] + ") ";
            }
            else if(key=="is_folder" && cmd.hierarchical && cmd.group_hierarchy);
          }
        };
				if(attr.selection){
					if(typeof attr.selection === "function"){
            attr.selection(s);
					}
					else {
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
				function on_parent(o){
					if(o){
						set_parent = (attr.set_parent = o.parent.ref);
						parent = set_parent;
						ignore_parent = false;
					}
					if(filter && filter.indexOf("%") == -1)
						filter = "%" + filter + "%";
				}
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
						owner = utils$1.blank.guid;
				}
				if(initial_value !=  utils$1.blank.guid && ignore_parent){
					if(cmd["hierarchical"]){
						on_parent(t.get(initial_value));
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
				else {
					if(cmd.code_length)
						sql += ", id character("+cmd.code_length+")";
					sql += ", name character varying(50), is_folder boolean";
				}
				for(f in cmd.fields){
					if(f.length > 30){
						if(cmd.fields[f].short_name)
							f0 = cmd.fields[f].short_name;
						else {
							trunc_index++;
							f0 = f[0] + trunc_index + f.substr(f.length-27);
						}
					}else
						f0 = f;
					sql += ", " + f0 + sql_type(t, f, cmd.fields[f].type, true);
				}
				for(f in cmd["tabular_sections"])
					sql += ", " + "ts_" + f + " JSON";
			}else {
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
  get_attachment(ref, att_id) {
    const {adapter} = this;
    return adapter.get_attachment ? adapter.get_attachment(this, ref, att_id) : Promise.reject();
  }
  save_attachment(ref, att_id, attachment, type) {
    const {adapter} = this;
    return adapter.save_attachment ? adapter.save_attachment(this, ref, att_id, attachment, type) : Promise.reject();
  }
  delete_attachment(ref, att_id) {
    const {adapter} = this;
    return adapter.delete_attachment ? adapter.delete_attachment(this, ref, att_id) : Promise.reject();
  }
  broken_links() {
    const res = [];
    const push = res.push.bind(res);
    for(const ref in this.by_ref) {
      this.by_ref[ref].broken_links().forEach(push);
    }
    return res;
  }
}
class DataProcessorsManager extends DataManager{
	create(attr = {}, loading){
		return this.obj_constructor('', [attr, this, loading]);
	}
	get(ref){
		if(ref){
			if(!this.by_ref[ref]){
				this.by_ref[ref] = this.create();
			}
			return this.by_ref[ref];
		}else
			return this.create();
	}
	unload_obj() {	}
}
class EnumManager extends RefDataManager{
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
		else if(!ref || ref == utils$1.blank.guid){
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
			if(v.ref && v.ref != "_" && v.ref != utils$1.blank.guid)
				fn.call(this[v.ref]);
		});
	}
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
	get_option_list(selection = {}, val){
		let l = [], synonym = "", sref;
    function push(v){
      if(selection._dhtmlx){
        v = {
          text: v.presentation,
          value: v.ref
        };
        if(utils$1.is_equal(v.value, val)){
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
				}else {
					if(sref.name != v.ref && sref.ref != v.ref && sref != v.ref)
						return;
				}
			}
			push(this[v.ref]);
		});
		return Promise.resolve(l);
	}
}
class RegisterManager extends DataManager{
	push(o, new_ref) {
		if (new_ref && (new_ref != o.ref)) {
			delete this.by_ref[o.ref];
			this.by_ref[new_ref] = o;
		} else
			this.by_ref[o.ref] = o;
	}
	get(attr, return_row) {
		if (!attr)
			attr = {};
		else if (typeof attr == string)
			attr = {ref: attr};
		if (attr.ref && return_row)
			return this.by_ref[attr.ref];
		attr.action = "select";
		this._owner.$p.wsql;
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
				if(attr.selection){
					if(typeof attr.selection == "function");
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
                    if(utils$1.is_data_obj(sel[key])) {
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
								} else if(key=="is_folder" && cmd.hierarchical && cmd.group_hierarchy);
							}
						});
				}
				return s;
			}
			function order_flds(){
				return "";
			}
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
			}else {
				sql += "`"+t.table_name+"` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN";
				for(f in cmd.dimensions)
					sql += sql_mask(f) + sql_type(t, f, cmd.dimensions[f].type);
				for(f in cmd.resources)
					sql += sql_mask(f) + sql_type(t, f, cmd.resources[f].type);
				for(f in cmd.attributes)
					sql += sql_mask(f) + sql_type(t, f, cmd.attributes[f].type);
			}
			sql += ")";
			return sql;
		}
		function sql_update(){
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
				key += utils$1.fix_guid(attr[j]);
			else if(!attr[j] && dimensions[j].type.digits)
				key += "0";
			else if(dimensions[j].date_part)
				key += moment(attr[j] || utils$1.blank.date).format(moment.defaultFormatUtc);
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
  each(fn) {
    for (const i in this.by_ref) {
      if(fn.call(this, this.by_ref[i]) === true) {
        break;
      }
    }
  }
}
class InfoRegManager extends RegisterManager{
	slice_first(filter){
	}
	slice_last(filter){
	}
}
class AccumRegManager extends RegisterManager{
}
class CatManager extends RefDataManager{
	constructor(owner, class_name) {
		super(owner, class_name);
		const _meta = this.metadata() || {};
		if (_meta.hierarchical && _meta.group_hierarchy) {
			Object.defineProperty(this.obj_constructor('', true).prototype, 'is_folder', {
				get(){ return this._obj.is_folder || false},
				set(v){ this._obj.is_folder = utils$1.fix_boolean(v);},
				enumerable: true,
				configurable: true
			});
		}
	}
	by_name(name) {
		let o;
		this.find_rows({name}, obj => {
			o = obj;
			return false;
		});
		return o || this.get();
	}
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
class ChartOfCharacteristicManager extends CatManager{
}
class ChartOfAccountManager extends CatManager{
}
class DocManager extends RefDataManager{
}
class TaskManager extends CatManager{
}
class BusinessProcessManager extends CatManager{
}

var data_managers = /*#__PURE__*/Object.freeze({
	__proto__: null,
	AccumRegManager: AccumRegManager,
	BusinessProcessManager: BusinessProcessManager,
	CatManager: CatManager,
	ChartOfAccountManager: ChartOfAccountManager,
	ChartOfCharacteristicManager: ChartOfCharacteristicManager,
	DataManager: DataManager,
	DataProcessorsManager: DataProcessorsManager,
	DocManager: DocManager,
	EnumManager: EnumManager,
	InfoRegManager: InfoRegManager,
	RefDataManager: RefDataManager,
	RegisterManager: RegisterManager,
	TaskManager: TaskManager
});

const {v1: uuidv1} = require('uuid');
const moment$1 = require('moment');
require('moment/locale/ru');
moment$1.locale('ru');
moment$1._masks = {
	date: 'DD.MM.YY',
	date_time: 'DD.MM.YYYY HH:mm',
	ldt: 'DD MMM YYYY, HH:mm',
	iso: 'YYYY-MM-DDTHH:mm:ss',
};
if(typeof global != 'undefined'){
  global.moment = moment$1;
}
const ctnames = '$eq,between,$between,$gte,gte,$gt,gt,$lte,lte,$lt,lt,ninh,inh,nin,$nin,in,$in,not,ne,$ne,nlk,lke,like,or,$or,$and'.split(',');
Date.prototype.toJSON = function () {return moment$1(this).format(moment$1._masks.iso)};
if (!Number.prototype.round) {
	Number.prototype.round = function (places) {
		const multiplier = Math.pow(10, places || 0);
		return (Math.round(this * multiplier) / multiplier);
	};
}
if (!Number.prototype.pad) {
	Number.prototype.pad = function (size) {
		let s = String(this);
		while (s.length < (size || 2)) {
			s = '0' + s;
		}
		return s;
	};
}
if (!Object.prototype._clone) {
	Object.defineProperty(Object.prototype, '_clone', {
		value() {
			return utils._clone(this);
		},
    configurable: true,
    writable: true,
	});
}
if (!Object.prototype._mixin) {
	Object.defineProperty(Object.prototype, '_mixin', {
		value: function (src, include, exclude) {
			return utils._mixin(this, src, include, exclude);
		},
	});
}
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
const utils = {
	moment: moment$1,
  rnd: {
    crypto: typeof crypto !== 'undefined' ? crypto : require('crypto'),
    rnds16: new Uint16Array(32),
    counter: 0,
    rngs() {
      const {rnds16, crypto} = this;
      return crypto.getRandomValues ? crypto.getRandomValues(rnds16) : crypto.randomFillSync(rnds16);
    },
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
  deflate: {
    base64ToBufferAsync(base64) {
      const dataUrl = 'data:application/octet-binary;base64,' + base64;
      return fetch(dataUrl)
        .then(res => res.arrayBuffer())
        .then(buffer => new Uint8Array(buffer));
    },
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
  debounce(func, wait = 166) {
    let timeout;
    function debounced(...args) {
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
	fix_date(str, strict) {
		if (str instanceof Date || (!strict && (this.is_guid(str) || (str && (str.length === 11 || str.length === 9))))){
      return str;
    }
		else {
			const m = moment$1(str, date_frmts);
			return m.isValid() ? m.toDate() : (strict ? this.blank.date : str);
		}
	},
	fix_guid(ref, generate) {
		if (ref && typeof ref == 'string') ;
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
	fix_boolean(str) {
		if (typeof str === 'string') {
			return !(!str || str.toLowerCase() === 'false');
		}
		return !!str;
	},
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
	generate_guid() {
		return uuidv1();
	},
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
	is_empty_guid(v) {
		return !v || v === this.blank.guid;
	},
	is_data_obj(v) {
		return v instanceof DataObj;
	},
  is_doc_obj(v) {
    return v instanceof DocObj;
  },
	is_data_mgr(v) {
		return v instanceof DataManager;
	},
  is_enm_mgr(v) {
    return v instanceof EnumManager;
  },
  is_tabular(v) {
    return v instanceof TabularSectionRow || v instanceof TabularSection || v?._row instanceof TabularSectionRow;
  },
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
  equals(v1, v2) {
    if(Array.isArray(v1) && Array.isArray(v2)) {
      return v1.length === v2.length && v1.every((elm1, index) => this.equals(elm1, v2[index]));
    }
    if(typeof v1 !== 'object' || typeof v2 !== 'object') {
      return false;
    }
    return Object.keys(v1).every((key) => v1[key] === v2[key]);
  },
  snake_ref(ref) {
    return '_' + ref.replace(/-/g, '_');
  },
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
	get_and_save_blob(url, post_data, file_name) {
		return this.post_ex(url,
			typeof post_data == 'object' ? JSON.stringify(post_data) : post_data, true, function (xhr) {
				xhr.responseType = 'blob';
			})
			.then(function (req) {
				saveAs(req.response, file_name);
			});
	},
  sleep(time = 100, res) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(res), time);
    });
  },
	_mixin(obj, src, include, exclude, clone) {
		const tobj = {};
		function exclude_cpy(f) {
			if (!(exclude && exclude.includes(f))) {
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
	_find(src, val, columns) {
		if (typeof val != 'object') {
			for (let i in src) {
				const o = src[i];
				for (let j in o) {
					if (typeof o[j] !== 'function' && utils.is_equal(o[j], val)) {
						return o;
					}
				}
			}
		} else {
			for (let i in src) {
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
  _like(left, right) {
    return left && left.toString().toLowerCase().includes(right.toLowerCase());
  },
	_selection(o, selection) {
		let ok = true;
		if (selection) {
			if (typeof selection == 'function') {
				ok = selection.call(this, o);
			}
			else {
				for (let j in selection) {
					const sel = selection[j];
					const is_obj = sel && typeof(sel) === 'object';
					if (j.substring(0, 1) == '_') {
            if(j === '_search' && sel.fields && sel.value) {
              ok = sel.value.every((str) => sel.fields.some((fld) => utils._like(o[fld], str)));
              if(!ok) {
                break;
              }
            }
						continue;
					}
					if (typeof sel == 'function') {
						ok = sel.call(this, o, j);
            if(!ok) {
              break;
            }
            continue;
          }
					if (Array.isArray(sel)) {
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
					  else {
              ok = sel.every((el) => utils._selection(o, {[j]: el}));
            }
            if(!ok) {
              break;
            }
            continue;
          }
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
          else if(['like','lke'].includes(ctname)) {
						if (!utils._like(o[j], sel[ctname])) {
							ok = false;
							break;
						}
					}
          else if(ctname === 'nlk') {
            if (utils._like(o[j], sel[ctname])) {
              ok = false;
              break;
            }
          }
          else if(['not', 'ne', '$ne'].includes(ctname)) {
						if (utils.is_equal(o[j], sel[ctname])) {
							ok = false;
							break;
						}
					}
          else if(['in', '$in'].includes(ctname)) {
						ok = sel[ctname].some((el) => utils.is_equal(el, o[j]));
            if(!ok) {
              break;
            }
          }
          else if(['nin', '$nin'].includes(ctname)) {
            ok = sel[ctname].every((el) => !utils.is_equal(el, o[j]));
            if(!ok) {
              break;
            }
          }
          else if(ctname === 'inh') {
            const tmp = utils.is_data_obj(o) ? o : (this.get && this.get(o)) || o;
            ok = j === 'ref' ? tmp._hierarchy && tmp._hierarchy(sel.inh) : tmp[j]._hierarchy && tmp[j]._hierarchy(sel.inh);
            if(!ok) {
              break;
            }
          }
          else if(ctname === 'ninh') {
            const tmp = utils.is_data_obj(o) ? o : (this.get && this.get(o)) || o;
            ok = !(j === 'ref' ? tmp._hierarchy && tmp._hierarchy(sel.ninh) : tmp[j]._hierarchy && tmp[j]._hierarchy(sel.ninh));
            if(!ok) {
              break;
            }
          }
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
    for (const o of src) {
      if (utils._selection.call(this, o, selection)) {
        pre.push(o);
      }
    }
    if(sort && sort.length && typeof alasql !== 'undefined') {
      pre = alasql(`select * from ? order by ${sort.map(({field, direction}) => `${field} ${direction}`).join(',')}`, [pre]);
    }
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
  crc32(str) {
    const {crcTable} = this;
    let crc = 0 ^ (-1);
    for (let i = 0; i < str.length; i++ ) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
    }
    return (crc ^ (-1)) >>> 0;
  },
};
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
var utils$1 = utils;

function Aes(default_key) {
	var Aes = this;
	Aes.cipher = function(input, w) {
		var Nb = 4;
		var Nr = w.length/Nb - 1;
		var state = [[],[],[],[]];
		for (var i=0; i<4*Nb; i++) state[i%4][Math.floor(i/4)] = input[i];
		state = Aes.addRoundKey(state, w, 0, Nb);
		for (var round=1; round<Nr; round++) {
			state = Aes.subBytes(state, Nb);
			state = Aes.shiftRows(state, Nb);
			state = Aes.mixColumns(state, Nb);
			state = Aes.addRoundKey(state, w, round, Nb);
		}
		state = Aes.subBytes(state, Nb);
		state = Aes.shiftRows(state, Nb);
		state = Aes.addRoundKey(state, w, Nr, Nb);
		var output = new Array(4*Nb);
		for (var i=0; i<4*Nb; i++) output[i] = state[i%4][Math.floor(i/4)];
		return output;
	};
	Aes.keyExpansion = function(key) {
		var Nb = 4;
		var Nk = key.length/4;
		var Nr = Nk + 6;
		var w = new Array(Nb*(Nr+1));
		var temp = new Array(4);
		for (var i=0; i<Nk; i++) {
			var r = [key[4*i], key[4*i+1], key[4*i+2], key[4*i+3]];
			w[i] = r;
		}
		for (var i=Nk; i<(Nb*(Nr+1)); i++) {
			w[i] = new Array(4);
			for (var t=0; t<4; t++) temp[t] = w[i-1][t];
			if (i % Nk == 0) {
				temp = Aes.subWord(Aes.rotWord(temp));
				for (var t=0; t<4; t++) temp[t] ^= Aes.rCon[i/Nk][t];
			}
			else if (Nk > 6 && i%Nk == 4) {
				temp = Aes.subWord(temp);
			}
			for (var t=0; t<4; t++) w[i][t] = w[i-Nk][t] ^ temp[t];
		}
		return w;
	};
	Aes.subBytes = function(s, Nb) {
		for (var r=0; r<4; r++) {
			for (var c=0; c<Nb; c++) s[r][c] = Aes.sBox[s[r][c]];
		}
		return s;
	};
	Aes.shiftRows = function(s, Nb) {
		var t = new Array(4);
		for (var r=1; r<4; r++) {
			for (var c=0; c<4; c++) t[c] = s[r][(c+r)%Nb];
			for (var c=0; c<4; c++) s[r][c] = t[c];
		}
		return s;
	};
	Aes.mixColumns = function(s, Nb) {
		for (var c=0; c<4; c++) {
			var a = new Array(4);
			var b = new Array(4);
			for (var i=0; i<4; i++) {
				a[i] = s[i][c];
				b[i] = s[i][c]&0x80 ? s[i][c]<<1 ^ 0x011b : s[i][c]<<1;
			}
			s[0][c] = b[0] ^ a[1] ^ b[1] ^ a[2] ^ a[3];
			s[1][c] = a[0] ^ b[1] ^ a[2] ^ b[2] ^ a[3];
			s[2][c] = a[0] ^ a[1] ^ b[2] ^ a[3] ^ b[3];
			s[3][c] = a[0] ^ b[0] ^ a[1] ^ a[2] ^ b[3];
		}
		return s;
	};
	Aes.addRoundKey = function(state, w, rnd, Nb) {
		for (var r=0; r<4; r++) {
			for (var c=0; c<Nb; c++) state[r][c] ^= w[rnd*4+c][r];
		}
		return state;
	};
	Aes.subWord = function(w) {
		for (var i=0; i<4; i++) w[i] = Aes.sBox[w[i]];
		return w;
	};
	Aes.rotWord = function(w) {
		var tmp = w[0];
		for (var i=0; i<3; i++) w[i] = w[i+1];
		w[3] = tmp;
		return w;
	};
	Aes.sBox =  [0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,
		0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0,
		0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15,
		0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75,
		0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84,
		0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf,
		0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8,
		0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2,
		0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73,
		0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb,
		0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79,
		0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08,
		0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a,
		0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e,
		0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf,
		0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16];
	Aes.rCon = [ [0x00, 0x00, 0x00, 0x00],
		[0x01, 0x00, 0x00, 0x00],
		[0x02, 0x00, 0x00, 0x00],
		[0x04, 0x00, 0x00, 0x00],
		[0x08, 0x00, 0x00, 0x00],
		[0x10, 0x00, 0x00, 0x00],
		[0x20, 0x00, 0x00, 0x00],
		[0x40, 0x00, 0x00, 0x00],
		[0x80, 0x00, 0x00, 0x00],
		[0x1b, 0x00, 0x00, 0x00],
		[0x36, 0x00, 0x00, 0x00] ];
	Aes.Ctr = {};
	Aes.Ctr.encrypt = function(plaintext, password, nBits) {
		var blockSize = 16;
		if (!(nBits==128 || nBits==192 || nBits==256))
			nBits = 128;
		plaintext = utf8Encode(plaintext);
		password = utf8Encode(password || default_key);
		var nBytes = nBits/8;
		var pwBytes = new Array(nBytes);
		for (var i=0; i<nBytes; i++) {
			pwBytes[i] = i<password.length ?  password.charCodeAt(i) : 0;
		}
		var key = Aes.cipher(pwBytes, Aes.keyExpansion(pwBytes));
		key = key.concat(key.slice(0, nBytes-16));
		var counterBlock = new Array(blockSize);
		var nonce = (new Date()).getTime();
		var nonceMs = nonce%1000;
		var nonceSec = Math.floor(nonce/1000);
		var nonceRnd = Math.floor(Math.random()*0xffff);
		for (var i=0; i<2; i++) counterBlock[i]   = (nonceMs  >>> i*8) & 0xff;
		for (var i=0; i<2; i++) counterBlock[i+2] = (nonceRnd >>> i*8) & 0xff;
		for (var i=0; i<4; i++) counterBlock[i+4] = (nonceSec >>> i*8) & 0xff;
		var ctrTxt = '';
		for (var i=0; i<8; i++) ctrTxt += String.fromCharCode(counterBlock[i]);
		var keySchedule = Aes.keyExpansion(key);
		var blockCount = Math.ceil(plaintext.length/blockSize);
		var ciphertext = '';
		for (var b=0; b<blockCount; b++) {
			for (var c=0; c<4; c++) counterBlock[15-c] = (b >>> c*8) & 0xff;
			for (var c=0; c<4; c++) counterBlock[15-c-4] = (b/0x100000000 >>> c*8);
			var cipherCntr = Aes.cipher(counterBlock, keySchedule);
			var blockLength = b<blockCount-1 ? blockSize : (plaintext.length-1)%blockSize+1;
			var cipherChar = new Array(blockLength);
			for (var i=0; i<blockLength; i++) {
				cipherChar[i] = cipherCntr[i] ^ plaintext.charCodeAt(b*blockSize+i);
				cipherChar[i] = String.fromCharCode(cipherChar[i]);
			}
			ciphertext += cipherChar.join('');
			if (typeof WorkerGlobalScope != 'undefined' && self instanceof WorkerGlobalScope) {
				if (b%1000 == 0) self.postMessage({ progress: b/blockCount });
			}
		}
		ciphertext =  base64Encode(ctrTxt+ciphertext);
		return ciphertext;
	};
	Aes.Ctr.decrypt = function(ciphertext, password, nBits) {
		var blockSize = 16;
		if (!(nBits==128 || nBits==192 || nBits==256))
			nBits = 128;
		ciphertext = base64Decode(ciphertext);
		password = utf8Encode(password || default_key);
		var nBytes = nBits/8;
		var pwBytes = new Array(nBytes);
		for (var i=0; i<nBytes; i++) {
			pwBytes[i] = i<password.length ?  password.charCodeAt(i) : 0;
		}
		var key = Aes.cipher(pwBytes, Aes.keyExpansion(pwBytes));
		key = key.concat(key.slice(0, nBytes-16));
		var counterBlock = new Array(8);
		var ctrTxt = ciphertext.slice(0, 8);
		for (var i=0; i<8; i++) counterBlock[i] = ctrTxt.charCodeAt(i);
		var keySchedule = Aes.keyExpansion(key);
		var nBlocks = Math.ceil((ciphertext.length-8) / blockSize);
		var ct = new Array(nBlocks);
		for (var b=0; b<nBlocks; b++) ct[b] = ciphertext.slice(8+b*blockSize, 8+b*blockSize+blockSize);
		ciphertext = ct;
		var plaintext = '';
		for (var b=0; b<nBlocks; b++) {
			for (var c=0; c<4; c++) counterBlock[15-c] = ((b) >>> c*8) & 0xff;
			for (var c=0; c<4; c++) counterBlock[15-c-4] = (((b+1)/0x100000000-1) >>> c*8) & 0xff;
			var cipherCntr = Aes.cipher(counterBlock, keySchedule);
			var plaintxtByte = new Array(ciphertext[b].length);
			for (var i=0; i<ciphertext[b].length; i++) {
				plaintxtByte[i] = cipherCntr[i] ^ ciphertext[b].charCodeAt(i);
				plaintxtByte[i] = String.fromCharCode(plaintxtByte[i]);
			}
			plaintext += plaintxtByte.join('');
			if (typeof WorkerGlobalScope != 'undefined' && self instanceof WorkerGlobalScope) {
				if (b%1000 == 0) self.postMessage({ progress: b/nBlocks });
			}
		}
		plaintext = utf8Decode(plaintext);
		return plaintext;
	};
	function utf8Encode(str) {
		return encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
			return String.fromCharCode('0x' + p1);
		});
	}
	function utf8Decode(str) {
		try {
			return decodeURIComponent( escape( str ) );
		} catch (e) {
			return str;
		}
	}
	function base64Encode(str) {
		if (typeof btoa != 'undefined') return btoa(str);
		if (typeof Buffer != 'undefined') return new Buffer(str, 'binary').toString('base64');
		throw new Error('No Base64 Encode');
	}
	function base64Decode(str) {
		if (typeof atob != 'undefined') return atob(str);
		if (typeof Buffer != 'undefined') return new Buffer(str, 'base64').toString('binary');
		throw new Error('No Base64 Decode');
	}
}

class JobPrm {
	constructor($p) {
		this.$p = $p;
		this.local_storage_prefix = '';
		this.create_tables = true;
	}
	init(settings) {
		if (typeof settings == 'function')
			settings(this);
	}
	base_url() {
		return this.$p.wsql.get_user_param('rest_path') || this.rest_path || '/a/zd/%1/odata/standard.odata/';
	}
	rest_url() {
		const url = this.base_url();
		const zone = this.$p.wsql.get_user_param('zone', this.zone_is_string ? 'string' : 'number');
		return zone ? url.replace('%1', zone) : url.replace('%1/', '');
	}
	irest_url() {
		const url = this.base_url().replace('odata/standard.odata', 'hs/rest');
		const zone = this.$p.wsql.get_user_param('zone', this.zone_is_string ? 'string' : 'number');
		return zone ? url.replace('%1', zone) : url.replace('%1/', '');
	}
	ajax_attr(attr, url) {
		if (!attr.url)
			attr.url = url;
		if (!attr.username)
			attr.username = this.username;
		if (!attr.password)
			attr.password = this.password;
		attr.hide_headers = true;
	}
}

const alasql$1 = (typeof window != 'undefined' && window.alasql) || require('alasql/dist/alasql.min');
if(typeof window != 'undefined' && !window.alasql){
  window.alasql = alasql$1;
}
const fake_ls = {
	setItem(name, value) {},
	getItem(name) {}
};
class WSQL {
	constructor($p) {
		this.$p = $p;
		this._params = {};
		this.aladb = new alasql$1.Database('md');
		this.alasql = alasql$1;
	}
	get js_time_diff(){ return -(new Date("0001-01-01")).valueOf()}
	get time_diff(){
		var diff = this.get_user_param("time_diff", "number");
		return (!diff || isNaN(diff) || diff < 62135571600000 || diff > 62135622000000) ? this.js_time_diff : diff;
	}
	get _ls() {
		return typeof localStorage === "undefined" ? fake_ls : localStorage;
	}
	init(settings, meta) {
		alasql$1.utils.isBrowserify = false;
		const {job_prm, adapters} = this.$p;
		job_prm.init(settings);
		if (!job_prm.local_storage_prefix){
      throw new Error('local_storage_prefix unset in job_prm settings');
    }
    const nesessery_params = [
      {p: 'user_name', v: '', t: 'string'},
      {p: 'user_pwd', v: '', t: 'string'},
      {p: 'browser_uid', v: utils$1.generate_guid(), t: 'string'},
      {p: 'zone', v: job_prm.hasOwnProperty('zone') ? job_prm.zone : 1, t: job_prm.zone_is_string ? 'string' : 'number'},
      {p: 'rest_path', v: '', t: 'string'},
      {p: 'couch_path', v: '', t: 'string'},
      {p: 'couch_direct', v: true, t: 'boolean'},
      {p: 'enable_save_pwd', v: true, t: 'boolean'},
      {p: 'use_ram', v: job_prm.hasOwnProperty('use_ram') ? job_prm.use_ram : true, t: 'boolean', ls: true},
    ];
		Array.isArray(job_prm.additional_params) && job_prm.additional_params.forEach((v) => nesessery_params.push(v));
    let zone;
    if(!this._ls.getItem(job_prm.local_storage_prefix + 'zone')) {
      zone = job_prm.hasOwnProperty('zone') ? job_prm.zone : 1;
    }
    if(zone !== undefined) {
      this.set_user_param('zone', zone);
    }
    if(zone == job_prm.zone_demo){
      nesessery_params.some((prm) => {
        if(prm.p == 'couch_direct'){
          prm.v = false;
          return true;
        }
      });
    }
		nesessery_params.forEach((prm) => {
		  if(job_prm.url_prm && job_prm.url_prm.hasOwnProperty(prm.p)) {
        this.set_user_param(prm.p, this.fetch_type(job_prm.url_prm[prm.p], prm.t));
      }
		  else if (prm.ls && this.prm_is_set(prm.p)){
		    const v = this.get_user_param(prm.p, prm.t);
		    if(job_prm[prm.p] != v) {
          job_prm[prm.p] = v;
        }
		  }
      else if (!this.prm_is_set(prm.p)){
		    this.set_user_param(prm.p, this.fetch_type(job_prm.hasOwnProperty(prm.p) ? job_prm[prm.p] : prm.v, prm.t));
		  }
		});
    if(typeof sessionStorage === 'object' && !sessionStorage.key('zone')) {
      sessionStorage.setItem('zone', this.get_user_param('zone'));
      sessionStorage.setItem('branch', '');
      sessionStorage.setItem('impersonation', '');
      sessionStorage.setItem('year', '');
    }
    if(meta) {
      meta(this.$p);
      for(let i in adapters){
        adapters[i].init(this, job_prm);
      }
    }
	};
  save_options(prefix, options) {
    return this.set_user_param(prefix + '_' + options.name, options);
  }
  set_user_param(prm_name, prm_value) {
    const {$p, _params, _ls} = this;
    if(typeof prm_value == 'object') {
      _params[prm_name] = prm_value;
      prm_value = JSON.stringify(prm_value);
    }
    else if(prm_value === false || prm_value === 'false') {
      this._params[prm_name] = false;
      prm_value = '';
    }
    else {
      _params[prm_name] = prm_value;
    }
    _ls.setItem($p.job_prm.local_storage_prefix + prm_name, prm_value);
  }
	get_user_param(prm_name, type){
		const {$p, _params, _ls} = this;
		if(!_params.hasOwnProperty(prm_name) && _ls){
			_params[prm_name] = this.fetch_type(_ls.getItem($p.job_prm.local_storage_prefix+prm_name), type);
		}
		return this._params[prm_name];
	}
	prm_is_set(prm_name) {
		const {$p, _params, _ls} = this;
		return _params.hasOwnProperty(prm_name) || (_ls && _ls.hasOwnProperty($p.job_prm.local_storage_prefix+prm_name))
	}
	restore_options(prefix, options){
		const options_saved = this.get_user_param(prefix + "_" + options.name, "object");
		for(let i in options_saved){
			if(typeof options_saved[i] != "object"){
				options[i] = options_saved[i];
			}
			else {
				if(!options[i]){
					options[i] = {};
				}
				for(let j in options_saved[i]){
					options[i][j] = options_saved[i][j];
				}
			}
		}
		return options;
	}
	fetch_type(prm, type){
		if(type == "object"){
			try{
				prm = JSON.parse(prm);
			}catch(e){
				prm = {};
			}
			return prm;
		}
		else if(type == "number"){
			return utils$1.fix_number(prm, true);
		}
		else if(type == "date"){
			return utils$1.fix_date(prm, true);
		}
		else if(type == "boolean"){
			return utils$1.fix_boolean(prm);
		}
    else if(type == "string"){
      return prm ? prm.toString() : '';
    }
		return prm;
	}
}

class MetaObj {
}
class MetaField {
}
class Meta extends MetaEventEmitter {
  constructor($p) {
    super();
    Object.defineProperties(this, {
      _m: {value: {}},
      $p: {get() {return $p}},
    });
    Meta._sys.forEach((patch) => utils$1._patch(this._m, patch));
    Meta._sys.length = 0;
  }
  init(patch) {
    return utils$1._patch(this._m, patch);
  }
  get(type, field_name) {
    const np = type instanceof DataManager ? [type._owner.name, type.name] : type.split('.');
    const np0 = this._m[np[0]];
    if(!np0) {
      return;
    }
    const _meta = np0[np[1]];
    if(!field_name) {
      return _meta;
    }
    else if(_meta && _meta.fields[field_name]) {
      return _meta.fields[field_name];
    }
    else if(_meta && _meta.tabular_sections && _meta.tabular_sections[field_name]) {
      return _meta.tabular_sections[field_name];
    }
    const res = {
        multiline_mode: false,
        note: '',
        synonym: '',
        tooltip: '',
        type: {
          is_ref: false,
          types: ['string'],
        },
      },
      is_doc = 'doc,tsk,bp'.includes(np[0]),
      is_cat = 'cat,cch,cacc,tsk'.includes(np[0]);
    if(is_doc && field_name == 'number_doc' && _meta.code_length) {
      res.synonym = 'Номер';
      res.tooltip = 'Номер документа';
      res.type.str_len = 11;
    }
    else if(is_doc && field_name == 'date') {
      res.synonym = 'Дата';
      res.tooltip = 'Дата документа';
      res.type.date_part = 'date_time';
      res.type.types[0] = 'date';
    }
    else if(is_doc && field_name == 'posted') {
      res.synonym = 'Проведен';
      res.type.types[0] = 'boolean';
    }
    else if(is_cat && field_name == 'id' && _meta.code_length) {
      res.synonym = 'Код';
      res.mandatory = true;
    }
    else if(is_cat && field_name == 'name') {
      res.synonym = 'Наименование';
      res.mandatory = _meta.main_presentation_name;
    }
    else if(field_name == '_area') {
      res.synonym = 'Область';
    }
    else if(field_name == 'presentation') {
      res.synonym = 'Представление';
    }
    else if(field_name == '_deleted') {
      res.synonym = 'Пометка удаления';
      res.type.types[0] = 'boolean';
    }
    else if(field_name == 'is_folder') {
      res.synonym = 'Это группа';
      res.type.types[0] = 'boolean';
    }
    else if(field_name == 'ref') {
      res.synonym = 'Ссылка';
      res.type.is_ref = true;
      if(type instanceof DataManager) {
        res.type._mgr = type;
        res.type.types[0] = `${type._owner.name}.${type.name}`;
      }
      else {
        res.type.types[0] = type;
      }
    }
    else {
      return;
    }
    return res;
  }
  classes() {
    const res = {};
    for (const i in this._m) {
      res[i] = [];
      for (const j in this._m[i])
        res[i].push(j);
    }
    return res;
  }
  bases() {
    const res = {};
    const {_m} = this;
    for (let i in _m) {
      for (let j in _m[i]) {
        if(_m[i][j].cachable) {
          let _name = _m[i][j].cachable.replace('_remote', '').replace('_ram', '').replace('_doc', '');
          if(_name != 'meta' && _name != 'templates' && _name != 'e1cib' && !res[_name]) {
            res[_name] = _name;
          }
        }
      }
    }
    return Object.keys(res);
  }
  syns_js(v) {
    const synJS = {
      DeletionMark: '_deleted',
      Description: 'name',
      DataVersion: 'data_version',
      IsFolder: 'is_folder',
      Number: 'number_doc',
      Date: 'date',
      Дата: 'date',
      Posted: 'posted',
      Code: 'id',
      Parent_Key: 'parent',
      Owner_Key: 'owner',
      Owner: 'owner',
      Ref_Key: 'ref',
      Ссылка: 'ref',
      LineNumber: 'row',
    };
    return synJS[v] || this._m.syns_js[this._m.syns_1с.indexOf(v)] || v;
  }
  syns_1с(v) {
    const syn1c = {
      _deleted: 'DeletionMark',
      name: 'Description',
      is_folder: 'IsFolder',
      number_doc: 'Number',
      date: 'Date',
      posted: 'Posted',
      id: 'Code',
      ref: 'Ref_Key',
      parent: 'Parent_Key',
      owner: 'Owner_Key',
      row: 'LineNumber',
    };
    return syn1c[v] || this._m.syns_1с[this._m.syns_js.indexOf(v)] || v;
  }
  printing_plates(pp) {
    if(pp) {
      for (const i in pp.doc) {
        this._m.doc[i].printing_plates = pp.doc[i];
      }
    }
  }
  mgr_by_class_name(class_name) {
    if(class_name) {
      const {$p} = this;
      let np = class_name.split('.');
      if(np[1] && $p[np[0]]) {
        return $p[np[0]][np[1]];
      }
      const pos = class_name.indexOf('_');
      if(pos) {
        np = [class_name.substr(0, pos), class_name.substr(pos + 1)];
        if(np[1] && $p[np[0]]) {
          return $p[np[0]][np[1]];
        }
      }
    }
  }
  create_tables(callback, attr) {
    const {$p} = this;
    const data_names = [];
    const managers = this.classes();
    let cstep = 0, create = (attr && attr.postgres) ? '' : 'USE md; ';
    function on_table_created() {
      cstep--;
      if(cstep == 0) {
        if(callback) {
          callback(create);
        }
        else {
          $p.wsql.alasql.utils.saveFile('create_tables.sql', create);
        }
      }
      else {
        iteration();
      }
    }
    function iteration() {
      const data = data_names[cstep - 1];
      if(data.class[data.name]) {
        create += data.class[data.name].get_sql_struct(attr) + '; ';
      }
      on_table_created();
    }
    for (let mgr of 'enm,cch,cacc,cat,bp,tsk,doc,ireg,areg'.split(',')) {
      for (let class_name in managers[mgr]) {
        data_names.push({'class': $p[mgr], 'name': managers[mgr][class_name]});
      }
    }
    cstep = data_names.length;
    iteration();
  }
  sql_type(mgr, f, mf, pg) {
    var sql;
    if((f == 'type' && mgr.table_name == 'cch_properties') || (f == 'svg' && mgr.table_name == 'cat_production_params')) {
      sql = ' JSON';
    }
    else if(mf.is_ref || mf.types.indexOf('guid') != -1) {
      if(!pg) {
        sql = ' CHAR';
      }
      else if(mf.types.every((v) => v.indexOf('enm.') == 0)) {
        sql = ' character varying(100)';
      }
      else if(!mf.hasOwnProperty('str_len')) {
        sql = ' uuid';
      }
      else {
        sql = ' character varying(' + Math.max(36, mf.str_len) + ')';
      }
    }
    else if(mf.hasOwnProperty('str_len')) {
      sql = pg ? (mf.str_len ? ' character varying(' + mf.str_len + ')' : ' text') : ' CHAR';
    }
    else if(mf.date_part) {
      if(!pg || mf.date_part == 'date') {
        sql = ' Date';
      }
      else if(mf.date_part == 'date_time') {
        sql = ' timestamp with time zone';
      }
      else {
        sql = ' time without time zone';
      }
    }
    else if(mf.hasOwnProperty('digits')) {
      if(mf.fraction == 0) {
        sql = pg ? (mf.digits < 7 ? ' integer' : ' bigint') : ' INT';
      }
      else {
        sql = pg ? (' numeric(' + mf.digits + ',' + mf.fraction + ')') : ' FLOAT';
      }
    }
    else if(mf.types.indexOf('boolean') != -1) {
      sql = ' BOOLEAN';
    }
    else if(mf.types.indexOf('json') != -1) {
      sql = ' JSON';
    }
    else {
      sql = pg ? ' character varying(255)' : ' CHAR';
    }
    return sql;
  }
  sql_mask(f, t) {
    return ', ' + (t ? '_t_.' : '') + ('`' + f + '`');
  }
  ts_captions(class_name, ts_name, source) {
    if(!source) {
      source = {};
    }
    var mts = this.get(class_name).tabular_sections[ts_name],
      mfrm = this.get(class_name).form,
      fields = mts ? mts.fields : {}, mf;
    if(mfrm && mfrm.obj) {
      if(!mfrm.obj.tabular_sections[ts_name]) {
        return;
      }
      utils$1._mixin(source, mfrm.obj.tabular_sections[ts_name]);
    }
    else {
      if(ts_name === 'contact_information') {
        fields = {type: '', kind: '', presentation: ''};
      }
      source.fields = ['row'];
      source.headers = '№';
      source.widths = '40';
      source.min_widths = '';
      source.aligns = '';
      source.sortings = 'na';
      source.types = 'cntr';
      for (var f in fields) {
        mf = mts.fields[f];
        if(!mf.hide) {
          source.fields.push(f);
          source.headers += ',' + (mf.synonym ? mf.synonym.replace(/,/g, ' ') : f);
          source.types += ',' + this.control_by_type(mf.type);
          source.sortings += ',na';
        }
      }
    }
    return true;
  }
  class_name_from_1c(name) {
    var pn = name.split('.');
    if(pn.length == 1) {
      return 'enm.' + name;
    }
    else if(pn[0] == 'Перечисление') {
      name = 'enm.';
    }
    else if(pn[0] == 'Справочник') {
      name = 'cat.';
    }
    else if(pn[0] == 'Документ') {
      name = 'doc.';
    }
    else if(pn[0] == 'РегистрСведений') {
      name = 'ireg.';
    }
    else if(pn[0] == 'РегистрНакопления') {
      name = 'areg.';
    }
    else if(pn[0] == 'РегистрБухгалтерии') {
      name = 'accreg.';
    }
    else if(pn[0] == 'ПланВидовХарактеристик') {
      name = 'cch.';
    }
    else if(pn[0] == 'ПланСчетов') {
      name = 'cacc.';
    }
    else if(pn[0] == 'Обработка') {
      name = 'dp.';
    }
    else if(pn[0] == 'Отчет') {
      name = 'rep.';
    }
    return name + this.syns_js(pn[1]);
  }
  class_name_to_1c(name) {
    var pn = name.split('.');
    if(pn.length == 1) {
      return 'Перечисление.' + name;
    }
    else if(pn[0] == 'enm') {
      name = 'Перечисление.';
    }
    else if(pn[0] == 'cat') {
      name = 'Справочник.';
    }
    else if(pn[0] == 'doc') {
      name = 'Документ.';
    }
    else if(pn[0] == 'ireg') {
      name = 'РегистрСведений.';
    }
    else if(pn[0] == 'areg') {
      name = 'РегистрНакопления.';
    }
    else if(pn[0] == 'accreg') {
      name = 'РегистрБухгалтерии.';
    }
    else if(pn[0] == 'cch') {
      name = 'ПланВидовХарактеристик.';
    }
    else if(pn[0] == 'cacc') {
      name = 'ПланСчетов.';
    }
    else if(pn[0] == 'dp') {
      name = 'Обработка.';
    }
    else if(pn[0] == 'rep') {
      name = 'Отчет.';
    }
    return name + this.syns_1с(pn[1]);
  }
  links({objs, set, excludeTypes = []}) {
    if(!set) {
      set = new Set();
    }
    if(Array.isArray(objs)) {
      objs = new Set(objs);
    }
    for(const o of objs) {
      if(!set.has(o)) {
        set.add(o);
        const tmp = o._links(set, excludeTypes);
        this.links({objs: tmp, set, excludeTypes});
      }
    }
    return set;
  }
}
Meta._sys = [{
  enm: {
    accumulation_record_type: [
      {
        order: 0,
        name: 'debit',
        synonym: 'Приход',
      },
      {
        order: 1,
        name: 'credit',
        synonym: 'Расход',
      },
      {
        tag: 'Вид движения регистра накопления',
        description: 'Системное перечисление',
      },
    ],
  },
  ireg: {
    log: {
      name: 'log',
      note: '',
      synonym: 'Журнал событий',
      dimensions: {
        date: {
          synonym: 'Дата',
          tooltip: 'Время события',
          type: {types: ['number'], digits: 15, fraction: 0},
        },
        sequence: {
          synonym: 'Порядок',
          tooltip: 'Порядок следования',
          type: {types: ['number'], digits: 6, fraction: 0},
        },
      },
      resources: {
        'class': {
          synonym: 'Класс',
          tooltip: 'Класс события',
          type: {types: ['string'], str_len: 100},
        },
        note: {
          synonym: 'Комментарий',
          multiline_mode: true,
          tooltip: 'Текст события',
          type: {types: ['string'], str_len: 0},
        },
        obj: {
          synonym: 'Объект',
          multiline_mode: true,
          tooltip: 'Объект, к которому относится событие',
          type: {types: ['string'], str_len: 0},
        },
        user: {
          synonym: 'Пользователь',
          tooltip: 'Пользователь, в сеансе которого произошло событие',
          type: {types: ['string'], str_len: 100},
        },
      },
    },
    log_view: {
      name: 'log_view',
      note: '',
      synonym: 'Просмотр журнала событий',
      dimensions: {
        key: {
          synonym: 'Ключ',
          tooltip: 'Ключ события',
          type: {types: ['string'], str_len: 100},
        },
        user: {
          synonym: 'Пользователь',
          tooltip: 'Пользователь, отметивыший событие, как просмотренное',
          type: {types: ['string'], str_len: 100},
        },
      },
    },
  },
}];
Meta._sys_fields = ['zone','zones','direct_zones','id','number_doc','date','parent'];
Meta.Obj = MetaObj;
Meta.Field = MetaField;

class ManagersCollection {
  constructor($p) {
    this.$p = $p;
  }
  toString() {
    return this.$p.msg.meta_classes[this.name];
  }
  create(name, constructor, freeze) {
    this[name] = new (constructor || this._constructor)(this, this.name + '.' + name);
    freeze && Object.freeze(this[name]);
  }
  forEach(cb) {
    for(const el in this) {
      if(this[el] instanceof this._constructor) {
        cb(this[el]);
      }
    }
  }
}
class Enumerations extends ManagersCollection {
  constructor($p) {
    super($p);
    this.name = 'enm';
    this._constructor = EnumManager;
  }
}
class Catalogs extends ManagersCollection {
  constructor($p) {
    super($p);
    this.name = 'cat';
    this._constructor = CatManager;
  }
}
class Documents extends ManagersCollection {
  constructor($p) {
    super($p);
    this.name = 'doc';
    this._constructor = DocManager;
  }
}
class InfoRegs extends ManagersCollection {
  constructor($p) {
    super($p);
    this.name = 'ireg';
    this._constructor = InfoRegManager;
  }
}
class AccumRegs extends ManagersCollection {
  constructor($p) {
    super($p);
    this.name = 'areg';
    this._constructor = AccumRegManager;
  }
}
class AccountsRegs extends ManagersCollection {
  constructor($p) {
    super($p);
    this.name = 'accreg';
    this._constructor = AccumRegManager;
  }
}
class DataProcessors extends ManagersCollection {
  constructor($p) {
    super($p);
    this.name = 'dp';
    this._constructor = DataProcessorsManager;
  }
}
class Reports extends ManagersCollection {
  constructor($p) {
    super($p);
    this.name = 'rep';
    this._constructor = DataProcessorsManager;
  }
}
class ChartsOfAccounts extends ManagersCollection {
  constructor($p) {
    super($p);
    this.name = 'cacc';
    this._constructor = ChartOfAccountManager;
  }
}
class ChartsOfCharacteristics extends ManagersCollection {
  constructor($p) {
    super($p);
    this.name = 'cch';
    this._constructor = ChartOfCharacteristicManager;
  }
}
class Tasks extends ManagersCollection {
  constructor($p) {
    super($p);
    this.name = 'tsk';
    this._constructor = TaskManager;
  }
}
class BusinessProcesses extends ManagersCollection {
  constructor($p) {
    super($p);
    this.name = 'bp';
    this._constructor = BusinessProcessManager;
  }
}
function mngrs($p) {
  Object.defineProperties($p, {
    enm: {value: new Enumerations($p)},
    cat: {value: new Catalogs($p)},
    doc: {value: new Documents($p)},
    ireg: {value: new InfoRegs($p)},
    areg: {value: new AccumRegs($p)},
    accreg: {value: new AccountsRegs($p)},
    dp: {value: new DataProcessors($p)},
    rep: {value: new Reports($p)},
    cacc: {value: new ChartsOfAccounts($p)},
    cch: {value: new ChartsOfCharacteristics($p)},
    tsk: {value: new Tasks($p)},
    bp: {value: new BusinessProcesses($p)}
  });
}

class AbstracrAdapter extends MetaEventEmitter{
	constructor($p) {
		super();
		this.$p = $p;
	}
	load_obj(tObj) {
		return Promise.resolve(tObj);
	}
	load_array(_mgr, refs, with_attachments) {
		return Promise.resolve([]);
	}
	save_obj(tObj, attr) {
		return Promise.resolve(tObj);
	}
	get_tree(_mgr, attr){
		return Promise.resolve([]);
	}
	get_selection(_mgr, attr){
		return Promise.resolve([]);
	}
	find_rows(_mgr, selection) {
		return Promise.resolve([]);
	}
}

const classes = Object.assign({Meta, MetaEventEmitter, AbstracrAdapter}, data_managers, data_objs, data_tabulars);

class MetaEngine {
  constructor() {
    this.classes = classes;
    this.adapters = {};
    this.aes = new Aes('metadata.js');
    this.job_prm = new JobPrm(this);
    this.wsql = new WSQL(this);
    this.md = new Meta(this);
    mngrs(this);
    this.record_log = this.record_log.bind(this);
    if(typeof process !== 'undefined' && process.addEventListener) {
      process.addEventListener('error', this.record_log, false);
    }
    else if(typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('error', this.record_log, false);
    }
    MetaEngine._plugins.forEach((plugin) => plugin.call(this));
    MetaEngine._plugins.length = 0;
  }
  on(type, listener) {
    this.md.on(type, listener);
  }
  off(type, listener) {
    this.md.off(type, listener);
  }
  get version() {
    return "2.0.35-beta.2";
  }
  toString() {
    return 'Oknosoft data engine. v:' + this.version;
  }
  record_log(err, promise) {
    this && this.ireg && this.ireg.log && this.ireg.log.record(err);
    console && console.log(err);
  }
  get utils() {
    return utils$1;
  }
  get msg() {
    return msg;
  }
  get current_user() {
    const {cat, superlogin, wsql, adapters: {pouch}} = this;
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
          user_name = wsql.get_user_param('user_name');
        }
        user = cat.users.by_id(user_name);
        if (!user || user.empty()) {
          if (superlogin) {
            user = superlogin.create_user();
          }
          else if(this.job_prm.use_ram !== false) {
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
    if (CatUsers && !CatUsers.prototype.hasOwnProperty('role_available')) {
      CatUsers.prototype.role_available = function (name) {
        return this.acl_objs ? this.acl_objs._obj.some((row) => row.type == name) : true;
      };
      CatUsers.prototype.get_acl = function(class_name) {
        const {_acl} = this._obj;
        let res = 'rvuidepo';
        if(Array.isArray(_acl)){
          _acl.some((acl) => {
            if(acl.hasOwnProperty(class_name)) {
              res = acl[class_name];
              return true;
            }
          });
          return res;
        }
        else {
          const acn = class_name.split('.');
          return _acl && _acl[acn[0]] && _acl[acn[0]][acn[1]] ? _acl[acn[0]][acn[1]] : res;
        }
      };
      Object.defineProperty(CatUsers.prototype, 'partners_uids', {
        get: function () {
          const res = [];
          this.acl_objs && this.acl_objs.find_rows({type: 'cat.partners'}, ({acl_obj}) => acl_obj && res.push(acl_obj.ref));
          return res;
        },
      });
    }
  }
  static plugin(obj) {
    if (!obj) {
      throw new TypeError('Invalid empty plugin');
    }
    if (obj.hasOwnProperty('proto')) {
      if (typeof obj.proto == 'function') {
        obj.proto(MetaEngine);
      }
      else if (typeof obj.proto == 'object') {
        Object.keys(obj.proto).forEach((id) => MetaEngine.prototype[id] = obj.proto[id]);
      }
    }
    if (obj.hasOwnProperty('constructor')) {
      if (typeof obj.constructor != 'function') {
        throw new TypeError('Invalid plugin: constructor must be a function');
      }
      MetaEngine._plugins.push(obj.constructor);
    }
    return MetaEngine;
  }
}
MetaEngine.classes = classes;
MetaEngine._plugins = [];

module.exports = MetaEngine;
//# sourceMappingURL=index.js.map
