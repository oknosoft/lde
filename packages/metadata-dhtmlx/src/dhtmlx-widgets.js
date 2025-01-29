export default ($p) => {
	const {
		DataManager, EnumManager, BusinessProcessManager, DataProcessorsManager, ChartOfAccountManager, TaskManager, CatManager, DocManager,
		RegisterManager, RefDataManager, LogManager, DataObj, CatObj, DocObj, TabularSection, TabularSectionRow, Col_struct,
	} = $p.classes;
	const _md = $p.md;
	$p.moment = $p.utils.moment;

  function xmlentities(str) {
    if(typeof str !== 'string') {
      str = str ? str.toString() : '';
    }
    return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

	/**
	 * ### Возаращает строку xml для инициализации PropertyGrid
	 * служебный метод, используется {{#crossLink "OHeadFields"}}{{/crossLink}}
	 * @method get_property_grid_xml
	 * @param oxml {Object} - объект с иерархией полей (входной параметр - правила)
	 * @param o {DataObj} - объект данных, из полей и табличных частей которого будут прочитаны значения
	 * @param extra_fields {Object} - объект с описанием допреквизитов
	 * @param extra_fields.ts {String} - имя табчасти
	 * @param extra_fields.title {String} - заголовок в oxml, под которым следует расположить допреквизиты // "Дополнительные реквизиты", "Свойства изделия", "Параметры"
	 * @param extra_fields.selection {Object} - отбор, который следует приминить к табчасти допреквизитов
	 * @return {String} - XML строка в терминах dhtml.PropertyGrid
	 * @private
	 */
	DataManager.prototype.get_property_grid_xml = function (oxml, o, extra_fields) {

		var t = this, i, j, mf, v, ft, txt, row_id, gd = '<rows>',

			default_oxml = function () {
				if (oxml)
					return;
				mf = t.metadata();

				if (mf.form && mf.form.obj && mf.form.obj.head) {
					oxml = mf.form.obj.head;

				} else {
					oxml = {' ': []};

					if (o instanceof CatObj) {
						if (mf.code_length)
							oxml[' '].push('id');
						if (mf.main_presentation_name)
							oxml[' '].push('name');
					} else if (o instanceof DocObj) {
						oxml[' '].push('number_doc');
						oxml[' '].push('date');
					}

					if (!o.is_folder) {
						for (i in mf.fields)
							if (i != 'predefined_name' && !mf.fields[i].hide)
								oxml[' '].push(i);
					}

					if (mf.tabular_sections && mf.tabular_sections.extra_fields)
						oxml['Дополнительные реквизиты'] = [];
				}


			},

			txt_by_type = function (fv, mf) {

				if ($p.utils.is_data_obj(fv))
					txt = fv.presentation;
				else
					txt = fv;

        if(mf.type.is_ref) {
          ;
        }
        else if(mf.type.date_part) {
          txt = moment(txt).format(moment._masks[mf.type.date_part]);
        }
        else if(mf.type.types[0] == 'boolean') {
          txt = txt ? '1' : '0';
        }
        else if(mf.type.types[0] == 'string') {
          txt = xmlentities(txt);
        }
			},

			by_type = function (fv) {
				ft = _md.control_by_type(mf.type, fv);
				txt_by_type(fv, mf);
			},

			add_xml_row = function (f, tabular) {
				if (tabular) {
					var pref = f.property || f.param || f.Параметр || f.Свойство,
						pval = f.value != undefined ? f.value : f.Значение;
					if (pref.empty()) {
						row_id = tabular + '|' + 'empty';
						ft = 'ro';
						txt = '';
						mf = {synonym: '?'};

					} else {
						mf = {synonym: pref.presentation, type: pref.type};
						row_id = tabular + '|' + pref.ref;
						by_type(pval);
            if(f._list) {
              ft = 'ocombo';
              if(pval === -1) {
                txt = 'Авто';
              }
            }
            else if(ft == 'edn') {
              ft = 'calck';
            }
            if(f?.param?.dhtmlxro) {
              ft = 'ro';
            }

            if(pref.mandatory) {
              ft += '" class="cell_mandatory';
            }
          }
				}
				else if (typeof f === 'object') {
					row_id = f.id;
					mf = extra_fields && extra_fields.metadata && extra_fields.metadata[row_id];
					if (!mf) {
						mf = {synonym: f.synonym};
					}
					else if (f.synonym) {
						mf.synonym = f.synonym;
					}

					ft = f.type;
					txt = '';
					if (f.hasOwnProperty('txt')) {
						txt = f.txt;
					}
					else if ((v = o[row_id]) !== undefined) {
						txt_by_type(v, mf.type ? mf : _md.get(t.class_name, row_id));
					}
				}
				else if (extra_fields && extra_fields.metadata && ((mf = extra_fields.metadata[f]) !== undefined)) {
					row_id = f;
					by_type(v = o[f]);
				}
				else if ((v = o[f]) !== undefined) {
					mf = _md.get(t.class_name, row_id = f);
					if (!mf) {
						return;
					}
					by_type(v);
				}
				else {
					return;
				}

				gd += '<row id="' + row_id + '"><cell>' + (mf.synonym || mf.name) +
					'</cell><cell type="' + ft + '">' + txt + '</cell></row>';
			};

		default_oxml();

		for (i in oxml) {
			if (i != ' ') {
				gd += '<row open="1"><cell>' + i + '</cell>';   // если у блока есть заголовок, формируем блок иначе добавляем поля без иерархии
			}

			for (j in oxml[i]) {
				add_xml_row(oxml[i][j]);                        // поля, описанные в текущем разделе
			}

			if (extra_fields && i == extra_fields.title && o[extra_fields.ts]) {  // строки табчасти o.extra_fields
				var added = false,
					destinations_extra_fields = t.extra_fields(o),
					pnames = 'property,param,Свойство,Параметр'.split(','),
					//meta_extra_fields = o._metadata.tabular_sections[extra_fields.ts].fields,
					_owner = o[extra_fields.ts]._owner,
					meta_extra_fields = typeof _owner._metadata == 'function' ?
						_owner._metadata(o[extra_fields.ts]._name).fields : _owner._metadata.tabular_sections[o[extra_fields.ts]._name].fields,
					pname;

				// Если в объекте не найдены предопределенные свойства - добавляем
				if (pnames.some((name) => meta_extra_fields[name] && (pname = name))) {
					o[extra_fields.ts].forEach((row) => {
						const index = destinations_extra_fields.indexOf(row[pname]);
            index != -1 && destinations_extra_fields.splice(index, 1);
					});
          for(const property of destinations_extra_fields) {
            const nrow = o[extra_fields.ts].add();
            nrow[pname] = property;
            if(property._obj.by_default) {
              nrow.value = property._obj.by_default.value;
            }
          }
				}

				// Добавляем строки в oxml с учетом отбора, который мог быть задан в extra_fields.selection
				o[extra_fields.ts].find_rows(extra_fields.selection, (row) => add_xml_row(row, extra_fields.ts));

			}

			if (i != ' ') gd += '</row>';                          // если блок был открыт - закрываем
		}
		gd += '</rows>';
		return gd;
	};

	/**
	 * ### Выводит фрагмент списка объектов данного менеджера, ограниченный фильтром attr в grid
	 *
	 * @method sync_grid
	 * @for DataManager
	 * @param grid {dhtmlXGridObject}
	 * @param attr {Object}
	 */
	DataManager.prototype.sync_grid = function (attr, grid) {

		const mgr = this;
		const {iface, record_log, wsql} = this._owner.$p;

    function request() {

      if(typeof attr.custom_selection == 'function') {
        return attr.custom_selection(attr);
      }
      else if(mgr.cachable == 'ram') {

        // если переопределён get_option_list, фильтруем
        let option_list = Promise.resolve();
        if(mgr.get_option_list !== mgr.constructor.prototype.get_option_list) {
          const filter = {};
          if(attr.action !== 'get_tree') {
            Object.assign(filter, attr.filter);
          }
          filter._top = 1000;
          option_list = mgr.get_option_list(filter)
            .then((list) => {
              if(attr.action === 'get_tree') {
                const set = new Set();
                list.forEach((v) => {
                  for(const parent of mgr.get(v.value)._parents()) {
                    set.add(parent);
                  }
                });
                attr.filter.ref = {in: Array.from(set)};
              }
              else {
                attr.selection.push({ref: {in: list.map((v) => v.value)}});
              }
            });
        }

        // запрос к alasql
        attr.params = [];
        if(attr.action == 'get_tree') {
          return option_list.then(() => wsql.alasql.promise(mgr.get_sql_struct(attr), attr.params))
            .then(iface.data_to_tree);
        }
        else if(attr.action == 'get_selection') {
          return option_list.then(() => wsql.alasql.promise(mgr.get_sql_struct(attr), attr.params))
            .then(data => iface.data_to_grid.call(mgr, data, attr));
        }
      }
      else if(mgr.cachable.indexOf('doc') == 0) {

        // todo: запрос к pouchdb
        if(attr.action == 'get_tree') {
          return mgr.adapter.get_tree(mgr, attr);
        }
        else if(attr.action == 'get_selection') {
          return mgr.adapter.get_selection(mgr, attr);
        }
      }
      else {

        // запрос к серверу по сети
        if(attr.action == 'get_tree') {
          return mgr.rest_tree(attr);
        }
        else if(attr.action == 'get_selection') {
          return mgr.rest_selection(attr);
        }

      }
    }

    function to_grid(res) {

			return new Promise(function (resolve, reject) {

				if (typeof res == 'string') {

					if (res.substr(0, 1) == '{')
						res = JSON.parse(res);

					// загружаем строку в грид
					if (grid && grid.parse) {
						grid.xmlFileUrl = 'exec';
						grid.parse(res, function () {
							resolve(res);
						}, 'xml');
					} else
						resolve(res);

				} else if (grid instanceof dhtmlXTreeView && grid.loadStruct) {
					grid.loadStruct(res, function () {
						resolve(res);
					});

				} else
					resolve(res);

			});

		}

		// TODO: переделать обработку catch()
		return request()
			.then(to_grid)
			.catch(record_log);

	};

  /**
   * ### Печатает объект
   * @method print
   * @param ref {DataObj|String} - guid ссылки на объект
   * @param model {String|DataObj.cst.formulas} - идентификатор команды печати
   * @param [wnd] {dhtmlXWindows} - окно, из которого вызываем печать
   */
  DataManager.prototype.print = function (ref, model, wnd) {
    function tune_wnd_print(wnd_print){
      if(wnd && wnd.progressOff)
        wnd.progressOff();
      if(wnd_print)
        wnd_print.focus();
    }

    if(wnd && wnd.progressOn){
      wnd.progressOn();
    }

    setTimeout(tune_wnd_print, 3000);

    // если _printing_plates содержит ссылку на обрабочтик печати, используем его
    if(this._printing_plates[model] instanceof DataObj){
      model = this._printing_plates[model];
    }

    // если существует локальный обработчик, используем его
    if(model instanceof DataObj && model.execute){
      if(ref instanceof DataObj){
        return model.execute(ref, wnd).then(tune_wnd_print);
      }
      else {
        return this.get(ref, true, true)
          .then((ref) => model.execute(ref, wnd))
          .then(tune_wnd_print);
      }
    }
    else{

      // иначе - печатаем средствами 1С или иного сервера
      var rattr = {};
      $p.ajax.default_attr(rattr, $p.job_prm.irest_url());
      rattr.url += this.rest_name + "(guid'" + $p.utils.fix_guid(ref) + "')" +
        "/Print(model=" + model + ", browser_uid=" + $p.wsql.get_user_param("browser_uid") +")";

      return $p.ajax.get_and_show_blob(rattr.url, rattr, "get")
        .then(tune_wnd_print);
    }
  }

  /**
   * Алиас для  emit
   * @param obj
   * @param name
   * @param attr
   */
  DataManager.prototype.handle_event = function (obj, name, attr) {
    this.emit(name, attr, obj);
  }

	/**
	 * ### Перезаполняет грид данными табчасти с учетом отбора
	 * @method sync_grid
	 * @param grid {dhtmlxGrid} - элемент управления
	 * @param [selection] {Object} - в ключах имена полей, в значениях значения фильтра или объект {like: "значение"}
	 */
	TabularSection.prototype.sync_grid = function(grid, selection){
		var grid_data = {rows: []},
			columns = [];

		for(var i = 0; i<grid.getColumnCount(); i++)
			columns.push(grid.getColumnId(i));

		grid.clearAll();
		this.find_rows(selection, function(r){
			var data = [];
			columns.forEach(function (f) {
				if($p.utils.is_data_obj(r[f]))
					data.push(r[f].presentation);
				else
					data.push(r[f]);
			});
			grid_data.rows.push({ id: r.row, data: data });
		});
		if(grid.objBox){
			try{
				grid.parse(grid_data, "json");
				grid.callEvent("onGridReconstructed", []);
			} catch (e){}
		}
	};

	RegisterManager.prototype.caption_flds = function (attr) {

		var _meta = attr.metadata || this.metadata(),
			str_def = '<column id="%1" width="%2" type="%3" align="%4" sort="%5">%6</column>',
			acols = [], s = '';

		if (_meta.form && _meta.form.selection) {
			acols = _meta.form.selection.cols;

		} else {

			for (var f in _meta['dimensions']) {
				acols.push(new Col_struct(f, '*', 'ro', 'left', 'server', _meta['dimensions'][f].synonym));
			}
		}

		if (attr.get_header && acols.length) {
			s = '<head>';
			for (var col in acols) {
				s += str_def.replace('%1', acols[col].id).replace('%2', acols[col].width).replace('%3', acols[col].type)
					.replace('%4', acols[col].align).replace('%5', acols[col].sort).replace('%6', acols[col].caption);
			}
			s += '</head>';
		}

		return {head: s, acols: acols};
	};

	LogManager.prototype.caption_flds = function (attr) {

		var _meta = (attr && attr.metadata) || this.metadata(),
			acols = [];

		if (_meta.form && _meta.form[attr.form || 'selection']) {
			acols = _meta.form[attr.form || 'selection'].cols;

		} else {
			acols.push(new Col_struct('date', '200', 'ro', 'left', 'server', 'Дата'));
			acols.push(new Col_struct('class', '100', 'ro', 'left', 'server', 'Класс'));
			acols.push(new Col_struct('note', '*', 'ro', 'left', 'server', 'Событие'));
		}

		return acols;
	};
	LogManager.prototype.data_to_grid = function (data, attr) {
		const {time_diff} = this._owner.$p.wsql;
		var xml = '<?xml version="1.0" encoding="UTF-8"?><rows total_count="%1" pos="%2" set_parent="%3">'
				.replace('%1', data.length).replace('%2', attr.start)
				.replace('%3', attr.set_parent || ''),
			caption = this.caption_flds(attr);

		// при первом обращении к методу добавляем описание колонок
		xml += caption.head;

		data.forEach(row => {
			xml += '<row id="' + row.ref + '"><cell>' +
				moment(row.date - time_diff).format('DD.MM.YYYY HH:mm:ss') + '.' + row.sequence + '</cell>' +
				'<cell>' + (row.class || '') + '</cell><cell>' + (row.note || '') + '</cell></row>';
		});

		return xml + '</rows>';
	};

	RefDataManager.prototype.caption_flds = function (attr) {

		var _meta = attr.metadata || this.metadata(),
			str_def = '<column id="%1" width="%2" type="%3" align="%4" sort="%5">%6</column>',
			acols = [], s = '';

		if (_meta.form && _meta.form.selection) {
			acols = _meta.form.selection.cols;
		}
		else if (this instanceof DocManager) {
			acols.push(new Col_struct('date', '160', 'ro', 'left', 'server', 'Дата'));
			acols.push(new Col_struct('number_doc', '140', 'ro', 'left', 'server', 'Номер'));

			if (_meta.fields.note)
				acols.push(new Col_struct('note', '*', 'ro', 'left', 'server', _meta.fields.note.synonym));

			if (_meta.fields.responsible)
				acols.push(new Col_struct('responsible', '*', 'ro', 'left', 'server', _meta.fields.responsible.synonym));


		}
		else if (this instanceof ChartOfAccountManager) {
			acols.push(new Col_struct('id', '140', 'ro', 'left', 'server', 'Код'));
			acols.push(new Col_struct('presentation', '*', 'ro', 'left', 'server', 'Наименование'));

		}
		else {

			acols.push(new Col_struct('presentation', '*', 'ro', 'left', 'server', 'Наименование'));
			//if(_meta.has_owners){
			//	acols.push(new Col_struct("owner", "*", "ro", "left", "server", _meta.fields.owner.synonym));
			//}

		}

		if (attr.get_header && acols.length) {
			s = '<head>';
			for (var col in acols) {
				s += str_def.replace('%1', acols[col].id).replace('%2', acols[col].width).replace('%3', acols[col].type)
					.replace('%4', acols[col].align).replace('%5', acols[col].sort).replace('%6', acols[col].caption);
			}
			s += '</head>';
		}

		return {head: s, acols: acols};
	};

	/**
	 * ### Возвращает имя типа элемента управления для типа поля
	 * @method control_by_type
	 * @param type
	 * @return {*}
	 */
	_md.control_by_type = function (type, val) {
		var ft;

		if (typeof val == 'boolean' && type.types.indexOf('boolean') != -1) {
			ft = 'ch';
		}
		else if (typeof val == 'number' && type.digits) {
			if (type.fraction < 5)
				ft = 'calck';
			else
				ft = 'edn';
		}
		else if (val instanceof Date && type.date_part) {
			ft = 'dhxCalendar';
		}
		else if (type.is_ref) {
			ft = 'ocombo';

		}
		else if (type.date_part) {
			ft = 'dhxCalendar';
		}
		else if (type.digits) {
			if (type.fraction < 5)
				ft = 'calck';
			else
				ft = 'edn';
		}
		else if (type.types[0] == 'boolean') {
			ft = 'ch';
		}
		else if (type.hasOwnProperty('str_len') && (type.str_len >= 100 || type.str_len == 0)) {
			ft = 'txt';
		}
		else {
			ft = 'ed';
		}
		return ft;
	};


	/**
 * Расширение типов ячеек dhtmlXGrid
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 *
 * Экспортирует конструкторы:
 * * **eXcell_ref** - поля ввода значений ссылочных типов
 * * **eXcell_refc** - комбобокс ссылочных типов (перечисления и короткие справочники)
 *
 * @module  wdg_dhtmlx
 * @requires common
 */

// Прототип кустомных ячеек для грида
var eXcell_proto = new eXcell();

/**
 * Обработчик клавиш {tab}, {enter} и {F4} в поле ввода
 */
eXcell_proto.input_keydown = function(e, t){

	function obj_on_select(v){
    t.source && t.source.on_select && t.source.on_select.call(t.source, v);
	}

	if(e.keyCode === 8 || e.keyCode === 46){          // по {del} и {bs} очищаем значение
		t.setValue("");
		t.grid.editStop();
    t.source && t.source.on_select && t.source.on_select.call(t.source, "");
	}
	else if(e.keyCode === 9 || e.keyCode === 13)
		t.grid.editStop();                          // по {tab} и {enter} заканчиваем редактирование

	else if(e.keyCode === 115)
		t.cell.firstChild.childNodes[1].onclick(e); // по {F4} открываем форму списка

	else if(e.keyCode === 113){                      // по {F2} открываем форму объекта
		if(t.source.tabular_section){
			t.mgr = _md.value_mgr(t.source.row, t.source.col, typeof t.source.row._metadata == 'function' ?
        t.source.row._metadata(t.source.col).type : t.source.row._metadata.fields[t.source.col].type);
			if(t.mgr){
				var tv = t.source.row[t.source.col];
				t.mgr.form_obj(t.source.wnd, {
					o: tv,
					on_select: obj_on_select
				});
			}

		}else if(t.fpath.length==1){
			t.mgr = _md.value_mgr(t.source.o._obj, t.fpath[0], typeof t.source.o._metadata == 'function' ?
        t.source.o._metadata(t.fpath[0]).type : t.source.o._metadata.fields[t.fpath[0]].type);
			if(t.mgr){
				var tv = t.source.o[t.fpath[0]];
				t.mgr.form_obj(t.source.wnd, {
					o: tv,
					on_select: obj_on_select
				});
			}
		}
	}

	return $p.iface.cancel_bubble(e);
};

/**
 * Конструктор поля ввода со списком OCombo
 * @param cell
 */
function eXcell_ocombo(cell){

	if (!cell)
		return;

	var t = this;

	t.cell = cell;
	t.grid = cell.parentNode.grid;

	/**
	 * устанавливает текст в ячейке. например, this.setCValue("<input type='button' value='"+val+"'>",val);
	 */
	t.setValue=function(val){
		t.setCValue(val instanceof DataObj ? val.presentation : (val || ""));
	};

	/**
	 * получает значение ячейки из табличной части или поля объекта или допполя допобъекта, а не из грида
	 */
	t.getValue=function(){
		return t.grid.get_cell_value();

	};

	/**
	 * Обрабатывает событие перехода к следующему полю (окончание редактирования)
	 */
	t.shiftNext = function () {
		t.grid.editStop();
	};

	/**
	 * Cоздаёт элементы управления редактора и назначает им обработчики
	 */
	t.edit=function(){

		if(t.combo)
			return;

		t.val = t.getValue();		//save current value
		t.cell.innerHTML = "";
		t.combo = new OCombo({
			parent: t.cell,
			grid: t.grid
		}._mixin(t.grid.get_cell_field()));
		t.combo.getInput().focus();
	};

  t.open_selection = function () {
    t.edit();
    t.combo && t.combo.open_selection && t.combo.open_selection();
  }

	/**
	 * вызывается при отключении редактора
	 * @return {boolean} - если "истина", значит объект был изменён
	 */
	t.detach=function(){
		if(t.combo){

			if(t.combo.getComboText){
				t.setValue(t.combo.getComboText());         // текст в элементе управления
				if(!t.combo.getSelectedValue())
					t.combo.callEvent("onChange");
				var res = !$p.utils.is_equal(t.val, t.getValue());// compares the new and the old values
				t.combo.unload();
				return res;

			} else if(t.combo.unload){
				t.combo.unload();
			}
		}
		return true;
	}
}
eXcell_ocombo.prototype = eXcell_proto;
window.eXcell_ocombo = eXcell_ocombo;

/**
 * Конструктор поля ввода значений ссылочных типов для грида
 * @param cell
 */
window.eXcell_ref = eXcell_ocombo;

/**
 * Конструктор комбобокса кешируемых ссылочных типов для грида
 */
window.eXcell_refc = eXcell_ocombo;

/**
 * Конструктор поля пароля
 */
function eXcell_pwd(cell){ //the eXcell name is defined here

	var fnedit;
	if (cell){                //the default pattern, just copy it
		this.cell = cell;
		this.grid = cell.parentNode.grid;
		eXcell_ed.call(this); //uses methods of the "ed" type
		fnedit = this.edit;
		this.edit = function(){
			fnedit.call(this);
			this.obj.type="password";
		};
		this.setValue=function(){
			this.setCValue("*********");
		};
		this.getValue=function(){
			return this.grid.get_cell_value();

		};
		this.detach=function(){
			if(this.grid.get_cell_field){
				var cf = this.grid.get_cell_field();
				cf.obj[cf.field] = this.obj.value;
			}
			this.setValue();
			fnedit = null;
			return this.val != this.getValue();
		}
	}
}
eXcell_pwd.prototype = eXcell_proto;
window.eXcell_pwd = eXcell_pwd;


dhtmlXCalendarObject.prototype._dateToStr = function(val, format) {
	if(val instanceof Date && val.getFullYear() < 1000)
		return "";
	else
		return window.dhx4.date2str(val, format||this._dateFormat, this._dateStrings());
};

eXcell_dhxCalendar.prototype.edit = function() {

	var arPos = this.grid.getPosition(this.cell);
	this.grid._grid_calendarA._show(false, false);
	this.grid._grid_calendarA.setPosition(arPos[0],arPos[1]+this.cell.offsetHeight);
	this.grid._grid_calendarA._last_operation_calendar = false;


	this.grid.callEvent("onCalendarShow", [this.grid._grid_calendarA, this.cell.parentNode.idd, this.cell._cellIndex]);
	this.cell._cediton = true;
	this.val = this.cell.val;
	if(this.val instanceof Date && this.val.getFullYear() < 1000)
		this.val = new Date();
	this._val = this.cell.innerHTML;
	var t = this.grid._grid_calendarA.draw;
	this.grid._grid_calendarA.draw = function(){};
	this.grid._grid_calendarA.setDateFormat((this.grid._dtmask||"%d.%m.%Y"));
	this.grid._grid_calendarA.setDate(this.val||(new Date()));
	this.grid._grid_calendarA.draw = t;

};

eXcell_dhxCalendar.prototype.setCValue = function(val, val2){
	this.cell.innerHTML = val instanceof Date ? this.grid._grid_calendarA._dateToStr(val) : val;
	this.grid._grid_calendarA.getFormatedDate((this.grid._dtmask||"%d/%m/%Y"),val).toString()
//#__pro_feature:21092006{
//#on_cell_changed:23102006{
	this.grid.callEvent("onCellChanged", [
		this.cell.parentNode.idd,
		this.cell._cellIndex,
		(arguments.length > 1 ? val2 : val)
	]);
//#}
//#}
};

/**
 * fix ajax
 */
(function(){

	function fix_auth(t, method, url, async){
		if(url.indexOf("odata/standard.odata") != -1 || url.indexOf("/hs/rest") != -1){
			var username, password;
			if($p.ajax.authorized){
				username = $p.ajax.username;
				password = $p.aes.Ctr.decrypt($p.ajax.password);

			}else{
				if($p.job_prm.guest_name){
					username = $p.job_prm.guest_name;
					password = $p.aes.Ctr.decrypt($p.job_prm.guest_pwd);

				}else{
					username = $p.wsql.get_user_param("user_name");
					password = $p.aes.Ctr.decrypt($p.wsql.get_user_param("user_pwd"));
				}
			}
			t.open(method, url, async, username, password);
			t.withCredentials = true;
			t.setRequestHeader("Authorization", "Basic " +
				btoa(unescape(encodeURIComponent(username + ":" + password))));
		}else
			t.open(method, url, async);
	}

	dhx4.ajax._call = function(method, url, postData, async, onLoad, longParams, headers) {

		var t = (window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP"));
		var isQt = (navigator.userAgent.match(/AppleWebKit/) != null && navigator.userAgent.match(/Qt/) != null && navigator.userAgent.match(/Safari/) != null);

		if (async == true) {
			t.onreadystatechange = function() {
				if ((t.readyState == 4) || (isQt == true && t.readyState == 3)) { // what for long response and status 404?
					if (t.status != 200 || t.responseText == "")
						if (!dhx4.callEvent("onAjaxError", [{xmlDoc:t, filePath:url, async:async}])) return;

					window.setTimeout(function(){
						if (typeof(onLoad) == "function") {
							onLoad.apply(window, [{xmlDoc:t, filePath:url, async:async}]); // dhtmlx-compat, response.xmlDoc.responseXML/responseText
						}
						if (longParams != null) {
							if (typeof(longParams.postData) != "undefined") {
								dhx4.ajax.postLong(longParams.url, longParams.postData, onLoad);
							} else {
								dhx4.ajax.getLong(longParams.url, onLoad);
							}
						}
						onLoad = null;
						t = null;
					},1);
				}
			}
		}

		if (method == "GET") {
			url += this._dhxr(url);
		}

		t.open(method, url, async);

		// если обращение по rest или irest, добавляем авторизацию
		fix_auth(t, method, url, async);

		if (headers != null) {
			for (var key in headers) t.setRequestHeader(key, headers[key]);
		} else if (method == "POST" || method == "PUT" || method == "DELETE") {
			t.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		} else if (method == "GET") {
			postData = null;
		}

		t.setRequestHeader("X-Requested-With", "XMLHttpRequest");

		t.send(postData);

		if (async != true) {
			if ((t.readyState == 4) || (isQt == true && t.readyState == 3)) {
				if (t.status != 200 || t.responseText == "") dhx4.callEvent("onAjaxError", [{xmlDoc:t, filePath:url, async:async}]);
			}
		}

		return {xmlDoc:t, filePath:url, async:async}; // dhtmlx-compat, response.xmlDoc.responseXML/responseText

	};

	dhtmlx.ajax.prototype.send = function(url,params,call){
		var x=this.getXHR();
		if (typeof call == "function")
			call = [call];
		//add extra params to the url
		if (typeof params == "object"){
			var t=[];
			for (var a in params){
				var value = params[a];
				if (value === null || value === dhtmlx.undefined)
					value = "";
				t.push(a+"="+encodeURIComponent(value));// utf-8 escaping
			}
			params=t.join("&");
		}
		if (params && !this.post){
			url=url+(url.indexOf("?")!=-1 ? "&" : "?")+params;
			params=null;
		}

		//x.open(this.post?"POST":"GET",url,!this._sync);
		fix_auth(x, this.post?"POST":"GET",url,!this._sync);

		if (this.post)
			x.setRequestHeader('Content-type','application/x-www-form-urlencoded');

		//async mode, define loading callback
		//if (!this._sync){
		var self=this;
		x.onreadystatechange= function(){
			if (!x.readyState || x.readyState == 4){
				//dhtmlx.log_full_time("data_loading");	//log rendering time
				if (call && self)
					for (var i=0; i < call.length; i++)	//there can be multiple callbacks
						if (call[i])
							call[i].call((self.master||self),x.responseText,x.responseXML,x);
				self.master=null;
				call=self=null;	//anti-leak
			}
		};
		//}

		x.send(params||null);
		return x; //return XHR, which can be used in case of sync. mode
	}

})();

/**
 * Проверяет, видна ли ячейка
 * TODO: учесть слой, модальность и т.д.
 */
dhtmlXCellObject.prototype.is_visible = function () {
	var rect = this.cell.getBoundingClientRect();
	return rect.right > 0 && rect.bottom > 0;
};


$p.iface.data_to_grid = function (data, attr){

	if(this.data_to_grid)
		return this.data_to_grid(data, attr);

	function cat_picture_class(r){
		var res;
		if(r.hasOwnProperty("posted")){
			res = r.posted ? "cell_doc_posted" : "cell_doc";
		}else{
			res = r.is_folder ? "cell_ref_folder" : "cell_ref_elm";
		}

		if(r._deleted)
			res = res + "_deleted";
		return res ;
	}

	function do_format(v){

		if(v instanceof Date){
			if(v.getHours() || v.getMinutes())
				return $p.moment(v).format($p.moment._masks.date_time);
			else
				return $p.moment(v).format($p.moment._masks.date);

		}else
			return typeof v == "number" ? v : $p.iface.normalize_xml(v || "");
	}

	var xml = "<?xml version='1.0' encoding='UTF-8'?><rows total_count='%1' pos='%2' set_parent='%3'>"
			.replace("%1", attr._total_count || data.length)
      .replace("%2", attr.start)
			.replace("%3", attr.set_parent || "" ),
		caption = this.caption_flds(attr);

	// при первом обращении к методу добавляем описание колонок
	xml += caption.head;

	data.forEach(function(r){
		xml +=  "<row id=\"" + r.ref + "\"><cell class=\"" + cat_picture_class(r) + "\">" + do_format(r[caption.acols[0].id]) + "</cell>";
		for(var col=1; col < caption.acols.length; col++ )
			xml += "<cell>" + do_format(r[caption.acols[col].id]) + "</cell>";

		xml += "</row>";
	});

	return xml + "</rows>";
};

/**
 * Создаёт иерархический объект для построения dhtmlxTreeView
 * @param data
 * @return {*[]}
 */
$p.iface.data_to_tree = function (data) {

	var res = [{id: $p.utils.blank.guid, text: "..."}];

	function add_hierarchically(arr, row){
		var curr = {id: row.ref, text: row.presentation, items: []};
		arr.push(curr);
		$p.utils._find_rows(data, {parent: row.ref}, function(r){
			add_hierarchically(curr.items, r);
		});
		if(!curr.items.length)
			delete curr.items;
	}
	$p.utils._find_rows(data, {parent: $p.utils.blank.guid}, function(r){
		add_hierarchically(res, r);
	});

	return res;
};



/**
 * ### Визуальный компонент - гиперссылка с выпадающим списком для выбора значения
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 *
 * @module  widgets
 * @submodule  wdg_dropdown_list
 * @requires common
 */

/**
 * ### Визуальный компонент - гиперссылка с выпадающим списком
 * - Предназначен для отображения и редактирования значения перечислимого типа (короткий список)
 *
 * @class ODropdownList
 * @param attr
 * @param attr.container {HTMLElement} - контейнер, в котором будет размещен элемент
 * @param attr.title {String} - заголовок элемента
 * @param attr.values {Array} - список строковых представлений перечисления или объект, в ключах которого ключи, а в значениях - представления значений
 * @param attr.event_name {String} - имя события, которое будет генерировать элемент при изменении значения
 * @param [attr.class_name] {String} - имя класса CSS, добавляемое к стилям элемета
 * @constructor
 * @menuorder 57
 * @tooltip Гиперссылка со списком
 */
function ODropdownList(attr){

	var ul = document.createElement('ul'), li, div, a;

	function set_order_text(silent){
		a.innerHTML = attr.values[a.getAttribute("current")];
		if(attr.event_name && !silent)
			dhx4.callEvent(attr.event_name, [a.getAttribute("current")]);
	}

	function body_click(){
		div.classList.remove("open");
	}

	attr.container.innerHTML = '<div class="dropdown_list">' + attr.title + '<a href="#" class="dropdown_list"></a></div>';
	div = attr.container.firstChild;
	a = div.querySelector("a");
	a.setAttribute("current", Array.isArray(attr.values) ? "0" : Object.keys(attr.values)[0]);
	div.onclick = function (e) {
		if(!div.classList.contains("open")){
			div.classList.add("open");
		}else{
			if(e.target.tagName == "LI"){
				for(var i in ul.childNodes){
					if(ul.childNodes[i] == e.target){
						a.setAttribute("current", e.target.getAttribute("current"));
						set_order_text();
						break;
					}
				}
			}
			body_click();
		}
		return $p.iface.cancel_bubble(e);
	};
	div.appendChild(ul);
	ul.className = "dropdown_menu";
	if(attr.class_name){
		div.classList.add(attr.class_name);
		ul.classList.add(attr.class_name);
	}

	for(var i in attr.values){
		li = document.createElement('li');
		var pos = attr.values[i].indexOf('<i');
		li.innerHTML = attr.values[i].substr(pos) + " " + attr.values[i].substr(0, pos);
		li.setAttribute("current", i);
		ul.appendChild(li);
	};

	document.body.addEventListener("keydown", function (e) {
		if(e.keyCode == 27) { // закрытие по {ESC}
			div.classList.remove("open");
		}
	});
	document.body.addEventListener("click", body_click);

	this.unload = function () {
		var child;
		while (child = div.lastChild)
			div.removeChild(child);
		attr.container.removeChild(div);
		li = ul = div = a = attr = null;
	};

	set_order_text(true);

}
$p.iface.ODropdownList = ODropdownList;
/**
 * ### Динамическое дерево иерархического справочника
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 *
 * @module  widgets
 * @submodule wdg_dyn_tree
 * @requires common
 */

/**
 * ### Визуальный компонент - динамическое дерево иерархического справочника
 *
 * Особенность dhtmlx: экземпляр создаётся не конструктором, а функцией `attachDynTree` (без `new`) и размещается в ячейке dhtmlXCellObject
 *
 * @class ODynTree
 * @param mgr {DataManager}
 * @param [callback] Function
 * @constructor
 * @menuorder 54
 * @tooltip Дерево справочника
 */
dhtmlXCellObject.prototype.attachDynTree = function(mgr, filter, callback) {

	if(this.setCollapsedText)
		this.setCollapsedText("Дерево");

  if(!filter) {
    filter = {is_folder: true};
  }

  var tree = this.attachTreeView();

	tree.__define({
		/**
		 * Фильтр, налагаемый на дерево
		 */
		filter: {
			get: function () {

			},
			set: function (v) {
				filter = v;
			},
			enumerable: false,
			configurable: false
		}
	});

	// !!! проверить закешированность дерева
	// !!! для неиерархических справочников дерево можно спрятать
	setTimeout(function () {

		mgr.sync_grid({
			action: "get_tree",
			filter: filter
		}, tree)
			.then(function (res) {
				if(callback)
					callback(res);
			});

	});

	return tree;
};

/**
 * ### Визуальный компонент OCombo
 * Поле с выпадающим списком + функция выбора из списка
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 *
 * @module widgets
 * @submodule wdg_ocombo
 * @requires common
 */

/**
 * ### Визуальный компонент - поле с выпадающим списком
 * - Предназначен для отображения и редактирования ссылочных, в том числе, составных типов данных
 * - Унаследован от [dhtmlXCombo](http://docs.dhtmlx.com/combo__index.html)
 * - Строки списка формируются автоматически по описанию метаданных
 * - Автоматическая привязка к данным (байндинг) - при изменении значения в поле объекта, синхронно изменяются данные в элементе управления
 * - Автоматическая фильтрация по части кода или наименования
 * - Лаконичный код инициализации компонента [см. пример в Codex](http://www.oknosoft.ru/metadata/codex/#obj=0116&view=js)
 *
 * @class OCombo
 * @param attr
 * @param attr.parent {HTMLElement} - контейнер, в котором будет размещен элемент
 * @param attr.obj {DataObj|TabularSectionRow} - ссылка на редактируемый объект
 * @param attr.field {String} - имя поля редактируемого объекта
 * @param [attr.metadata] {Object} - описание метаданных поля. Если не указано, описание запрашивается у объекта
 * @param [attr.width] {Number} - если указано, фиксирует ширину элемента
 * @constructor
 * @menuorder 51
 * @tooltip Поле со списком
 */
function OCombo(attr){

	var _obj, _field, _meta, _mgr, _property, popup_focused,
		t = this,
		_pwnd = {
			on_select: attr.on_select || function (selv) {
				_obj[_field] = selv;
			}
		};

	// если нас открыли из окна,
	// которое может быть модальным - сохраняем указатель на метод модальности родительского окна
	if(attr.pwnd && attr.pwnd.setModal)
		_pwnd.setModal = attr.pwnd.setModal.bind(attr.pwnd);

	// выполняем конструктор родительского объекта
	OCombo.superclass.constructor.call(t, attr);

	if(attr.on_select){
		t.getBase().style.border = "none";
		t.getInput().style.left = "-3px";
		if(!attr.is_tabular)
			t.getButton().style.right = "9px";
	} else
		t.getBase().style.marginBottom = "4px";

	if(attr.left)
		t.getBase().style.left = left + "px";

	this.attachEvent("onChange", function(){
		if(_obj && _field){
		  var val = this.getSelectedValue();
		  if(!val && this.getComboText()){
        val = this.getOptionByLabel(this.getComboText());
        if(val){
          val = val.value;
        }
        else{
          this.setComboText("");
        }
      }
      _obj[_field] = val;
    }
	});

	this.attachEvent("onBlur", function(){
		if(!this.getSelectedValue() && this.getComboText()){
      this.setComboText("");
    }
	});

	this.attachEvent("onDynXLS", function (text) {

	  if(!_meta){
	    return;
    }
		if(!_mgr){
      _mgr = _md.value_mgr(_obj, _field, _meta.type);
    }
		if(_mgr){
			t.clearAll();
			(attr.get_option_list || _mgr.get_option_list).call(_mgr, get_filter(text))
				.then(function (l) {
					if(t.addOption){
						t.addOption(l);
						t.openSelect();
					}
				});
		}

	});

	function get_filter(text){
		var filter = {_top: 50, _dhtmlx: true, _attr: attr};

    if(_mgr && _mgr.metadata().hierarchical && _mgr.metadata().group_hierarchy) {
      if(_meta.choice_groups_elm == 'elm') {
        filter.is_folder = false;
      }
      else if(_meta.choice_groups_elm == 'grp' || _field == 'parent') {
        filter.is_folder = true;
      }
    }

    // для связей параметров выбора, значение берём из объекта
    _meta.choice_links && _meta.choice_links.forEach(({name, path}) => {
      if(name && name[0] == "selection"){
        if($p.utils.is_tabular(_obj)){
          if(path.length < 2)
            filter[name[1]] = typeof path[0] == "function" ? path[0] : _obj._owner._owner[path[0]];
          else{
            if(name[1] == "owner" && !_mgr.metadata().has_owners){
              return;
            }
            filter[name[1]] = _obj[path[1]];
          }
        }else{
          filter[name[1]] = typeof path[0] == "function" ? path[0] : _obj[path[0]];
        }
      }
    });

		// у параметров выбора, значение живёт внутри отбора
    _meta.choice_params && _meta.choice_params.forEach(({name, path}) => {
      const fval = Array.isArray(path) ? {in: path} : path;
      if(!filter[name]) {
        filter[name] = fval;
      }
      else if(Array.isArray(filter[name])) {
        filter[name].push(fval);
      }
      else {
        filter[name] = [filter[name]];
        filter[name].push(fval);
      }
    });

    // учтём дискретный ряд - он перекрывает другие отборы по ref
    if(_meta.list) {
      filter.ref = {in: _meta.list};
    }

		// если в метаданных указано строить список по локальным данным, подмешиваем эту информацию в фильтр
    if(_meta._option_list_local) {
      filter._local = true;
    }

    // навешиваем фильтр по подстроке
    if(text) {
      filter.presentation = {like: text};
    }

    // если включен справочник связей параметров - дополнительно фильтруем результат
    if(attr.property && attr.property.filter_params_links) {
      attr.property.filter_params_links(filter, attr);
    }

		return filter;
	}

	// обработчики событий

	function aclick(e){
		if(this.name == "select"){
			if(_mgr)
				_mgr.form_selection(_pwnd, {
					initial_value: _obj[_field].ref,
					selection: [get_filter()]
				});
			else
				aclick.call({name: "type"});

		} else if(this.name == "add"){
			if(_mgr)
				_mgr.create({}, true)
					.then(function (o) {
						o._set_loaded(o.ref);
						o.form_obj(attr.pwnd);
					});
		}
		else if(this.name == "open"){
			if(_obj && _obj[_field] && !_obj[_field].empty())
				_obj[_field].form_obj(attr.pwnd);
		}
		else if(_meta && this.name == "type"){
			var tlist = [], tmgr, tmeta, tobj = _obj, tfield = _field;
			_meta.type.types.forEach(function (o) {
				tmgr = _md.mgr_by_class_name(o);
				tmeta = tmgr.metadata();
				tlist.push({
					presentation: tmeta.synonym || tmeta.name,
					mgr: tmgr,
					selected: _mgr === tmgr
				});
			});
			$p.iface.select_from_list(tlist)
				.then(function(v){
					if(tobj[tfield] && ((tobj[tfield].empty && tobj[tfield].empty()) || tobj[tfield]._manager != v.mgr)){
						_mgr = v.mgr;
						_obj = tobj;
						_field = tfield;
            const {_metadata} = _obj;
						_meta = typeof _metadata == 'function' ? _metadata.call(_obj, _field) : _metadata.fields[_field];
						_mgr.form_selection({
							on_select: function (selv) {
								_obj[_field] = selv;
								_obj = null;
								_field = null;
								_meta = null;

							}}, {
							selection: [get_filter()]
						});
					}
					_mgr = null;
					tmgr = null;
					tmeta = null;
					tobj = null;
					tfield = null;
				});
		}

		if(e)
			return $p.iface.cancel_bubble(e);
	}

	function popup_hide(){
		popup_focused = false;
		setTimeout(function () {
			if(!popup_focused){
				if($p.iface.popup.p && $p.iface.popup.p.onmouseover)
					$p.iface.popup.p.onmouseover = null;
				if($p.iface.popup.p && $p.iface.popup.p.onmouseout)
					$p.iface.popup.p.onmouseout = null;
				$p.iface.popup.clear();
				$p.iface.popup.hide();
			}
		}, 300);
	}

	function popup_show(){

		if(!_mgr || !_mgr.class_name || _mgr instanceof EnumManager){
      return;
    }

		popup_focused = true;
		var div = document.createElement('div'),
			innerHTML = attr.hide_frm ? "" : "<a href='#' name='select' title='Форма выбора {F4}'>Показать все</a>" +
				"<a href='#' name='open' style='margin-left: 9px;' title='Открыть форму элемента {Ctrl+Shift+F4}'><i class='fa fa-external-link fa-fw'></i></a>";

		// для полных прав разрешаем добавление элементов
		// TODO: учесть реальные права на добавление
		if(!attr.hide_frm){
			var _acl = $p.current_user.get_acl(_mgr.class_name);
			if(_acl.indexOf("i") != -1)
				innerHTML += "&nbsp;<a href='#' name='add' title='Создать новый элемент {F8}'><i class='fa fa-plus fa-fwfa-fw'></i></a>";
		}

		// для составных типов разрешаем выбор типа
		// TODO: реализовать поддержку примитивных типов
		if(_meta.type.types.length > 1)
			innerHTML += "&nbsp;<a href='#' name='type' title='Выбрать тип значения {Alt+T}'><i class='fa fa-level-up fa-fw'></i></a>";

		if(innerHTML){
			div.innerHTML = innerHTML;
			for(var i=0; i<div.children.length; i++)
				div.children[i].onclick = aclick;

			$p.iface.popup.clear();
			$p.iface.popup.attachObject(div);
			$p.iface.popup.show(dhx4.absLeft(t.getButton())-77, dhx4.absTop(t.getButton()), t.getButton().offsetWidth, t.getButton().offsetHeight);

			$p.iface.popup.p.onmouseover = function(){
				popup_focused = true;
			};

			$p.iface.popup.p.onmouseout = popup_hide;
		}
	}

	function oncontextmenu(e) {
		setTimeout(popup_show, 10);
		e.preventDefault();
		return false;
	}

	function onkeyup(e) {

		if(!_mgr || _mgr instanceof EnumManager){
      return;
    }

		if(e.keyCode == 115){ // F4
			if(e.ctrlKey && e.shiftKey){
				if(!_obj[_field].empty())
					_obj[_field].form_obj(attr.pwnd);

			}else if(!e.ctrlKey && !e.shiftKey){
				if(_mgr)
					_mgr.form_selection(_pwnd, {
						initial_value: _obj[_field].ref,
						selection: [get_filter()]
					});
			}
			return $p.iface.cancel_bubble(e);
		}
	}

	function onfocus(e) {
		setTimeout(function () {
			if(t && t.getInput)
				t.getInput().select();
		}, 50);
	}

	t.getButton().addEventListener("mouseover", popup_show);

	t.getButton().addEventListener("mouseout", popup_hide);

	t.getBase().addEventListener("click", $p.iface.cancel_bubble);

	t.getBase().addEventListener("contextmenu", oncontextmenu);

	t.getInput().addEventListener("keyup", onkeyup);

	t.getInput().addEventListener("focus", onfocus);


	function listener(obj, fields){
	  if(!_obj || !t.getBase().parentElement){
      setTimeout(t.unload);
    }
		if(!t || !t.getBase || obj !== _obj){
      return;
    }
    fields[_field] && set_value(_obj[_field]);
  }

	function set_value(v){
		if(v && v instanceof DataObj && !v.empty()){
			if(!t.getOption(v.ref))
				t.addOption(v.ref, v.presentation);
			if(t.getSelectedValue() == v.ref)
				return;
			t.setComboValue(v.ref);
		}
		else if(!t.getSelectedValue()){
			t.setComboValue("");
			t.setComboText("")
		}
	}

	/**
	 * Подключает поле объекта к элементу управления<br />
	 * Параметры аналогичны конструктору
	 */
	this.attach = function (attr) {
		_obj = attr.obj;
		_field = attr.field;
		_property = attr.property;

    if(attr.metadata) {
      _meta = attr.metadata;
    }
    else if(_property) {
      const {_metadata} = _obj;
      _meta = $p.utils._clone(typeof _metadata == 'function' ? _metadata.call(_obj, _field) : _metadata.fields[_field]);
      _meta.type = _property.type;
      if(_obj.inset && _obj.inset.product_params) {
        const drow = _obj.inset.product_params.find({param: _property});
        if(drow && drow.list) {
          try{
            _meta.list = JSON.parse(drow.list);
          }
          catch (e) {}
        }
      }
    }
    else {
      const {_metadata} = _obj;
      _meta = typeof _metadata == 'function' ? _metadata.call(_obj, _field) : _metadata.fields[_field];
    }

    t.clearAll();

		_mgr = _md.value_mgr(_obj, _field, _meta.type);
    if(Array.isArray(_obj._list)) {
      const _list = _obj._list.map((v) => {
        if(_mgr) {
          v = _mgr.get(v);
        }
        const item = {
          text: v.toString(),
          value: v.valueOf(),
          selected: v == _obj[_field],
        }
        if(v === -1) {
          item.text = 'Авто';
        }
        return item;
      });
      if(t.addOption){
        t.addOption(_list);
        set_value(_obj[_field]);
      }
    }
    else if(_mgr || attr.get_option_list){
			// загружаем список в 30 строк
			(attr.get_option_list || _mgr.get_option_list).call(_mgr, get_filter(), _obj[_field])
				.then(function (l) {
					if(t.addOption){
						t.addOption(l);
						set_value(_obj[_field]);
					}
				});
		}

		// начинаем следить за объектом
    if(_mgr){
      _mgr.off('update', listener);
      _mgr.on('update', listener);
    }

	};

  this.open_selection = function () {
    aclick.call({name: "select"});
  }

	const _unload = this.unload;
	this.unload = function () {
    popup_hide();
    if(t.getButton){
      t.getButton().removeEventListener("mouseover", popup_show);
      t.getButton().removeEventListener("mouseout", popup_hide);
      t.getBase().removeEventListener("click", $p.iface.cancel_bubble);
      t.getBase().removeEventListener("contextmenu", oncontextmenu);
      t.getInput().removeEventListener("keyup", onkeyup);
      t.getInput().removeEventListener("focus", onfocus);
    }
    if(t.conf && t.conf.tm_confirm_blur){
      clearTimeout(t.conf.tm_confirm_blur);
    }
    _mgr && _mgr.off('update', listener);
    this.list && this.list.parentElement && this.list.parentElement.removeChild(this.list);
    _obj = null;
    _field = null;
    _meta = null;
    _mgr = null;
    _pwnd = null;

    try{ _unload && _unload.call(t); }catch(e){}
	};

	// биндим поле объекта
	attr.obj && attr.field && this.attach(attr);

	// устанавливаем url фильтрации
	this.enableFilteringMode("between", "dummy", false, false);

	// свойство для единообразного доступа к значению
	this.__define({
		value: {
			get: function () {
				if(_obj)
					return _obj[_field];
			}
		}
	});

}
OCombo._extend(dhtmlXCombo);
$p.iface.OCombo = OCombo;

/**
 * ### Форма выбора из списка значений
 * @method select_from_list
 * @for InterfaceObjs
 * @param list
 * @param multy
 * @return {Promise}
 */
$p.iface.select_from_list = function (list, multy) {

	return new Promise(function(resolve, reject){

		if(!Array.isArray(list) || !list.length)
			resolve(undefined);

		else if(list.length == 1)
			resolve(list[0]);

		// создаём и показываем диалог со списком

		// параметры открытия формы
		var options = {
				name: 'wnd_select_from_list',
				wnd: {
					id: 'wnd_select_from_list',
					width: 300,
					height: 300,
					modal: true,
					center: true,
					caption: $p.msg.select_from_list,
					allow_close: true,
					on_close: function () {
						if(rid)
							resolve(list[parseInt(rid)-1]);
						return true;
					}
				}
			},
			rid, sid,
			wnd = $p.iface.dat_blank(null, options.wnd),
			_grid = wnd.attachGrid(),
			_toolbar = wnd.attachToolbar({
				items:[
					{id: "select", type: "button", text: $p.msg.select_from_list},
					{id: "cancel", type: "button", text: "Отмена"}
				],
				onClick: do_select
			});

		function do_select(id){
			if(id != "cancel")
				rid = _grid.getSelectedRowId();
			wnd.close();
		}

		_grid.setIconsPath(dhtmlx.image_path);
		_grid.setImagePath(dhtmlx.image_path);
		_grid.setHeader($p.msg.value);
		_grid.setColTypes("ro");
		_grid.enableAutoWidth(true, 1200, 600);
		_grid.attachEvent("onRowDblClicked", do_select);
		_grid.enableMultiselect(!!multy);
		_grid.setNoHeader(true);
		_grid.init();

		_toolbar.addSpacer("select");

		wnd.hideHeader();
		wnd.cell.offsetParent.querySelector(".dhxwin_brd").style.border = "none"

		// заполняем его данными
		list.forEach(function (o, i) {
			var text;
			if(typeof o == "object")
				text = o.presentation || o.text || o.toString();
			else
				text = o.toString();
			_grid.addRow(1+i, text);
			if(o.selected)
				sid = 1+i;
		});
		if(sid)
			_grid.selectRowById(sid);

	});
};

/**
 * ### Форма ввода значения
 * @method query_value
 * @for InterfaceObjs
 * @param initial
 * @param caption
 * @return {Promise}
 */
$p.iface.query_value = function (initial, caption) {

  return new Promise(function(resolve, reject){

    // создаём и показываем диалог со списком

    // параметры открытия формы
    var options = {
        name: 'wnd_query_value',
        wnd: {
          width: 300,
          height: 160,
          modal: true,
          center: true,
          caption: caption || 'Введите значение',
          allow_close: true,
          on_close: function () {
            reject();
            return true;
          }
        }
      },
      wnd = $p.iface.dat_blank(null, options.wnd),
      _toolbar = wnd.attachToolbar({
        items:[
          {id: "select", type: "button", text: "<b>Ok</b>"},
          {id: "sp", type: "spacer"},
          {id: "cancel", type: "button", text: "Отмена"}
        ],
        onClick: function (id){
          if(id == "cancel"){
            wnd.close()
          }
          else{
            resolve(wnd.cell.querySelector('INPUT').value);
            wnd.close();
          }
        }
      });

    wnd.attachHTMLString("<input type='text' style='width: 94%; padding: 4px;' value='" + initial + "' />");

  });
};

/**
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 * @module odaterangepicker
 *
 * Created 02.08.2016
 */

function ODateRangePicker(container, attr) {

	var _cont = this._cont = document.createElement('div');

	if(container instanceof dhtmlXCellObject){
		container.appendObject(this._cont);
	}else{
		container.appendChild(this._cont);
	}

	this._cont.className = "odaterangepicker";
	this._cont.innerHTML = '<i class="fa fa-calendar"></i>&nbsp; <span></span> &nbsp;<i class="fa fa-caret-down"></i>';

	this.__define({

		set_text: {
			value: 	function() {
				$('span', _cont).html(this.date_from.format('DD MMM YY') + ' - ' + this.date_till.format('DD MMM YY'));
			}
		},

		on: {
			value: function (event, fn) {
				return $(_cont).on(event, fn);
			}
		},

		date_from: {
			get: function () {
				return $(_cont).data('daterangepicker').startDate;
			},
			set: function (v) {
				$(_cont).data('daterangepicker').setStartDate(v);
				this.set_text()
			}
		},

		date_till: {
			get: function () {
				return $(_cont).data('daterangepicker').endDate;
			},
			set: function (v) {
				$(_cont).data('daterangepicker').setEndDate(v);
				this.set_text()
			}
		}
	});

	$(_cont).daterangepicker({
		startDate: attr.date_from ? moment(attr.date_from) : moment().subtract(29, 'days'),
		endDate: moment(attr.date_till),
		showDropdowns: true,
		alwaysShowCalendars: true,
		opens: "left",
		ranges: {
			'Сегодня': [moment(), moment()],
			'Вчера': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
			'Последние 7 дней': [moment().subtract(6, 'days'), moment()],
			'Последние 30 дней': [moment().subtract(29, 'days'), moment()],
			'Этот месяц': [moment().startOf('month'), moment().endOf('month')],
			'Прошлый месяц': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
		}
	}, this.set_text.bind(this));

	this.set_text();

}

$p.iface.ODateRangePicker = ODateRangePicker;
/**
 * ### Визуальный компонент - реквизиты шапки объекта
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 *
 * @module  widgets
 * @submodule wdg_ohead_fields
 * @requires common
 */

/**
 * ### Визуальный компонент - реквизиты шапки объекта
 * - Предназначен для отображения и редактирования полей {{#crossLink "DataObj"}}объекта данных{{/crossLink}}
 * - Унаследован от [dhtmlXGridObject](http://docs.dhtmlx.com/grid__index.html)
 * - Состав и типы элементов управления в дереве реквизитов формируются автоматически по описанию метаданных
 * - Программное изменение значений реквизитов объекта данных, синхронно отображается в элементе управления
 * - Редактирование в элементе управления синхронно изменяет свойства связанного объекта
 *
 * Особенность dhtmlx: экземпляр создаётся не конструктором, а функцией `attachHeadFields` (без `new`) и размещается в ячейке dhtmlXCellObject
 *
 * @class OHeadFields
 * @param attr
 * @param attr.parent {HTMLElement} - контейнер, в котором будет размещен элемент
 * @param attr.obj {DataObj} - ссылка на редактируемый объект
 * @param attr.ts {String} - имя табличной части c дополнительными реквизитами
 * @param [attr.metadata] {Object} - описание метаданных реквизитов. Если не указано, описание запрашивается у объекта
 * @constructor
 * @menuorder 52
 * @tooltip Редактор полей DataObj
 */
dhtmlXCellObject.prototype.attachHeadFields = function(attr) {

	var _obj,
		_oxml,
		_meta,
		_mgr,
		_selection,
		_tsname,
		_extra_fields,
		_pwnd,
		_cell = this,
		_grid = _cell.attachGrid(),
		_destructor = _grid.destructor;

  function listener_unload(obj, fields){
    if(!_obj){
      _grid.destructor && _grid.destructor();
    }
    else if(_grid.entBox && !_grid.entBox.parentElement){
      setTimeout(_grid.destructor);
    }
    else if(_obj === obj){
      if(_cell && _cell.close)
        _cell.close();
      else
        _grid.destructor();
    }
  }

	// задача обсервера - перерисовать поле при изменении свойств объекта
	function listener(obj, fields){
		if(!_obj){
      _grid.destructor && _grid.destructor();
			throw new Error('observer');
		}
		else if(_grid.entBox && !_grid.entBox.parentElement){
      setTimeout(_grid.destructor);
    }
    _grid.forEachRow((id) => {
      if (fields.hasOwnProperty(id))
        _grid.cells(id,1).setValue(_obj[id], id);
    });
	}

	function listener_rows(obj, fields){

    if(!_obj){
      _grid.destructor && _grid.destructor();
    }
    else if(_grid.entBox && !_grid.entBox.parentElement){
      setTimeout(_grid.destructor);
    }
    else if((_obj === obj && fields.hasOwnProperty(_tsname)) || (obj._owner && obj._owner._owner === _obj && obj._owner.name == _tsname)){
      _grid.clearAll();
      _grid.parse(_mgr.get_property_grid_xml(_oxml, _obj, {
        title: attr.ts_title,
        ts: _tsname,
        selection: _selection,
        metadata: _meta
      }), function(){

      }, "xml");
    }
	}


	new dhtmlXPropertyGrid(_grid);

  _grid.setInitWidthsP(attr.widths || '40,60');
  _grid.setDateFormat('%d.%m.%Y %H:%i');
	_grid.init();
	//t.enableAutoHeight(false,_cell._getHeight()-20,true);
	_grid.setSizes();
	_grid.attachEvent("onPropertyChanged", function(pname, new_value, old_value){
    if(pname || _grid && _grid.getSelectedRowId()){
      return _pwnd.on_select(new_value); // , _grid.getSelectedRowId()
    }
	});
	_grid.attachEvent("onCheckbox", function(rId, cInd, state){
		if(_obj[rId] != undefined)
			return _pwnd.on_select(state, {obj: _obj, field: rId});

		if(rId.split("|").length > 1)
			return _pwnd.on_select(state, _grid.get_cell_field(rId));
	});
	_grid.attachEvent("onKeyPress", function(code,cFlag,sFlag){

		switch(code) {
			case 13:    //  enter
			case 9:     //  tab
				if (_grid.editStop)
					_grid.editStop();
				break;

			case 46:    //  del
				break;
		};

	});
	if(attr.read_only){
		_grid.setEditable(false);
	}

	_grid.__define({

		selection: {
			get: function () {
				return _selection;
			},
			set: function (sel) {
				_selection = sel;
				this.reload();
			}
		},

		reload: {
			value: function () {
        listener_rows(_obj, {[_tsname]: true});
			}
		},

		get_cell_field: {
			value: function (rId) {

				if(!_obj){
          return;
        }

				var res = {row_id: rId || _grid.getSelectedRowId()},
					fpath = res.row_id ? res.row_id.split("|") : [];

        if(!fpath.length){
          return {obj: _obj, field: ''}._mixin(_pwnd);
        }
				if(fpath.length < 2){
					return {obj: _obj, field: fpath[0]}._mixin(_pwnd);
				}
				else {
					var vr;
					if(_selection){
						_obj[fpath[0]].find_rows(_selection, function (row) {
							if(row.property == fpath[1] || row.param == fpath[1] || row.Свойство == fpath[1] || row.Параметр == fpath[1]){
								vr = row;
								return false;
							}
						});

					}else{
						vr = _obj[fpath[0]].find(fpath[1]);
					}

					if(vr){
						res.obj = vr;
						if(vr["Значение"]){
							res.field = "Значение";
							res.property = vr.Свойство || vr.Параметр;
						} else{
							res.field = "value";
							res.property = vr.property || vr.param;
						}
						return res._mixin(_pwnd);
					}
				}
			},
			enumerable: false
		},

		_obj: {
			get: function () {
				return _obj;
			}
		},

		_owner_cell: {
			get: function () {
				return _cell;
			}
		},

		destructor: {
			value: function () {

        if(_mgr){
          _mgr.off('update', listener);
          _mgr.off('unload', listener_unload);
          _mgr.off('update', listener_rows);
          _mgr.off('rows', listener_rows);
        }

				_obj = null;
				_extra_fields = null;
				_meta = null;
				_mgr = null;
				_pwnd = null;

				_destructor.call(_grid);
			}
		},

		/**
		 * Подключает поле объекта к элементу управления<br />
		 * Параметры аналогичны конструктору
		 */
		attach: {
			value: function (attr) {
			  if(_mgr){
          _mgr.off('update', listener);
          _mgr.off('unload', listener_unload);
          _mgr.off('update', listener_rows);
          _mgr.off('rows', listener_rows);
        }

				if(attr.oxml){
          _oxml = attr.oxml;
        }

				if(attr.selection)
					_selection = attr.selection;

				_obj = attr.obj;
        const {_metadata} = _obj;
				_meta = attr.metadata || typeof _metadata == 'function' ? _metadata.call(_obj).fields : _metadata.fields;
				_mgr = _obj._manager;
				_tsname = attr.ts || "";
				_extra_fields = _tsname ? _obj[_tsname] : (_obj.extra_fields || _obj["ДополнительныеРеквизиты"]);
				if(_extra_fields && !_tsname)
					_tsname = _obj.extra_fields ? "extra_fields" :  "ДополнительныеРеквизиты";
				_pwnd = {
					// обработчик выбора ссылочных значений из внешних форм, открываемых полями со списками
					on_select: function (selv, cell_field) {
						if(!cell_field)
							cell_field = _grid.get_cell_field();
						if(cell_field){

							var ret_code = _mgr.handle_event(_obj, "value_change", {
								field: cell_field.field,
								value: selv,
								tabular_section: cell_field.row_id ? _tsname : "",
								grid: _grid,
								cell: _grid.cells(cell_field.row_id || cell_field.field, 1),
								wnd: _pwnd.pwnd
							});
							if(typeof ret_code !== "boolean"){
								cell_field.obj[cell_field.field] = selv;
								ret_code = true;
							}
							return ret_code;
						}
					},
					pwnd: attr.pwnd || _cell
				};


				// начинаем следить за объектом и, его табчастью допреквизитов
				_mgr.on({
          update: listener,
          unload: listener_unload,
        })

				if(_extra_fields && _extra_fields instanceof TabularSection){
          _mgr.on({
            update: listener_rows,
            rows: listener_rows,
          })
        }

				// заполняем табчасть данными
				if(_tsname && !attr.ts_title){
          const {_metadata} = _obj;
          attr.ts_title = typeof _metadata == 'function' ? _metadata.call(_obj, _tsname).synonym : _metadata.tabular_sections[_tsname].synonym;
        }
				listener_rows(_obj, {[_tsname]: true});

			}
		}

	});


	//TODO: контекстные меню для элементов и табличных частей

	//TODO: HeadFields для редактирования строки табчасти. Она ведь - тоже DataObj

	if(attr)
		_grid.attach(attr);

	return _grid;
};

dhtmlXGridObject.prototype.get_cell_value = function () {
	var cell_field = this.get_cell_field();
	if(cell_field && cell_field.obj)
		return cell_field.obj[cell_field.field];
};


/**
 * ### Визуальный компонент - табличное поле объекта
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 *
 * @module  widgets
 * @submodule wdg_otabular
 * @requires common
 */


/**
 * ### Визуальный компонент - табличное поле объекта
 * - Предназначен для отображения и редактирования {{#crossLink "TabularSection"}}табличной части{{/crossLink}}
 * - Унаследован от [dhtmlXGridObject](http://docs.dhtmlx.com/grid__index.html)
 * - Состав и типы колонок формируются автоматически по описанию метаданны
 * - Программное изменение состава строк и значений в полях строк синхронно отображается в элементе управления
 * - Редактирование в элементе управления синхронно изменяет свойства табличной части связанного объекта
 *
 * Особенность dhtmlx: экземпляр создаётся не конструктором, а функцией `attachTabular` (без `new`) и размещается в ячейке dhtmlXCellObject
 *
 * @class OTabular
 * @param attr
 * @param attr.parent {HTMLElement} - контейнер, в котором будет размещен элемент
 * @param attr.obj {DataObj} - ссылка на редактируемый объект
 * @param attr.ts {String} - имя табличной части
 * @param [attr.metadata] {Object} - описание метаданных табличной части. Если не указано, описание запрашивается у объекта
 * @param [attr.selection] {Object} - в ключах имена полей, в значениях значения фильтра или объект {like: "значение"} или {not: значение}
 * @constructor
 * @menuorder 53
 * @tooltip Редактор таличной части
 */
dhtmlXCellObject.prototype.attachTabular = function(attr) {

	var _obj = attr.obj,
		_tsname = attr.ts,
		_ts = _obj[_tsname],
		_mgr = _obj._manager,
		_meta = attr.metadata || _mgr.metadata().tabular_sections[_tsname].fields,
		_cell = this,
		_source = attr.ts_captions || {},
    _input_filter = "",
    _input_filter_changed = 0,
		_selection = attr.selection || {};

	if(!attr.ts_captions && !_md.ts_captions(_mgr.class_name, _tsname, _source)){
    return;
  }

  _selection.filter_selection = filter_selection;

	var _grid = this.attachGrid(),
		_toolbar = this.attachToolbar(),
		_destructor = _grid.destructor,
		_pwnd = {
			// обработчик выбора ссылочных значений из внешних форм, открываемых полями со списками
			on_select: function (selv) {
				tabular_on_edit(2, null, null, selv);
			},
			pwnd: attr.pwnd || _cell,
			is_tabular: true
		};
	_grid.setDateFormat("%d.%m.%Y %H:%i");
	_grid.enableAccessKeyMap();

	/**
	 * добавляет строку табчасти
	 */
	_grid._add_row = function(){
		if(!attr.read_only && !attr.disable_add_del){

			var proto;
			if(_selection){
				for(var sel in _selection){
					if(!_meta[sel] || (typeof _selection[sel] == 'function') || (typeof _selection[sel] == 'object' && !$p.is_data_obj(_selection[sel]))){
						continue;
					}
					if(!proto){
						proto = {};
					}
					proto[sel] = _selection[sel];
				}
			}

			var row = _ts.add(proto);

			if(_mgr.handle_event(_obj, "add_row",
					{
						tabular_section: _tsname,
						grid: _grid,
						row: row,
						wnd: _pwnd.pwnd
					}) === false)
				return;

			setTimeout(function () {
				_grid.selectRowById(row.row);
			}, 100);
		}
	};

  _grid._move_row = function(direction){
    if(attr.read_only){
      return;
    }
    const r0 = get_sel_index();

    if(r0 != undefined){
      const r1 = get_sel_index(true, direction);

      if(direction == "up"){
        if(r0 >= 0 && r1 >= 0){
          _ts.swap(r1, r0);
          setTimeout(() => _grid.selectRow(r1, true), 100)
        }
      }
      else{
        if(r0 < _ts.count() && r1 < _ts.count()){
          _ts.swap(r0, r1);
          setTimeout(() => _grid.selectRow(r1, true), 100)
        }
      }
    }
  }

	/**
	 * удаляет строку табчасти
	 */
	_grid._del_row = function(keydown){

		if(!attr.read_only && !attr.disable_add_del){
			const rId = get_sel_index();

			if(rId != undefined){
				if(_mgr.handle_event(_obj, "del_row",
						{
							tabular_section: _tsname,
							grid: _grid,
							row: rId,
							wnd: _pwnd.pwnd
						}) === false)
					return;

				_ts.del(rId);

				setTimeout(function () {
					_grid.selectRowById(rId < _ts.count() ? rId + 1 : rId, true);
				}, 100);
			}
		}
	};


	function get_sel_index(silent, direction){
    let selId = parseFloat(_grid.getSelectedRowId());

		if(!isNaN(selId)){

      if(direction == "up"){
        selId -= 1;
        while (!_grid.getRowById(selId) && selId >= 0) {
          selId -= 1;
        }
      }
      else if(direction){
        selId += 1;
        while (!_grid.getRowById(selId) && selId < _ts.count()) {
          selId += 1;
        }
      }

      return direction ? ((_grid.getRowById(selId) || undefined) && selId - 1) : (selId - 1);
    }

		if(!silent){
      const {_metadata} = _obj;
      const _tssynonym = (typeof _metadata == 'function' ? _metadata.call(_obj, _tsname) : _metadata.tabular_sections[_tsname]).synonym;
      $p.msg.show_msg({
        type: "alert-warning",
        text: $p.msg.no_selected_row.replace("%1", _tssynonym || _tsname),
        title: (_meta.obj_presentation || _meta.synonym) + ': ' + _obj.presentation
      });
    }
	}


	/**
	 * обработчик изменения значения примитивного типа
	 */
	function tabular_on_edit(stage, rId, cInd, nValue, oValue){

		if(stage != 2 || nValue == oValue)
			return true;

		var cell_field = _grid.get_cell_field();
		if(!cell_field){
      return true;
    }
		var	ret_code = _mgr.handle_event(_obj, "value_change", {
				field: cell_field.field,
				value: nValue,
				tabular_section: _tsname,
				grid: _grid,
				row: cell_field.obj,
				cell: (rId && cInd) ? _grid.cells(rId, cInd) : (_grid.getSelectedCellIndex() >=0 ? _grid.cells() : null),
				wnd: _pwnd.pwnd
			});

		if(typeof ret_code !== "boolean"){
			cell_field.obj[cell_field.field] = nValue;
			ret_code = true;
		}
		return ret_code;
	}

	/**
	 * наблюдатель за изменениями строк табчасти
	 * @param changes
	 */
	function listener_rows(obj, fields){
		if(_obj === obj && fields[_tsname] && _grid.clearAll){
      _ts.sync_grid(_grid, _selection);
		}
	}

	/**
	 * наблюдатель за изменениями значений в строках табчасти
	 * @param changes
	 */
	function listener(obj, fields){
	  if(obj._owner !== _ts){
	    return;
    }
    const {row} = obj;
    if(_grid.getSelectedRowId() != row)
      _ts.sync_grid(_grid, _selection);
    else{
      const cc = _grid.getColumnCount();
      for(let i = 0; i < cc; i++){
        if(!_grid.isColumnHidden(i)){
          const val = obj[_grid.getColumnId(i)];
          if(typeof val != "boolean"){
            _grid.cells(row, i).setCValue(val.toString());
          }
        }
      }
    }
	}

	function onpaste(e) {

		if(e.clipboardData.types.indexOf('text/plain') != -1){
			try{
				$p.eve.callEvent("tabular_paste", [{
					obj: _obj,
					grid: _grid,
					tsname: _tsname,
					e: e,
					data: e.clipboardData.getData('text/plain')
				}]);

			}catch(e){
				return;
			}
		}
	}

  function filter_selection(row) {

	  if(!_input_filter){
	    return true;
    }

    var res;
    _source.fields.some(function (fld) {
      var v = row._row[fld];
      if($p.utils.is_data_obj(v)){
        if(!v.is_new() && v.presentation.match(_input_filter)){
          return res = true;
        }
      }
      else if(typeof v == 'number'){
        return res = v.toLocaleString().match(_input_filter);
      }
      else if(v instanceof Date){
        return res = $p.moment(v).format($p.moment._masks.date_time).match(_input_filter);
      }
      else if(v.match){
        return res = v.match(_input_filter);
      }
    })
    return res;
  }

	function filter_change() {

    if(_input_filter_changed){
      clearTimeout(_input_filter_changed);
      _input_filter_changed = 0;
    }

    if(_input_filter != _cell.input_filter.value){
      _input_filter = new RegExp(_cell.input_filter.value, 'i');
      listener_rows(_obj, {[_tsname]: true});
    }

  }

  function filter_click() {
    var val = _cell.input_filter.value;
    setTimeout(function () {
      if(val != _cell.input_filter.value)
        filter_change();
    })
  }

  function filter_keydown() {

    if(_input_filter_changed){
      clearTimeout(_input_filter_changed);
    }

    _input_filter_changed = setTimeout(function () {
      if(_input_filter_changed)
        filter_change();
    }, 500);

  }

	// панель инструментов табличной части
	_toolbar.setIconsPath(dhtmlx.image_path + 'dhxtoolbar' + dhtmlx.skin_suffix());
	_toolbar.loadStruct(attr.toolbar_struct || $p.injected_data["toolbar_add_del.xml"], function(){

    this.forEachItem(function(id) {
      if(id == "input_filter"){
        _cell.input_filter = _toolbar.getInput(id);
        _cell.input_filter.onchange = filter_change;
        _cell.input_filter.onclick = filter_click;
        _cell.input_filter.onkeydown = filter_keydown;
        _cell.input_filter.type = "search";
        _cell.input_filter.setAttribute("placeholder", "Фильтр");
      }
    })

		this.attachEvent("onclick", function(btn_id){

			switch(btn_id) {

				case "btn_add":
					_grid._add_row();
					break;

				case "btn_delete":
					_grid._del_row();
					break;

        case "btn_up":
          _grid._move_row("up");
          break;

        case "btn_down":
          _grid._move_row("down");
          break;

      case "btn_csv":
        _ts.export("csv");
        break;

      case "btn_json":
        _ts.export("json");
        break;

      case "btn_xls":
        _ts.export("xls");
        break;
			}

		});
	});

	// поле фильтра в панели инструментов

	// собственно табличная часть
	_grid.setIconsPath(dhtmlx.image_path);
	_grid.setImagePath(dhtmlx.image_path);
	_grid.setHeader(_source.headers);
	if(_source.min_widths)
		_grid.setInitWidths(_source.widths);
	if(_source.min_widths)
		_grid.setColumnMinWidth(_source.min_widths);
	if(_source.aligns)
		_grid.setColAlign(_source.aligns);
	_grid.setColSorting(_source.sortings);
	_grid.setColTypes(_source.types);
	_grid.setColumnIds(_source.fields.join(","));
	_grid.enableAutoWidth(true, 1200, 600);
	_grid.enableEditTabOnly(true);
	if(attr.footer){
	  for(var fn in attr.footer){
      fn !== 'columns' && (_grid[fn] = attr.footer[fn]);
    }
    _grid.attachFooter(attr.footer.columns);
  }
	_grid.init();

	// гасим кнопки, если ro
	if(attr.read_only || attr.disable_add_del){
	  if(attr.read_only){
      _grid.setEditable(false);
    }
		_toolbar.forEachItem(function (name) {
			if(["btn_add", "btn_delete"].indexOf(name) != -1)
				_toolbar.disableItem(name);
		});
	}

  // добавляем кнопки сортировки, если reorder
	if(attr.reorder){
    var pos = _toolbar.getPosition("btn_delete");
    if(pos){
      _toolbar.addSeparator("sep_up", pos+1);
      _toolbar.addButton("btn_up", pos+2, '<i class="fa fa-arrow-up fa-fw"></i>');
      _toolbar.addButton("btn_down", pos+3, '<i class="fa fa-arrow-down fa-fw"></i>');
      _toolbar.setItemToolTip("btn_up", "Переместить строку вверх");
      _toolbar.setItemToolTip("btn_down", "Переместить строку вниз");
    }
  }

	_grid.__define({

    _obj: {
      get: function () {
        return _obj;
      }
    },

		selection: {
			get: function () {
				return _selection;
			},
			set: function (sel) {
				_selection = sel;
        listener_rows(_obj, {[_tsname]: true});
			}
		},

		destructor: {
			value: function () {

			  if(_mgr){
          _mgr.off('update', listener);
          _mgr.off('rows', listener_rows);
        }

				_obj = null;
				_ts = null;
				_meta = null;
				_mgr = null;
				_pwnd = null;
        _cell.detachToolbar && _cell.detachToolbar();
        _grid.entBox && _grid.entBox.removeEventListener("paste", onpaste);
				_destructor.call(_grid);
			}
		},

		get_cell_field: {
			value: function () {

				if(_ts){

					var rindex = get_sel_index(true),
						cindex = _grid.getSelectedCellIndex(),
						row, col;

					if(rindex != undefined){
						row = _ts.get(rindex);

					}else if(_grid._last){
						row = _ts.get(_grid._last.row);
					}

					if(cindex >=0){
						col = _grid.getColumnId(cindex);
					}else if(_grid._last){
						col = _grid.getColumnId(_grid._last.cindex);
					}

					if(row && col){
						return {obj: row, field: col, metadata: _meta[col]}._mixin(_pwnd);
					}

				}
			}
		},

		refresh_row: {
			value: function (row) {
				_grid.selectRowById(row.row);
				_grid.forEachCell(row.row, function(cellObj,ind){
					var val = row[_grid.getColumnId(ind)];
					cellObj.setCValue($p.utils.is_data_obj(val) ? val.presentation : val);
				});
			}
		}
	});

	_grid.attachEvent("onEditCell", tabular_on_edit);

  _grid.attachEvent("onCheck", function(rId,cInd,state){
    _grid.selectCell(rId-1, cInd);
    tabular_on_edit(2, rId, cInd, state);
  });

	_grid.attachEvent("onRowSelect", function(rid,ind){
		if(_ts){
			_grid._last = {
				row: rid-1,
				cindex: ind
			}
		}
	});

  _grid.attachEvent("onHeaderClick", function(ind,obj){

    var field = _source.fields[ind];
    if(_grid.disable_sorting || field == 'row'){
      return;
    }
    if(!_grid.sort_fields){
      _grid.sort_fields = [];
      _grid.sort_directions = [];
    }

    // есть ли уже такая колонка
    var index = _grid.sort_fields.indexOf(field);

    function add_field() {
      if(index == -1){
        _grid.sort_fields.push(field);
        _grid.sort_directions.push("asc");
      }
      else{
        if(_grid.sort_directions[index] == "asc"){
          _grid.sort_directions[index] = "desc";
        }
        else{
          _grid.sort_directions[index] = "asc";
        }
      }
    }

    // если кликнули с шифтом - добавляем
    if(window.event && window.event.shiftKey){
      add_field();
    }
    else{
      if(index == -1){
        _grid.sort_fields.length = 0;
        _grid.sort_directions.length = 0;
      }
      add_field();
    }

    _ts.sort(_grid.sort_fields.map(function (field, index) {
      return field + " " + _grid.sort_directions[index];
    }));

    _ts.sync_grid(_grid);

    for(var col = 0; col < _source.fields.length; col++){
      var field = _source.fields[col];
      var index = _grid.sort_fields.indexOf(field);
      if(index == -1){
        _grid.setSortImgState(false, col);
      }
      else{
        _grid.setSortImgState(true, col, _grid.sort_directions[index]);
        setTimeout(function () {
          if(_grid && _grid.sortImg){
            _grid.sortImg.style.display="inline";
          }
        }, 200);
        break;
      }
    }
  });

	// заполняем табчасть данными
  listener_rows(_obj, {[_tsname]: true});

	// начинаем следить за объектом и, его табчастью допреквизитов
  _mgr.on({
    update: listener,
    rows: listener_rows,
  });

	// начинаем следить за буфером обмена
	_grid.entBox.addEventListener('paste', onpaste);

	return _grid;
};


/**
 * ### Виджет элементов фильтра для панели инструментов форм списка и выбора
 * объединяет поля выбора периода и поле ввода фильтра
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 *
 * @module  widgets
 * @submodule wdg_filter
 * @requires common
 */

/**
 * Виджет для панели инструментов форм списка и выбора,
 * объединяет поля выбора периода и поле ввода фильтра
 * @param attr {Object} - параметры создаваемого виджета
 * @param attr.manager {DataManager}
 * @param attr.toolbar {dhtmlXToolbarObject}
 * @param [attr.pos=7] {Number} - номер элемента на тулбаре, после которого вставлять виджет
 * @param [attr.date_from]
 * @param [attr.date_till]
 * @constructor
 * @menuorder 57
 * @tooltip Фильтр динсписка
 */
$p.iface.Toolbar_filter = function Toolbar_filter(attr) {

	var t = this,
		input_filter_changed = 0,
		input_filter_width = $p.job_prm.device_type == "desktop" ? 200 : 120,
		custom_selection = {};

	if(!attr.pos)
		attr.pos = 6;

	t.__define({

		custom_selection: {
			get: function () {
				return custom_selection;
			}
		},

		toolbar: {
			get: function () {
				return attr.toolbar;
			}
		},

		call_event: {
			value: function () {

				if(input_filter_changed){
					clearTimeout(input_filter_changed);
					input_filter_changed = 0;
				}

				attr.onchange.call(t, t.get_filter());
			}
		}

	});

  function onkeydown() {

    if(input_filter_changed) {
      clearTimeout(input_filter_changed);
    }

    if(!t.disable_timer) {
      input_filter_changed = setTimeout(function () {
        input_filter_changed && t._prev_input_filter != t.input_filter.value && t.call_event();
      }, 750);
    }

  }

  // заготовка для адаптивного фильтра
	t.toolbar.addText("div_filter", attr.pos, "");
	t.div = t.toolbar.objPull[t.toolbar.idPrefix + "div_filter"];
	attr.pos++;

	// Поля ввода периода
	if(attr.manager instanceof DocManager || attr.manager instanceof BusinessProcessManager || attr.manager instanceof TaskManager || attr.period){

		// TODO: подключить вместо календарей daterangepicker

		// управляем доступностью дат в миникалендаре
		function set_sens(inp, k) {
			if (k == "min")
				t.сalendar.setSensitiveRange(inp.value, null);
			else
				t.сalendar.setSensitiveRange(null, inp.value);
		}

		input_filter_width = $p.job_prm.device_type == "desktop" ? 160 : 120;

		t.toolbar.addInput("input_date_from", attr.pos, "", $p.job_prm.device_type == "desktop" ? 78 : 72);
		attr.pos++;
		t.toolbar.addText("lbl_date_till", attr.pos, "-");
		attr.pos++;
		t.toolbar.addInput("input_date_till", attr.pos, "", $p.job_prm.device_type == "desktop" ? 78 : 72);
		attr.pos++;

		t.input_date_from = t.toolbar.getInput("input_date_from");
		//t.input_date_from.setAttribute("readOnly", "true");
		t.input_date_from.onclick = function(){ set_sens(t.input_date_till,"max"); };

		t.input_date_till = t.toolbar.getInput("input_date_till");
		//t.input_date_till.setAttribute("readOnly", "true");
		t.input_date_till.onclick = function(){ set_sens(t.input_date_from,"min"); };

		// подключаем календарь к инпутам
		t.сalendar = new dhtmlXCalendarObject([t.input_date_from, t.input_date_till]);
		t.сalendar.attachEvent("onclick", t.call_event);

		// начальные значения периода
		if(!attr.date_from)
			attr.date_from = new Date((new Date()).getFullYear().toFixed() + "-01-01");
		if(!attr.date_till)
			attr.date_till = $p.utils.date_add_day(new Date(), 1);
		t.input_date_from.value=$p.moment(attr.date_from).format("L");
		t.input_date_till.value=$p.moment(attr.date_till).format("L");

		// для документов, кешируемых в doc, добавляем фильтрацию по индексу
		if(attr.manager.cachable == "doc" && !attr.custom_selection){

			custom_selection._view = {
				get value(){
					return 'doc/by_date';
				}
			};
			custom_selection._key = {
				get value(){
					var filter = t.get_filter(true);
					return {
						startkey: [attr.manager.class_name, filter.date_from.getFullYear(), filter.date_from.getMonth()+1, filter.date_from.getDate()],
						endkey: [attr.manager.class_name, filter.date_till.getFullYear(), filter.date_till.getMonth()+1, filter.date_till.getDate()],
						_drop_date: true,
						_order_by: true,
						_search: filter.filter.toLowerCase()
					};
				}
			};
		}
	}

	// текстовое поле фильтра по подстроке
	if(!attr.hide_filter){

		t.toolbar.addSeparator("filter_sep", attr.pos);
		attr.pos++;

		t.toolbar.addInput("input_filter", attr.pos, "", input_filter_width);
		t.input_filter = t.toolbar.getInput("input_filter");
		t.input_filter.onchange = function () {
		  t._prev_input_filter != t.input_filter.value && t.call_event();
    };
		t.input_filter.onclick = function () {
			var val = t.input_filter.value;
			setTimeout(function () {
				if(val != t.input_filter.value)
					t.call_event();
			})
		};
		t.input_filter.onkeydown = onkeydown;
		t.input_filter.type = "search";
		t.input_filter.setAttribute("placeholder", "Фильтр");
		if(attr.filter) {
      t.input_filter.value = attr.filter;
    }

		t.toolbar.addSpacer("input_filter");

	}
  else if(t.input_date_till) {
    t.toolbar.addSpacer("input_date_till");
  }
  else {
    t.toolbar.addSpacer('div_filter');
  }

};

$p.iface.Toolbar_filter.prototype.__define({

	get_filter: {
		value: function (exclude_custom) {

		  if(this.input_filter){
        this._prev_input_filter = this.input_filter.value;
      }

			var res = {
        date_from: this.input_date_from ? $p.utils.date_add_day(dhx4.str2date(this.input_date_from.value), 0, true) : "",
        date_till: this.input_date_till ? $p.utils.date_add_day(dhx4.str2date(this.input_date_till.value), 0, true) : "",
        filter: this.input_filter ? this.input_filter.value : ""
			}, fld, flt;

			if(!exclude_custom){
				for(fld in this.custom_selection){
          if (!this.custom_selection[fld] || !this.custom_selection[fld].value) continue;
          if(!res.selection) res.selection = [];
					flt = {};
					flt[fld] = this.custom_selection[fld].value;
					res.selection.push(flt);
				}
			}

			return res;
		}
	},

	add_filter: {
		value: function (elm) {
			var pos = this.toolbar.getPosition("input_filter") - 2,
				id = dhx4.newId(),
				width = (this.toolbar.getWidth("input_filter") / 2).round(0);
			this.toolbar.setWidth("input_filter", width);
			this.toolbar.addText("lbl_"+id, pos, elm.text || "");
			pos++;
			this.toolbar.addInput("input_"+id, pos, "", width);
			this.custom_selection[elm.name] = this.toolbar.getInput("input_"+id);
			return this;
		}
	}

});

/**
 * Формы визуализации и изменения параметров объекта
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 *
 * @module common
 * @submodule wnd_dat
 */


/**
 * Форма dat - шаблон окна инструментов
 */
$p.iface.dat_blank = function(_dxw, attr) {

	// TODO: реализовать undock для аккордиона

	if(!attr)
		attr = {};

	var wnd_dat = (_dxw || $p.iface.w).createWindow({
		id: dhx4.newId(),
		left: attr.left || 700,
		top: attr.top || 20,
		width: attr.width || 220,
		height: attr.height || 300,
		move: true,
		park: !attr.allow_close,
		center: !!attr.center,
		resize: true,
		caption: attr.caption || "Tools"
	});

	// если окно не помещается в области - двигаем
	var _dxw_area = {
		x: (_dxw || $p.iface.w).vp.clientWidth,
		y: (_dxw || $p.iface.w).vp.clientHeight
	}, _move;

	if(wnd_dat.getPosition()[0] + wnd_dat.getDimension()[0] > _dxw_area.x){
		_dxw_area.x = _dxw_area.x - wnd_dat.getDimension()[0];
		_move = true;
	}else
		_dxw_area.x = wnd_dat.getPosition()[0];

	if(wnd_dat.getPosition()[1] + wnd_dat.getDimension()[1] > _dxw_area.y){
		_dxw_area.y = _dxw_area.y - wnd_dat.getDimension()[1];
		_move = true;
	}else
		_dxw_area.y = wnd_dat.getPosition()[1];

	if(_move){
		if(_dxw_area.x<0 || _dxw_area.y<0)
			wnd_dat.maximize();
		else
			wnd_dat.setPosition(_dxw_area.x, _dxw_area.y);
	}

	_dxw = null;

	if(attr.hasOwnProperty('allow_minmax') && !attr.allow_minmax)
		wnd_dat.button('minmax').hide();

	if(attr.allow_close)
		wnd_dat.button('park').hide();
	else
		wnd_dat.button('close').hide();

	// обработчик при закрытии - анализируем модальность
	wnd_dat.attachEvent("onClose", function () {

		var allow_close = typeof attr.on_close == "function" ? attr.on_close(wnd_dat) : true;

		if(allow_close){

			// восстанавливаем модальность родительского окна
			if(attr.pwnd_modal && attr.pwnd && attr.pwnd.setModal)
				attr.pwnd.setModal(1);

			return allow_close;
		}

	});

	wnd_dat.setIconCss('without_icon');
	wnd_dat.cell.parentNode.children[1].classList.add('dat_gui');

	$p.iface.bind_help(wnd_dat, attr.help_path);

	wnd_dat.elmnts = {grids: {}};

	wnd_dat.wnd_options = function (options) {
		var pos = wnd_dat.getPosition(),
			sizes = wnd_dat.getDimension(),
			parked = wnd_dat.isParked();
		options.left = pos[0];
		options.top = pos[1];
		options.width = sizes[0];
		options.parked = parked;
		if(!parked)
			options.height = sizes[1];

	};

	wnd_dat.bottom_toolbar = function(oattr){

		var attr = ({
				wrapper: wnd_dat.cell,
				width: '100%',
				height: '28px',
				bottom: '0px',
				left: '0px',
				name: 'tb_bottom',
				buttons: [
					{name: 'btn_cancel', text: 'Отмена', title: 'Закрыть без сохранения', width:'60px', float: 'right'},
					{name: 'btn_ok', b: 'Ок', title: 'Применить изменения', width:'30px', float: 'right'}
				],
				onclick: function (name) {
					return false;
				}
			})._mixin(oattr),

			tb_bottom = new OTooolBar(attr),
			sbar = wnd_dat.attachStatusBar({height: 12});
		sbar.style.zIndex = -1000;
		sbar.firstChild.style.backgroundColor = "transparent";
		sbar.firstChild.style.border = "none";
		return tb_bottom;
	};

	if(attr.modal){
		if(attr.pwnd && attr.pwnd.setModal){
			attr.pwnd_modal = attr.pwnd.isModal();
			attr.pwnd.setModal(0);
		}
		wnd_dat.setModal(1);
	}

	return wnd_dat;
};



/**
 * обработчик выбора значения в свойствах (ссылочные типы)
 * вызывается в контексте this = pgrid
 * @param selv {*} выбранное значение
 */
$p.iface.pgrid_on_select = function(selv){

	if(selv===undefined)
		return;

	var pgrid = this.grid instanceof dhtmlXGridObject ? this.grid : this,
		source = pgrid.getUserData("", "source"),
		f = pgrid.getSelectedRowId();

	if(source.o[f] != undefined){
		if(typeof source.o[f] == "number")
			source.o[f] = $p.utils.fix_number(selv, true);
		else
			source.o[f] = selv;

	}else if(f.indexOf("fprms") > -1){
		var row = $p._find(source.o.fprms, f.split("|")[1]);
		row.value = selv;
	}

	pgrid.cells().setValue($p.utils.is_data_obj(selv) ? selv.presentation : selv || "");


	if(source.grid_on_change)
		source.grid_on_change.call(pgrid, f, selv);
};

/**
 * обработчик изменения значения в свойствах (примитивные типы)
 * @param pname {String} - имя измененного свойства
 * @param new_value {*} - новое значение
 * @param old_value {*} - предыдущее значение
 */
$p.iface.pgrid_on_change = function(pname, new_value, old_value){
	if(pname)
		$p.iface.pgrid_on_select.call(this, new_value);
};

/**
 * обработчик изменения флажка в свойствах (bit)
 * @param rId {String} - идентификатор строки
 * @param cInd {Number} - идентификатор колонки
 * @param state {Boolean} - состояние чекбокса
 */
$p.iface.pgrid_on_checkbox = function(rId, cInd, state){

	var pgrid = this.grid instanceof dhtmlXGridObject ? this.grid : this,
		source = pgrid.getUserData("", "source");

	if(source.o[rId] != undefined)
		source.o[rId] = state;

	if(source.grid_on_change)
		source.grid_on_change(rId, state);
};


/**
 * ### Визуальный компонент OTooolBar
 * Панель инструментов рисовалки и альтернативная панель инструментов прочих форм
 * - Гибкое управление размером, положением и выравниванием как самой панели, так и отдельных кнопок
 * - Кнопки и группы кнопок, иконы и текст
 * - Всплывающие подсказки с произвольным html
 *
 * @class OTooolBar
 * @param attr {Object} - параметры создаваемой панели - родитель, положение, размер и ориентация
 * @constructor
 * @menuorder 54
 * @tooltip Командная панель
 */
function OTooolBar(attr){
	var _this = this,
		div = document.createElement('div'),
		offset, popup_focused, sub_focused, btn_focused;

	if(!attr.image_path)
		attr.image_path = dhtmlx.image_path;

	if(attr.hasOwnProperty("class_name"))
		div.className = attr.class_name;
	else
		div.className = 'md_otooolbar';

	_this.cell = div;

	_this.buttons = {};

	function bselect(select){
		for(var i=0; i<div.children.length; i++){
			div.children[i].classList.remove('selected');
		}
		if(select && !this.classList.contains('selected'))
			this.classList.add('selected');
	}

	function popup_hide(){
		popup_focused = false;
		setTimeout(function () {
			if(!popup_focused)
				$p.iface.popup.hide();
		}, 300);
	}

	function btn_click(){
		if(attr.onclick)
			attr.onclick.call(_this, this.name.replace(attr.name + '_', ''), attr.name);
	}

	/**
	 * Добавляет кнопку на панель инструментов
	 * @method add
	 * @param battr {Object} - атрибуты создаваемой кнопки
	 */
	this.add = function(battr){

		var bdiv = $p.iface.add_button(div, attr, battr);

		bdiv.onclick = btn_click;

		bdiv.onmouseover = function(){
			if(battr.title && !battr.sub){
				popup_focused = true;

				$p.iface.popup.clear();
				$p.iface.popup.attachHTML(battr.title);
				$p.iface.popup.show(dhx4.absLeft(bdiv), dhx4.absTop(bdiv), bdiv.offsetWidth, bdiv.offsetHeight);

				$p.iface.popup.p.onmouseover = function(){
					popup_focused = true;
				};

				$p.iface.popup.p.onmouseout = popup_hide;

				if(attr.on_popup)
					attr.on_popup($p.iface.popup, bdiv);
			}
		};

		bdiv.onmouseout = popup_hide;

		_this.buttons[battr.name] = bdiv;

		if(battr.sub){

			function remove_sub(parent){
				if(!parent)
					parent = bdiv;
				if(parent.subdiv && !sub_focused && !btn_focused){
					while(parent.subdiv.firstChild)
						parent.subdiv.removeChild(parent.subdiv.firstChild);
					parent.subdiv.parentNode.removeChild(parent.subdiv);
					parent.subdiv = null;
				}
			}

			bdiv.onmouseover = function(){

				// нужно погасить сабдивы соседей
				for(var i=0; i<bdiv.parentNode.children.length; i++){
					if(bdiv.parentNode.children[i] != bdiv && bdiv.parentNode.children[i].subdiv){
						remove_sub(bdiv.parentNode.children[i]);
						break;
					}
				}

				btn_focused = true;

				if(!this.subdiv){
					this.subdiv = document.createElement('div');
					this.subdiv.className = 'md_otooolbar';
					offset = $p.iface.get_offset(bdiv);
					if(battr.sub.align == 'right') {
            this.subdiv.style.left = (offset.left + bdiv.offsetWidth - (parseInt(battr.sub.width.replace(/\D+/g,"")) || 56)) + 'px';
          }
					else if(battr.sub.align == 'hor') {
            this.subdiv.style.left = offset.left + bdiv.offsetWidth + 'px';
          }
					else{
            this.subdiv.style.left = offset.left + 'px';
          }
					this.subdiv.style.top = (offset.top + (battr.sub.align == 'hor' ? 0 : div.offsetHeight)) + 'px';
					this.subdiv.style.height = battr.sub.height || '198px';
					this.subdiv.style.width = battr.sub.width || '56px';
					for(var i in battr.sub.buttons){
						var bsub = $p.iface.add_button(this.subdiv, attr, battr.sub.buttons[i]);
						bsub.onclick = btn_click;
					}
					attr.wrapper.appendChild(this.subdiv);

					this.subdiv.onmouseover = function () {
						sub_focused = true;
					};

					this.subdiv.onmouseout = function () {
						sub_focused = false;
						setTimeout(remove_sub, 500);
					};

					if(battr.title)
						$p.iface.popup.show(dhx4.absLeft(this.subdiv), dhx4.absTop(this.subdiv), this.subdiv.offsetWidth, this.subdiv.offsetHeight);
				}

			};

			bdiv.onmouseout = function(){
				btn_focused = false;
				setTimeout(remove_sub, 500);
			}
		}
	};

	/**
	 * Выделяет кнопку по событию mouseover и снимает выделение с остальных кнопок
	 * @method select
	 * @param name {String} - имя текущей кнопки
	 */
	this.select = function(name){
		for(var i=0; i<div.children.length; i++){
			var btn = div.children[i];
			if(btn.name == attr.name + '_' + name){
				bselect.call(btn, true);
				return;
			}
		}
	};

	/**
	 * Возвращает имя выделенной кнопки
	 */
	this.get_selected = function () {
		for(var i=0; i<div.children.length; i++){
			var btn = div.children[i];
			if(btn.classList.contains('selected'))
				return btn.name;
		}
	};

	/**
	 * Деструктор объекта
	 * @method unload
	 */
	this.unload = function(){
		while(div.firstChild)
			div.removeChild(div.firstChild);
		attr.wrapper.removeChild(div);
	};


	attr.wrapper.appendChild(div);
	div.style.width = attr.width || '28px';
	div.style.height = attr.height || '150px';
	div.style.position = 'absolute';

	if(attr.top) div.style.top = attr.top;
	if(attr.left) div.style.left = attr.left;
	if(attr.bottom) div.style.bottom = attr.bottom;
	if(attr.right) div.style.right = attr.right;
	if(attr.paddingRight) div.style.paddingRight = attr.paddingRight;
	if(attr.paddingLeft) div.style.paddingLeft = attr.paddingLeft;

	if(attr.buttons)
		attr.buttons.forEach(function(battr){
			_this.add(battr);
		});

};
$p.iface.OTooolBar = OTooolBar;

/**
 * Добавляет кнопку на панель инструментов
 * @method add_button
 * @for InterfaceObjs
 * @param parent {Element}
 * @param attr {Object}
 * @param battr {Object}
 * @returns {Element}
 */
$p.iface.add_button = function(parent, attr, battr) {
	var bdiv = document.createElement('div'), html = '';
	bdiv.name = (attr ? attr.name + '_' : '') + battr.name;
	parent.appendChild(bdiv);

	// если имя начинается с sep_ - это разделитель
	bdiv.className = (battr.name.indexOf("sep_") == 0) ? 'md_otooolbar_sep' : 'md_otooolbar_button';
	if(battr.hasOwnProperty("class_name"))
		bdiv.classList.add(battr.class_name);

	if(battr.img)
		html = '<img src="' + (attr ? attr.image_path : '') + battr.img + '">';
	if(battr.b)
		html +='<b style="vertical-align: super;"> ' + battr.b + '</b>';
	else if(battr.text)
		html +='<span style="vertical-align: super;"> ' + battr.text + '</span>';
	else if(battr.css){
    battr.css.split(' ').forEach(function (s) {
      s && bdiv.classList.add(s);
    });
  }
	bdiv.innerHTML = html;

	if(battr.float) bdiv.style.float = battr.float;
	if(battr.clear) bdiv.style.clear = battr.clear;
	if(battr.width) bdiv.style.width = battr.width;
	if(battr.paddingRight) bdiv.style.paddingRight = battr.paddingRight;
	if(battr.paddingLeft) bdiv.style.paddingLeft = battr.paddingLeft;

	if(battr.tooltip)
		bdiv.title = battr.tooltip;

	return bdiv;
};

/**
 * Форма абстрактного объекта данных {{#crossLink "DataObj"}}{{/crossLink}}, в том числе, записей регистров
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 *
 * @module metadata
 * @submodule wnd_obj
 */


/**
 * ### Форма объекта данных
 * По умолчанию, форма строится автоматически по описанию метаданных.<br />
 * Метод можно переопределить для конкретного менеджера
 *
 * @method form_obj
 * @for DataManager
 * @param pwnd {dhtmlXWindows} - указатель на родительскую форму
 * @param attr {Object|DataObj|String} - параметры инициализации формы
 */
DataManager.prototype.form_obj = function(pwnd, attr){

	var _mgr = this,
		_meta = _mgr.metadata(),
		o = attr.o,
		wnd, options, created, create_id, _title;

	/**
	 * ПриСозданииНаСервере - инициализация при создании формы, до чтения объекта
	 */
	function frm_create(){

		if(created)
			return;

		// создаём и настраиваем окно формы
		if((pwnd instanceof dhtmlXLayoutCell || pwnd instanceof dhtmlXSideBarCell || pwnd instanceof dhtmlXCarouselCell)
			&& (attr.bind_pwnd || attr.Приклеить)) {
			// форма объекта приклеена к области контента или другой форме
			if(typeof pwnd.close == "function")
				pwnd.close(true);
			wnd = pwnd;
			wnd.close = function (on_create) {
				var _wnd = wnd || pwnd;

				if(on_create || check_modified()){

					if(_wnd){

						// выгружаем попапы
						if(_wnd.elmnts)
							["vault", "vault_pop"].forEach(function (elm) {
								if (_wnd.elmnts[elm] && _wnd.elmnts[elm].unload)
									_wnd.elmnts[elm].unload();
							});

						// информируем мир о закрытии формы
						if(_mgr && _mgr.class_name)
							$p.eve.callEvent("frm_close", [_mgr.class_name, (o && o._obj ? o.ref : "")]);

						if(_wnd.conf){
							_wnd.detachToolbar();
							_wnd.detachStatusBar();
							_wnd.conf.unloading = true;
							_wnd.detachObject(true);
						}
					}
					frm_unload(on_create);

				}
			};
			wnd.elmnts = {grids: {}};

		}else{
			// форма в модальном диалоге
			options = {
				name: 'wnd_obj_' + _mgr.class_name,
				wnd: {
					top: 80 + Math.random()*40,
					left: 120 + Math.random()*80,
					width: 700,
					height: 400,
					modal: true,
					center: false,
					pwnd: pwnd,
					allow_close: true,
					allow_minmax: true,
					on_close: frm_close,
					caption: (_meta.obj_presentation || _meta.synonym)
				}
			};
			wnd = $p.iface.dat_blank(null, options.wnd);
		}

		if(!wnd.ref)
			wnd.__define({

				/**
				 * Возвращает ссылку текущего объекта
				 */
				ref: {
					get: function(){
						return o ? o.ref : $p.utils.blank.guid;
					},
					enumerable: false,
					configurable: true
				},

				/**
				 * Обновляет текст заголовка формы
				 */
				set_text: {
					value: function(force) {
						if(attr && attr.set_text || wnd && wnd.setText){

							var title = o.presentation;

							if(!title)
								return;

							if(o instanceof CatObj){
                title = (_meta.obj_presentation || _meta.synonym) + ': ' + title;
              }

							if(force || _title !== title){
								_title = title;
								attr.set_text ? attr.set_text(title) : wnd.setText(title);
							}
						}
					},
					enumerable: false,
					configurable: true
				}
			});

		/**
		 *	Закладки: шапка и табличные части
		 */
		wnd.elmnts.frm_tabs = wnd.attachTabbar({
			arrows_mode: "auto",
			offsets: {
				top: 0,
				right: 0,
				bottom: 0,
				left: 0
			}
		});
		wnd.elmnts.frm_tabs.addTab('tab_header','&nbsp;Реквизиты&nbsp;', null, null, true);
		wnd.elmnts.tabs = {'tab_header': wnd.elmnts.frm_tabs.cells('tab_header')};

		// панель инструментов формы
		wnd.elmnts.frm_toolbar = wnd.attachToolbar();
		wnd.elmnts.frm_toolbar.setIconsPath(dhtmlx.image_path + 'dhxtoolbar' + dhtmlx.skin_suffix());
		wnd.elmnts.frm_toolbar.loadStruct(attr.toolbar_struct || $p.injected_data["toolbar_obj.xml"], function(){

			// если мы приклеены к ячейке, сдвигаем toolbar на 4px
			// if(wnd === pwnd)
			// 	this.cont.style.top = "4px";

			this.addSpacer("btn_unpost");
			this.attachEvent("onclick", attr.toolbar_click || toolbar_click);

			// учтём права для каждой роли на каждый объект
			var _acl = $p.current_user.get_acl(_mgr.class_name);

			if(_mgr instanceof DocManager && _acl.indexOf("p") != -1){
				this.enableItem("btn_post");
				if(!attr.toolbar_struct)
					this.setItemText("btn_save_close", "<b>Провести и закрыть</b>");
			}else
				this.hideItem("btn_post");

			if(_mgr instanceof DocManager && _acl.indexOf("o") != -1)
				this.enableItem("btn_unpost");
			else
				this.hideItem("btn_unpost");


			if(_acl.indexOf("e") == -1){
				this.hideItem("btn_save_close");
				this.disableItem("btn_save");
			}

			if(attr.on_select)
				this.setItemText("btn_save_close", "Записать и выбрать");

			// для ссылочных типов
			if(_mgr instanceof CatManager || _mgr instanceof DocManager){

				// добавляем команды печати
				_mgr.printing_plates().then(function (pp) {
					for(var pid in pp)
						wnd.elmnts.frm_toolbar.addListOption("bs_print", pid, "~", "button", pp[pid].toString());
				});

				// попап для присоединенных файлов
				wnd.elmnts.vault_pop = new dhtmlXPopup({
					toolbar: this,
					id: "btn_files"
				});
				wnd.elmnts.vault_pop.attachEvent("onShow", show_vault);

			}else
				this.disableItem("bs_print");

			// кнопка закрытия для приклеенной формы
			if(wnd != pwnd){
				this.hideItem("btn_close");
			}

		});

		created = true;
	}


	/**
	 * Наблюдатель за изменением объекта
	 * Пока здесь только установка заголовка формы
	 * @param changes
	 */
	function listener(obj, fields) {
		if(wnd && wnd.set_text && ((obj === o) || (obj._owner && obj._owner._owner === o))){
      wnd.set_text();
    }
	}

	/**
	 * ПриЧтенииНаСервере - инициализация при чтении объекта
	 */
	function frm_fill(){

		if(!created){
			clearTimeout(create_id);
			frm_create();
		}

		/**
		 * Устанавливаем текст заголовка формы
		 */
		wnd.set_text();
		if(!attr.hide_header && wnd.showHeader){
      wnd.showHeader();
    }

		/**
		 * закладки табличных частей
		 */
		if(attr.draw_tabular_sections)
			attr.draw_tabular_sections(o, wnd, tabular_init);

		else if(!o.is_folder){
			if(_meta.form && _meta.form.obj && _meta.form.obj.tabular_sections_order)
				_meta.form.obj.tabular_sections_order.forEach(function (ts) {
					tabular_init(ts);
				});

			else
				for(var ts in _meta.tabular_sections){
					if(ts==="extra_fields")
						continue;

					if(o[ts] instanceof TabularSection){
						// настройка табличной части
						tabular_init(ts);
					}
				}
		}

		/**
		 *	закладка шапка
		 */
		if(attr.draw_pg_header)
			attr.draw_pg_header(o, wnd);

		else{

			// учтём права для каждой роли на каждый объект
			var _acl = $p.current_user.get_acl(_mgr.class_name);

			wnd.elmnts.pg_header = wnd.elmnts.tabs.tab_header.attachHeadFields({
				obj: o,
				pwnd: wnd,
				read_only: _acl.indexOf("e") == -1
			});
			wnd.attachEvent("onResizeFinish", function(win){
				wnd.elmnts.pg_header.enableAutoHeight(false, wnd.elmnts.tabs.tab_header._getHeight()-20, true);
			});
		}

		/**
		 * начинаем следить за объектом
		 */
    _mgr.on({
      update: listener,
      rows: listener,
    });


		return {wnd: wnd, o: o};

	}

	/**
	 * обработчик нажатия кнопок командных панелей
	 */
	function toolbar_click(btn_id){
		if(btn_id=="btn_save_close"){
      save("close");
    }
    else if(btn_id=="btn_save"){
      save("save");
    }
    else if(btn_id=="btn_post"){
      save("post");
    }
    else if(btn_id=="btn_unpost"){
      save("unpost");
    }
    else if(btn_id=="btn_close"){
      wnd.close();
    }
    else if(btn_id=="btn_go_connection"){
      go_connection();
    }
    else if(btn_id.substr(0,4)=="prn_"){
      _mgr.print(o, btn_id, wnd);
    }
    else if(btn_id=="btn_import"){
      _mgr.import(null, o);
    }
    else if(btn_id=="btn_export"){
      _mgr.export({items: [o], pwnd: wnd, obj: true} );
    }
	}

	/**
	 * показывает список связанных документов
	 */
	function go_connection(){
		$p.msg.show_not_implemented();
	}

	/**
	 * создаёт и показывает диалог присоединенных файлов
	 */
	function show_vault(){

		if (!wnd.elmnts.vault) {

      wnd.elmnts.vault = wnd.elmnts.vault_pop.attachVault(400, 250, {
        _obj: o,
        buttonClear: false,
        autoStart: true,
        filesLimit: 10,
        mode: 'pouch'
      });
      wnd.elmnts.vault.conf.wnd = wnd;
      wnd.elmnts.vault.attachEvent('onBeforeFileAdd', (file) => {
        if(o && !o._modified && !o.is_new()) {
          return true;
        }
        $p.msg.show_msg({
          type: 'alert-warning',
          text: 'Перед добавлением вложения, выполните команду "Записать"',
          title: 'Документ изменён',
        });
      });
      wnd.elmnts.vault.attachEvent('onBeforeFileRemove', (file) => {
        if(o && !o._modified && !o.is_new()) {
          return true;
        }
        $p.msg.show_msg({
          type: 'alert-warning',
          text: 'Перед удалением вложения, выполните команду "Записать"',
          title: 'Документ изменён',
        });
      });
		}
    handleAddLink();
	}

  function handleAddLink() {

    if(!event?.altKey && !event?.ctrlKey && !event?.shiftKey) {
      return;
    }

    if(!o || o._modified || o.is_new()) {
      $p.msg.show_msg({
        type: 'alert-warning',
        text: 'Перед добавлением вложения, выполните команду "Записать"',
        title: 'Документ изменён',
      });
      return;
    }

    const {ui: {dialogs}, msg}  = $p;

    wnd.elmnts.vault_pop.hide();
    wnd.elmnts.vault.unload();
    wnd.elmnts.vault = null;
    wnd.progressOn();

    dialogs.input_value({
      title: 'Расположение объекта',
      text: 'Укажите url ресурса',
      type: 'string',
      initialValue: '',
    })
      .then((url) => {
        return dialogs.input_value({
          title: 'Название объекта',
          text: 'Наименование ссылки',
          type: 'string',
          initialValue: 'Новая ссылка',
        })
          .then((name) => {
            const type = 'application/internet-shortcut';
            const data = new Blob([`[InternetShortcut]\nURL=${url}`], {type});
            if(!name.endsWith('.url')) {
              name += '.url';
            }
            return o.save_attachment(name, data, type);
          });
      })
      .then(() => o.load())
      .catch((err) => {
        // показываем диалог
        // this.setState({dialog: {
        //     title: msg.file_download,
        //     message: err.message,
        //   }});
      })
      .then(() => wnd.progressOff());

    return true;
  }


	/**
	 * настройка (инициализация) табличной части
	 */
	function tabular_init(name, toolbar_struct, footer){

		// с помощью метода ts_captions(), выясняем, надо ли добавлять данную ТЧ и формируем описание колонок табчасти
		if(!_md.ts_captions(_mgr.class_name, name))
			return;

		// закладка табов табличной части
		wnd.elmnts.frm_tabs.addTab('tab_'+name, '&nbsp;'+_meta.tabular_sections[name].synonym+'&nbsp;');
		wnd.elmnts.tabs['tab_'+name] = wnd.elmnts.frm_tabs.cells('tab_'+name);

		// учтём права для каждой роли на каждый объект
		var _acl = $p.current_user.get_acl(_mgr.class_name);

		wnd.elmnts.grids[name] = wnd.elmnts.tabs['tab_'+name].attachTabular({
			obj: o,
			ts: name,
			pwnd: wnd,
			read_only: _acl.indexOf("e") == -1,
			toolbar_struct,
      footer
		});

		if(_acl.indexOf("e") == -1){
			var tabular = wnd.elmnts.tabs['tab_'+name].getAttachedToolbar();
			tabular.disableItem("btn_add");
			tabular.disableItem("btn_delete");
		}

	}

	/**
	 * действия при записи файла
	 * @param action
	 */
	function save(action){

		wnd.progressOn();

		var post;
		if(o instanceof DocObj){
			if(action == "post")
				post = true;

			else if(action == "unpost")
				post = false;

			else if(action == "close"){
				if($p.current_user.get_acl(_mgr.class_name).indexOf("p") != -1)
					post = true;
			}
		}

		o.save(post)
			.then(function(){

				wnd.progressOff();

				if(action == "close"){
					if(attr.on_select)
						attr.on_select(o);
					wnd.close();

				}else
					wnd.set_text();
			})
			.catch(function(err){
				wnd.progressOff();
				if(err instanceof Error)
					$p.record_log(err);
			});
	}

	/**
	 * освобождает переменные после закрытия формы
	 */
	function frm_unload(on_create){

		if(attr && attr.on_close && !on_create){
      attr.on_close();
    }

		if(!on_create){
		  if(_mgr){
        _mgr.off('update', listener);
        _mgr.off('rows', listener);
      }
      if(wnd){
        delete wnd.ref;
        delete wnd.set_text;
      }
			_mgr = wnd = o = _meta = options = pwnd = attr = null;
		}
	}

	/**
	 * Задаёт вопрос о записи изменений и делает откат при необходимости
	 */
	function check_modified() {
		if(o && o._modified && !wnd.close_confirmed){
			dhtmlx.confirm({
				title: o.presentation,
				text: $p.msg.modified_close,
				cancel: $p.msg.cancel,
				callback: function(btn) {
					if(btn){
            wnd.close_confirmed = true;
						// закрыть изменённый без сохранения - значит прочитать его из pouchdb
						if(o._manager.cachable == "ram"){
              this.close && this.close();
            }
						else{
							if(o.is_new()){
								o.unload();
                this.close && this.close();
							}
							else{
								setTimeout(o.load.bind(o), 100);
                this.close && this.close();
							}
						}
					}
				}.bind(wnd)
			});
			return false;
		}
		return true;
	}

	function frm_close(wnd){

		if(check_modified()){

			setTimeout(frm_unload);

			// выгружаем попапы
			if(wnd && wnd.elmnts)
				["vault", "vault_pop"].forEach(function (elm) {
					if (wnd.elmnts[elm] && wnd.elmnts[elm].unload)
						wnd.elmnts[elm].unload();
				});

			// информируем мир о закрытии формы
			if(_mgr && _mgr.class_name)
				$p.eve.callEvent("frm_close", [_mgr.class_name, (o && o._obj ? o.ref : "")]);

			return true;
		}
	}


	// (пере)создаём статическую часть формы
	create_id = setTimeout(frm_create);

	// читаем объект из локального SQL или получаем с сервера
	if($p.utils.is_data_obj(o)){

		if(o.is_new() && attr.on_select){
      return _mgr.create({}, true)
        .then(function (tObj) {
          o = tObj;
          tObj = null;
          return frm_fill();
        });
    }
		else if(o.is_new() && !o.empty()){
			return o.load()
				.then(frm_fill);
		}else
			return Promise.resolve(frm_fill());
	}
	else{
		pwnd && pwnd.progressOn && pwnd.progressOn();

		return _mgr.get(attr.hasOwnProperty("ref") ? attr.ref : attr, true, true)
			.then(function(tObj){
				o = tObj;
				tObj = null;
				if(pwnd && pwnd.progressOff)
					pwnd.progressOff();
				return frm_fill();
			})
			.catch(function (err) {
				if(pwnd && pwnd.progressOff)
					pwnd.progressOff();
				wnd.close();
				$p.record_log(err);
			});
	}

};

/**
 * ### Форма объекта данных
 * По умолчанию, форма строится автоматически по описанию метаданных.<br />
 * Метод можно переопределить для конкретного менеджера
 *
 * @method form_obj
 * @for DataObj
 * @param pwnd {dhtmlXWindows} - указатель на родительскую форму
 * @param attr {Object} - параметры инициализации формы
 */
DataObj.prototype.form_obj = function (pwnd, attr) {
	if(!attr)
		attr = {};
	attr.o = this;
	return this._manager.form_obj(pwnd, attr);
};

/**
 * Форма абстрактного отчета {{#crossLink "DataProcessorsManager"}}{{/crossLink}}
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 * @module wnd_rep
 *
 * Created 03.08.2016
 */

DataProcessorsManager.prototype.form_rep = function(pwnd, attr) {

	var _mgr = this,
		_meta = _mgr.metadata(),
		wnd, options, _title, close_confirmed;

	if(!attr)
		attr = {};
	if(!attr.date_from)
		attr.date_from = new Date((new Date()).getFullYear().toFixed() + "-01-01");
	if(!attr.date_till)
		attr.date_till = new Date((new Date()).getFullYear().toFixed() + "-12-31");

	/**
	 * ПриСозданииНаСервере - инициализация при создании формы, до чтения объекта
	 */
	function frm_create(){


		// создаём и настраиваем окно формы
		if((pwnd instanceof dhtmlXLayoutCell || pwnd instanceof dhtmlXSideBarCell || pwnd instanceof dhtmlXCarouselCell)
			&& (attr.bind_pwnd || attr.Приклеить)) {

			// если вернулись на ту же самую закладку, ничего делать не надо
			if(wnd == pwnd && wnd._mgr == _mgr)
				return;

			// форма объекта приклеена к области контента или другой форме
			if(typeof pwnd.close == "function")
				pwnd.close(true);

			wnd = pwnd;
			wnd.close = function (on_create) {
				var _wnd = wnd || pwnd;

				if(on_create){

					if(_wnd){

						if(_wnd.conf){
							_wnd.detachToolbar();
							_wnd.detachStatusBar();
							_wnd.conf.unloading = true;
							_wnd.detachObject(true);
						}
					}
					frm_unload(on_create);

				}
			};
			wnd.elmnts = {grids: {}};

		}else{
			// форма в модальном диалоге
			options = {
				name: 'wnd_rep_' + _mgr.class_name,
				wnd: {
					top: 80 + Math.random()*40,
					left: 120 + Math.random()*80,
					width: 700,
					height: 400,
					modal: true,
					center: false,
					pwnd: pwnd,
					allow_close: true,
					allow_minmax: true,
					on_close: frm_close,
					caption: (_meta.obj_presentation || _meta.synonym)
				}
			};
			wnd = $p.iface.dat_blank(null, options.wnd);
		}

		// указатели на объект и менеджер
		wnd._mgr = _mgr;
		wnd.report = _mgr.create();


		if(!wnd.set_text)
			wnd.__define({

				/**
				 * Обновляет текст заголовка формы
				 */
				set_text: {
					value: function(force) {
						if(attr && attr.set_text || wnd && wnd.setText){

							var title = (_meta.obj_presentation || _meta.synonym);

							if(force || _title !== title){
								_title = title;
								if(attr.set_text)
									attr.set_text(title);
								else
									wnd.setText(title);
							}
						}
					},
					configurable: true
				}
			});

		/**
		 *	Разбивка на отчет и параметры
		 */
		wnd.elmnts.layout = wnd.attachLayout({
			pattern: "2U",
			cells: [{
				id: "a",
				text: "Отчет",
				header: false
			}, {
				id: "b",
				text: "Параметры",
				collapsed_text: "Параметры",
				width: 220

			}],
			offsets: { top: 0, right: 0, bottom: 0, left: 0}
		});

		// панель инструментов формы
		wnd.elmnts.frm_toolbar = wnd.attachToolbar();
		wnd.elmnts.frm_toolbar.setIconsPath(dhtmlx.image_path + 'dhxtoolbar' + dhtmlx.skin_suffix());
		wnd.elmnts.frm_toolbar.loadStruct(attr.toolbar_struct || $p.injected_data["toolbar_rep.xml"], function(){

			// если мы приклеены к ячейке, сдвигаем toolbar на 4px
			// if(wnd === pwnd)
			// 	this.cont.style.top = "4px";

			this.addSpacer("btn_run");
			this.attachEvent("onclick", attr.toolbar_click || toolbar_click);

		});

		// устанавливаем текст заголовка формы
		wnd.set_text();
		if(!attr.hide_header && wnd.showHeader)
			wnd.showHeader();

		// создаём HandsontableDocument
		wnd.elmnts.table = new $p.HandsontableDocument(wnd.elmnts.layout.cells("a"),
			{allow_offline: wnd.report.allow_offline, autorun: false})
			.then(function (rep) {
				if(!rep._online)
					return wnd.elmnts.table = null;
			});

		// контейнер для элементов параметров отчета
		wnd.elmnts.frm_prm = document.createElement("DIV");
		wnd.elmnts.frm_prm.style = "height: 100%; min-height: 300px; width: 100%";
		wnd.elmnts.layout.cells("b").attachObject(wnd.elmnts.frm_prm);

		// daterangepicker
		wnd.report.daterange = new $p.iface.ODateRangePicker(wnd.elmnts.frm_prm, attr);

	}

	/**
	 * обработчик нажатия кнопок командных панелей
	 */
	function toolbar_click(btn_id){

		if(btn_id=="btn_close"){
			wnd.close();

		}else if(btn_id=="btn_run"){
			wnd.report.build().then(show).catch(show);

		}else if(btn_id=="btn_print"){
			//_mgr.import(null, wnd.report);

		}else if(btn_id=="btn_save"){
			//_mgr.import(null, wnd.report);

		}else if(btn_id=="btn_load"){
			//_mgr.import(null, wnd.report);

		}else if(btn_id=="btn_export"){
			//_mgr.export({items: [wnd.report], pwnd: wnd, obj: true} );
		}

	}

	/**
	 * показывает отчет или ошибку (если data instanceof error)
	 */
	function show(data) {
		wnd.elmnts.table.requery(data);
	}

	/**
	 * освобождает переменные после закрытия формы
	 */
	function frm_unload(on_create){

		if(attr && attr.on_close && !on_create){
      attr.on_close();
    }

		if(!on_create && wnd){

		  delete wnd.set_text;

			// уничтожаем табличный документ
			if(wnd.elmnts.table){
        wnd.elmnts.table.hot.destroy();
      }

			// уничтожаем daterangepicker
			if(wnd.report.daterange){
        wnd.report.daterange.remove();
      }

			wnd.report = null;

			_mgr = wnd = _meta = options = pwnd = attr = null;
		}
	}

	frm_create();

	return wnd;

};

/**
 * Абстрактная форма списка и выбора выбора объектов ссылочного типа (документов и справочников)<br />
 * Может быть переопределена в {{#crossLink "RefDataManager"}}менеджерах{{/crossLink}} конкретных классов
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 *
 * @module  wnd_selection
 */

/**
 * Форма выбора объекта данных
 * @method form_selection
 * @param pwnd {dhtmlXWindowsCell} - указатель на родительскую форму
 * @param attr {Object} - параметры инициализации формы
 * @param [attr.initial_value] {DataObj} - начальное значение выбора
 * @param [attr.parent] {DataObj} - начальное значение родителя для иерархических справочников
 * @param [attr.on_select] {Function} - callback при выборе значения
 * @param [attr.on_grid_inited] {Function} - callback после инициализации грида
 * @param [attr.on_new] {Function} - callback после создания нового объекта
 * @param [attr.on_edit] {Function} - callback перед вызовом редактора
 * @param [attr.on_close] {Function} - callback при закрытии формы
 */
DataManager.prototype.form_selection = function(pwnd, attr){

  if(!pwnd) {
    pwnd = attr && attr.pwnd ? attr.pwnd : {};
  }

  if(!attr && !(pwnd instanceof dhtmlXCellObject)){
		attr = pwnd;
		pwnd = {};
	}

  if(!attr) {
    attr = {};
  }


  var _mgr = this,
		_meta = attr.metadata || _mgr.metadata(),
		has_tree = _meta["hierarchical"] && !(_mgr instanceof ChartOfAccountManager),
		wnd, s_col = 0, a_direction = "asc",
		previous_filter = {},
		on_select = pwnd.on_select || attr.on_select;


	/**
	 *	раздел вспомогательных функций
	 */

	/**
	 * аналог 1С-ного ПриСозданииНаСервере()
	 */
	function frm_create(){

		// создаём и настраиваем окно формы
		if(pwnd instanceof dhtmlXCellObject) {
			if(!(pwnd instanceof dhtmlXTabBarCell) && (typeof pwnd.close == "function"))
				pwnd.close(true);
			wnd = pwnd;
			wnd.close = function (on_create) {
				if(wnd || pwnd){
					(wnd || pwnd).detachToolbar();
					(wnd || pwnd).detachStatusBar();
					if((wnd || pwnd).conf)
						(wnd || pwnd).conf.unloading = true;
					(wnd || pwnd).detachObject(true);
				}
				frm_unload(on_create);
			};
			if(!attr.hide_header){
				setTimeout(function () {
					wnd.showHeader();
				});
			}
		}else{
			wnd = $p.iface.w.createWindow(null, 0, 0, 760, 540);
			wnd.centerOnScreen();
			wnd.setModal(1);
			wnd.button('park').hide();
			wnd.button('minmax').show();
			wnd.button('minmax').enable();
			wnd.attachEvent("onClose", frm_close);
		}

		$p.iface.bind_help(wnd);

		if(wnd.setText && !attr.hide_text)
			wnd.setText('Список ' + (_mgr.class_name.indexOf("doc.") == -1 ? 'справочника "' : 'документов "') + (_meta["list_presentation"] || _meta.synonym) + '"');

		document.body.addEventListener("keydown", body_keydown, false);

		// статусбар
		wnd.elmnts = {}

		if(attr.status_bar || !attr.smart_rendering){
			wnd.elmnts.status_bar = wnd.attachStatusBar();
		}

		if(!attr.smart_rendering){
			wnd.elmnts.status_bar.setText("<div id='" + _mgr.class_name.replace(".", "_") + "_select_recinfoArea'></div>");
		}

		// командная панель формы
		wnd.elmnts.toolbar = wnd.attachToolbar();
		wnd.elmnts.toolbar.setIconsPath(dhtmlx.image_path + 'dhxtoolbar' + dhtmlx.skin_suffix());
		wnd.elmnts.toolbar.loadStruct(attr.toolbar_struct || $p.injected_data["toolbar_selection.xml"], function(){

			this.attachEvent("onclick", toolbar_click);

			// если мы приклеены к ячейке, сдвигаем toolbar на 4px
			if(wnd === pwnd){
				this.cont.parentElement.classList.add("dhx_cell_toolbar_no_borders");
				this.cont.parentElement.classList.remove("dhx_cell_toolbar_def");
				//this.cont.style.top = "4px";
			}

			// текстовое поле фильтра по подстроке
			var tbattr = {
				manager: _mgr,
				toolbar: this,
				onchange: input_filter_change,
				hide_filter: attr.hide_filter,
				custom_selection: attr.custom_selection
			};
			if(attr.date_from) tbattr.date_from = attr.date_from;
			if(attr.date_till) tbattr.date_till = attr.date_till;
			if(attr.period) tbattr.period = attr.period;
			wnd.elmnts.filter = new $p.iface.Toolbar_filter(tbattr);


			// учтём права для каждой роли на каждый объект
			var _acl = $p.current_user.get_acl(_mgr.class_name);

			if(_acl.indexOf("i") == -1)
				this.hideItem("btn_new");

			if(_acl.indexOf("v") == -1)
				this.hideItem("btn_edit");

			if(_acl.indexOf("d") == -1)
				this.hideItem("btn_delete");

			if(!on_select){
				this.hideItem("btn_select");
				this.hideItem("sep1");
				if($p.iface.docs && $p.iface.docs.getViewName && $p.iface.docs.getViewName() == "oper")
					this.addListOption("bs_more", "btn_order_list", "~", "button", "<i class='fa fa-briefcase fa-lg fa-fw'></i> Список заказов");
			}
			this.addListOption("bs_more", "btn_import", "~", "button", "<i class='fa fa-upload fa-lg fa-fw'></i> Загрузить");
			this.addListOption("bs_more", "btn_export", "~", "button", "<i class='fa fa-download fa-lg fa-fw'></i> Выгрузить");


			// добавляем команды печати
			if(_mgr.printing_plates)
				_mgr.printing_plates().then(function (pp) {
					var added;
					for(var pid in pp){
						wnd.elmnts.toolbar.addListOption("bs_print", pid, "~", "button", pp[pid].toString());
						added = true;
					}
					if(!added)
						wnd.elmnts.toolbar.hideItem("bs_print");
				});
			else
				wnd.elmnts.toolbar.hideItem("bs_print");

			//
			create_tree_and_grid();
		});

		wnd._mgr = _mgr;

		return wnd;
	}

	/**
	 * Устанавливает фокус в поле фильтра
	 * @param evt {KeyboardEvent}
	 * @return {Boolean}
	 */
	function body_keydown(evt){

		if(wnd && wnd.is_visible && wnd.is_visible()){
			if (evt.ctrlKey && evt.keyCode == 70){ // фокус на поиск по {Ctrl+F}
				if(!$p.iface.check_exit(wnd)){
					setTimeout(function(){
						if(wnd.elmnts.filter.input_filter && $p.job_prm.device_type == "desktop")
							wnd.elmnts.filter.input_filter.focus();
					});
					return $p.iface.cancel_bubble(evt);
				}

			} else if(evt.shiftKey && evt.keyCode == 116){ // requery по {Shift+F5}
				if(!$p.iface.check_exit(wnd)){
					setTimeout(function(){
						wnd.elmnts.grid.reload();
					});
					if(evt.preventDefault)
						evt.preventDefault();
					return $p.iface.cancel_bubble(evt);
				}

			} else if(evt.keyCode == 27){ // закрытие по {ESC}
				if(wnd instanceof dhtmlXWindowsCell && !$p.iface.check_exit(wnd)){
					setTimeout(function(){
						wnd.close();
					});
				}
			}
		}
	}

	function input_filter_change(flt){
		if(wnd && wnd.elmnts){
			if(has_tree){
				if(flt.filter || flt.hide_tree)
					wnd.elmnts.cell_tree.collapse();
				else
					wnd.elmnts.cell_tree.expand();
			}
			wnd.elmnts.grid.reload();
		}
	}

	function create_tree_and_grid(){
		var layout, cell_tree, cell_grid, tree, grid, grid_inited;

		if(has_tree){
			layout = wnd.attachLayout('2U');

			cell_grid = layout.cells('b');
			cell_grid.hideHeader();

			cell_tree = wnd.elmnts.cell_tree = layout.cells('a');
			cell_tree.setWidth('220');
			cell_tree.hideHeader();

			const filter = {is_folder: true};
      const {selection} = get_filter(0, 1000);
      previous_filter = {};
      if(Array.isArray(selection)) {
        const set = new Set();
        for (const sel of selection) {
          for (let key in sel) {
            if(key === 'ref') {
              const cmp = sel[key].in ? 'in' : (sel[key].inh ? 'inh' : '')
              if(cmp) {
                sel[key][cmp].forEach((v) => {
                  const o = _mgr.get(v);
                  if(!o || o.empty()) {
                    return;
                  }
                  o.is_folder && set.add(o);
                  if(o.parent && !set.has(o.parent)) {
                    for (const elm of o._parents()) {
                      set.add(elm);
                    }
                  }
                  if(cmp === 'inh' || o.is_folder) {
                    for (const elm of o._children(true)) {
                      set.add(elm);
                    }
                  }
                });
              }
            }
          }
        }
        if(set.size) {
          filter.ref = {in: Array.from(set)};
        }
      }
      tree = wnd.elmnts.tree = cell_tree.attachDynTree(_mgr, filter, function(){
        setTimeout(function () {
          if(grid && grid.reload) {
            grid.reload();
          }
        }, 20);
      });
      tree.attachEvent('onSelect', function (id, mode) {	// довешиваем обработчик на дерево
        if(!mode) {
          return;
        }
        if(this.do_not_reload) {
          delete this.do_not_reload;
        }
        else {
          setTimeout(function () {
            if(grid && grid.reload) {
              grid.reload();
            }
          }, 20);
        }
      });
      tree.attachEvent("onDblClick", function(id){
				select(id);
			});
		}
		else{
			cell_grid = wnd;
      setTimeout(function () {
        if(grid && grid.reload) {
          grid.reload();
        }
      }, 20);
    }

		// настройка грида
		grid = wnd.elmnts.grid = cell_grid.attachGrid();
		grid.setIconsPath(dhtmlx.image_path);
		grid.setImagePath(dhtmlx.image_path);
		grid.attachEvent("onBeforeSorting", customColumnSort);
		grid.attachEvent("onBeforePageChanged", function(){ return !!this.getRowsNum();});
		grid.attachEvent("onXLE", function(){cell_grid.progressOff(); });
		grid.attachEvent("onXLS", function(){cell_grid.progressOn(); });
		grid.attachEvent("onDynXLS", function(start,count){
      var filter = get_filter(start, count);
      if(!filter) {
        return;
      }
      _mgr.sync_grid(filter, grid);
      return false;
    });
		grid.attachEvent("onRowDblClicked", function(rId, cInd){
      if(tree && tree.items[rId]) {
        tree.selectItem(rId);
        var pid = tree.getParentId(rId);
        if(pid && pid != $p.utils.blank.guid) {
          tree.openItem(pid);
        }
      }
      else {
        select(rId);
      }
    });

    if(attr.smart_rendering) {
      grid.enableSmartRendering(true, 50);
    }
    else {
      grid.setPagingWTMode(true, true, true, [20, 30, 60]);
      grid.enablePaging(true, 30, 8, _mgr.class_name.replace('.', '_') + '_select_recinfoArea');
      grid.setPagingSkin('toolbar', dhtmlx.skin);
    }

    if($p.iface.docs && $p.iface.docs.getViewName && $p.iface.docs.getViewName() == 'oper') {
      grid.enableMultiselect(true);
    }

    // эту функцию будем вызывать снаружи, чтобы перечитать данные
		grid.reload = function(){

			var filter = get_filter();
      if(!filter) {
        return Promise.resolve();
      }

      cell_grid.progressOn();
			grid.clearAll();

			return _mgr.sync_grid(filter, grid)
				.then(function(xml){
					if(typeof xml === "object"){
						$p.msg.check_soap_result(xml);
					}
					else if(!grid_inited){
						if(filter.initial_value){
							var xpos = xml.indexOf("set_parent"),
								xpos2 = xml.indexOf("'>", xpos),
								xh = xml.substr(xpos+12, xpos2-xpos-12);
							if($p.utils.is_guid(xh)){
								if(has_tree){
									tree.do_not_reload = true;
									tree.selectItem(xh, false);
								}
							}
							grid.selectRowById(filter.initial_value);

						}else if(filter.parent && $p.utils.is_guid(filter.parent) && has_tree){
							tree.do_not_reload = true;
							tree.selectItem(filter.parent, false);
						}
						grid.setColumnMinWidth(200, grid.getColIndexById("presentation"));
						grid.enableAutoWidth(true, 1200, 600);
						grid.setSizes();
						grid_inited = true;
            if(wnd.elmnts.filter.input_filter && $p.job_prm.device_type == 'desktop') {
              wnd.elmnts.filter.input_filter.focus();
            }

            if(attr.on_grid_inited) {
              attr.on_grid_inited();
            }
          }

          if(a_direction && grid_inited) {
            grid.setSortImgState(true, s_col, a_direction);
          }

          cell_grid.progressOff();

				});
		};
	}

	/**
	 *	обработчик нажатия кнопок командных панелей
	 */
	function toolbar_click(btn_id){

		// если внешний обработчик вернул false - выходим
		if(attr.toolbar_click && attr.toolbar_click(btn_id, wnd, _mgr) === false){
			return;
		}

		if(btn_id=="btn_select"){
			select();
		}
		else if(btn_id=="btn_new"){
			_mgr.create({}, true)
				.then(function (o) {
					if(attr.on_new){
            attr.on_new(o, wnd);
          }
					else if($p.job_prm.keep_hash){
						o.form_obj(wnd);
					}
					else{
						o._set_loaded(o.ref);
						$p.iface.set_hash(_mgr.class_name, o.ref);
					}
				});
		}
		else if(btn_id=="btn_edit") {
			const rId = wnd.elmnts.grid.getSelectedRowId();
			if (rId){
				if(attr.on_edit){
          attr.on_edit(_mgr, rId, wnd);
        }
        else if($p.job_prm.keep_hash){
					_mgr.form_obj(wnd, {ref: rId});

				}
				else{
          $p.iface.set_hash(_mgr.class_name, rId);
        }
			}
			else{
        $p.msg.show_msg({
          type: "alert-warning",
          text: $p.msg.no_selected_row.replace("%1", ""),
          title: $p.msg.main_title
        });
      }
		}
		else if(btn_id.substr(0,4)=="prn_"){
				print(btn_id);
		}
		else if(btn_id=="btn_order_list"){
			$p.iface.set_hash("", "", "", "def");
		}
		else if(btn_id=="btn_delete"){
			mark_deleted();
		}
		else if(btn_id=="btn_import"){
			_mgr.import();
		}
		else if(btn_id=="btn_export"){
			_mgr.export(wnd.elmnts.grid.getSelectedRowId());
		}
		else if(btn_id=="btn_requery"){
			previous_filter = {};
			wnd.elmnts.grid.reload();
		}
	}

	/**
	 * выбор значения в гриде
	 * @param rId - идентификтор строки грида или дерева
	 */
	function select(rId){

		if(!rId)
			rId = wnd.elmnts.grid.getSelectedRowId();

		var folders;
		if(attr.selection){
			attr.selection.forEach(function(sel){
				for(var key in sel){
					if(key=="is_folder")
						folders = sel[key];
				}
			});
		}

		// запрещаем выбирать папки
		if(wnd.elmnts.tree &&
			wnd.elmnts.tree.items[rId] &&
			wnd.elmnts.tree.getSelectedId() != rId){
			wnd.elmnts.tree.selectItem(rId, true);
			return;
		}

		// запрещаем выбирать элементы, если в метаданных указано выбирать только папки
		// TODO: спозиционировать сообщение над выбранным элементом
		if(rId && folders === true && wnd.elmnts.grid.cells(rId, 0).cell.classList.contains("cell_ref_elm")){
			$p.msg.show_msg($p.msg.select_grp);
			return;
		}


		if((!rId && wnd.elmnts.tree) || (wnd.elmnts.tree && wnd.elmnts.tree.getSelectedId() == rId)){
			if(folders === false){
				$p.msg.show_msg($p.msg.select_elm);
				return;
			}
			rId = wnd.elmnts.tree.getSelectedId();
		}

		if(rId){

			if(attr.on_edit)
				attr.on_edit(_mgr, rId, wnd);

			else if(on_select){

				_mgr.get(rId, 'promise')
					.then(function(selv){
						wnd.close();
						on_select.call(pwnd.grid || pwnd, selv);
					});

			} else if($p.job_prm.keep_hash){

				_mgr.form_obj(wnd, {ref: rId});

			} else
				$p.iface.set_hash(_mgr.class_name, rId);

		}
	}

	/**
	 *	Печатает документ
	 */
	function print(pid){
		var rId = wnd.elmnts.grid.getSelectedRowId();
		if(rId)
			_mgr.print(rId, pid, wnd);
		else
			$p.msg.show_msg({type: "alert-warning",
				text: $p.msg.no_selected_row.replace("%1", ""),
				title: $p.msg.main_title});
	}

	function mark_deleted(){
		var rId = wnd.elmnts.grid.getSelectedRowId();
		if(rId){
			_mgr.get(rId, 'promise')
				.then(function (o) {

					dhtmlx.confirm({
						title: $p.msg.main_title,
						text: o._deleted ? $p.msg.mark_undelete_confirm.replace("%1", o.presentation) : $p.msg.mark_delete_confirm.replace("%1", o.presentation),
						cancel: "Отмена",
						callback: function(btn) {
							if(btn)
								o.mark_deleted(!o._deleted);
						}
					});
				});
		}else
			$p.msg.show_msg({type: "alert-warning",
				text: $p.msg.no_selected_row.replace("%1", ""),
				title: $p.msg.main_title});
	}

	/**
	 * освобождает переменные после закрытия формы
	 */
	function frm_unload(on_create){

		document.body.removeEventListener("keydown", body_keydown);

		if(attr && attr.on_close && !on_create){
      attr.on_close();
    }

		if(!on_create){
			_mgr = wnd = _meta = previous_filter = on_select = pwnd = attr = null;
		}
	}

	function frm_close(){

		setTimeout(frm_unload, 10);

		// если в родительском установлен обработчик выгрузки нашего - вызываем с контекстом грида
		if(pwnd.on_unload)
			pwnd.on_unload.call(pwnd.grid || pwnd);

		if(_frm_close){
			$p.eve.detachEvent(_frm_close);
			_frm_close = null;
		}

		return true;
	}

	/**
	 * формирует объект фильтра по значениям элементов формы и позиции пейджинга
	 * @param start {Number} - начальная запись = skip
	 * @param count {Number} - количество записей на странице
	 * @return {*|{value, enumerable}}
	 */
	function get_filter(start, count){
	  const {grid, tree} = wnd.elmnts;
    const filter = wnd.elmnts.filter.get_filter()
				._mixin({
					action: "get_selection",
					metadata: _meta,
					class_name: _mgr.class_name,
					order_by: (grid && grid.columnIds[s_col]) || s_col,
					direction: a_direction,
          start: start || (grid ? ((grid.currentPage || 1) - 1) * grid.rowsBufferOutSize : 0),
					count: count || (grid ? grid.rowsBufferOutSize : 50),
					get_header: (previous_filter.get_header == undefined)
				}),
			tparent = (has_tree && tree) ? tree.getSelectedId() : null;

    if(attr.smart_rendering) {
      filter.smart_rendering = true;
    }

    if(attr.date_from && !filter.date_from) {
      filter.date_from = attr.date_from;
    }

    if(attr.date_till && !filter.date_till) {
      filter.date_till = attr.date_till;
    }

    if(attr.initial_value) {
      filter.initial_value = attr.initial_value;
    }

    if(attr.custom_selection) {
      filter.custom_selection = attr.custom_selection;
    }

    if(attr.selection){
			if(!filter.selection)
				filter.selection = attr.selection;

			else if(Array.isArray(attr.selection)){
				attr.selection.forEach(function (flt) {
					filter.selection.push(flt);
				});

			}else{
				for(var fld in attr.selection){
					if(!res.selection)
						res.selection = [];
					var flt = {};
					flt[fld] = attr.selection[fld];
					filter.selection.push(flt);
				}
			}
			//if(Array.isArray(attr.selection) && attr.selection.length){
			//	filter._mixin(attr.selection[0]);
			//}
		}

    if(attr.owner && !filter.owner) {
      filter.owner = attr.owner;
    }

    filter.parent = ((tparent  || attr.parent) && !filter.filter) ? (tparent || attr.parent) : null;
    if(has_tree && !filter.parent) {
      filter.parent = $p.utils.blank.guid;
    }


    for(var f in filter){
			if(previous_filter[f] != filter[f]){
				previous_filter = filter;
				return filter;
			}
		}
	}

	function customColumnSort(ind){
		var a_state = wnd.elmnts.grid.getSortingState();
		s_col=ind;
		a_direction = ((a_state[1] == "des")?"asc":"des");
		wnd.elmnts.grid.reload();
		return true;
	}

	/**
	 * подписываемся на событие закрытия формы объекта, чтобы обновить список и попытаться спозиционироваться на нужной строке
	 */
	var _frm_close = $p.eve.attachEvent("frm_close", function (class_name, ref) {
		if(_mgr && _mgr.class_name == class_name && wnd && wnd.elmnts){
			wnd.elmnts.grid.reload()
				.then(function () {
					if(!$p.utils.is_empty_guid(ref))
						wnd.elmnts.grid.selectRowById(ref, false, true, true);
				});
		}
	});

	// создаём и настраиваем форму
	if(has_tree && attr.initial_value && attr.initial_value!= $p.utils.blank.guid && !attr.parent)
		return _mgr.get(attr.initial_value, 'promise')
			.then(function (tObj) {
				attr.parent = tObj.parent.ref;
				attr.set_parent = attr.parent;
				return frm_create();
			});
	else
		return frm_create();
};

/**
 * Форма списка объектов данных
 * @method form_list
 * @param pwnd {dhtmlXWindows} - указатель на родительскую форму
 * @param attr {Object} - параметры инициализации формы
 */
DataManager.prototype.form_list = function(pwnd, attr){
	return this.form_selection(pwnd, attr);
};

/**
 * Форма окна длительной операции
 */

$p.iface.wnd_sync = function() {

	var _sync = $p.iface.sync = {},
		_stepper;

	_sync.create = function(stepper){
		_stepper = stepper;
		frm_create();
	};

	_sync.update = function(cats){
		_stepper.frm_sync.setItemValue("text_processed", "Обработано элементов: " + _stepper.step * _stepper.step_size + " из " + _stepper.count_all);
		var cat_list = "", md, rcount = 0;
		for(var cat_name in cats){
			rcount++;
			if(rcount > 4)
				break;
			if(cat_list)
				cat_list+= "<br />";
			md = $p.cat[cat_name].metadata();
			cat_list+= (md.list_presentation || md.synonym) + " (" + cats[cat_name].length + ")";
		}
		_stepper.frm_sync.setItemValue("text_current", "Текущий запрос: " + _stepper.step + " (" + Math.round(_stepper.step * _stepper.step_size * 100 / _stepper.count_all) + "%)");
		_stepper.frm_sync.setItemValue("text_bottom", cat_list);

	};

	_sync.close = function(){
		if(_stepper && _stepper.wnd_sync){
			_stepper.wnd_sync.close();
			delete _stepper.wnd_sync;
			delete _stepper.frm_sync;
		}
	};


	/**
	 *	Приватные методы
	 */
	function frm_create(){

		// параметры открытия формы
		var options = {
			name: 'wnd_sync',
			wnd: {
				id: 'wnd_sync',
				top: 130,
				left: 200,
				width: 496,
				height: 290,
				modal: true,
				center: true,
				caption: "Подготовка данных"
			}
		};

		_stepper.wnd_sync = $p.iface.dat_blank(null, options.wnd);

		var str = [
			{ type:"block" , name:"form_block_1", list:[
				{ type:"label" , name:"form_label_1", label: $p.msg.sync_data },
				{ type:"block" , name:"form_block_2", list:[
					{ type:"template",	name:"img_long", className: "img_long" },
					{ type:"newcolumn"   },
					{ type:"template",	name:"text_processed"},
					{ type:"template",	name:"text_current"},
					{ type:"template",	name:"text_bottom"}
				]  }
			]  },
			{ type:"button" , name:"form_button_1", value: $p.msg.sync_break }
		];
		_stepper.frm_sync = _stepper.wnd_sync.attachForm(str);
		_stepper.frm_sync.attachEvent("onButtonClick", function(name) {
			if(_stepper)
				_stepper.do_break = true;
		});

		_stepper.frm_sync.setItemValue("text_processed", "Инициализация");
		_stepper.frm_sync.setItemValue("text_bottom", "Загружается структура таблиц...");
	}
};
/**
 * Конструкторы табличных документов печатных форм и отчетов<br/>
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016<br/>
 * Created 17.04.2016
 *
 * @module reporting
 */

/**
 * Объект для построения печатных форм и отчетов
 *
 * @param [attr] {Object} - размер листа, ориентация, поля и т.д.
 * @constructor
 */
function SpreadsheetDocument(attr, events) {

	this._attr = {
		orientation: "portrait",
    title: "",
    content: document.createElement("DIV"),
    head: document.createElement("HEAD"),
    blank: "",
	};

	if(attr && typeof attr === "string"){
		this.content = attr;
	}
	else if(typeof attr === "object"){
		this._mixin(attr);
	}
	attr = null;

  this._events = {

    /**
     * ### При заполнении макета
     * Возникает перед заполнением параметров макета. В обработчике можно дополнить, изменить или рассчитать любые массивы или поля
     *
     * @event fill_template
     */
    fill_template: null,

  };
  if(events && typeof events === "object"){
    this._events._mixin(events);
  }
}
SpreadsheetDocument.prototype.__define({

  clear_head: {
    value() {
      while (this._attr.head.firstChild) {
        this._attr.head.removeChild(this._attr.head.firstChild);
      }
    }
  },

	clear: {
		value() {
			while (this._attr.content.firstChild) {
				this._attr.content.removeChild(this._attr.content.firstChild);
			}
		}
  },

  /**
	 * Добавляем элементы в заголовок
	 */
  put_head: {
    value(tag, attr) {
      let elm;
      if(tag instanceof HTMLElement){
        elm = document.createElement(tag.tagName);
        elm.innerHTML = tag.innerHTML;
        if(!attr)
          attr = tag.attributes;
      }else{
        elm = document.createElement(tag);
      }
      if(attr){
        Object.keys(attr).forEach(function (key) {
          elm.setAttribute(attr[key].name || key, attr[key].value || attr[key]);
        });
      }
      this._attr.head.appendChild(elm);
    }
  },

	/**
	 * Выводит область ячеек в табличный документ
	 */
	put: {
		value(range, attr) {
			let elm;
			if(range instanceof HTMLElement){
				elm = document.createElement(range.tagName);
				elm.innerHTML = range.innerHTML;
				if(!attr)
					attr = range.attributes;
			}else{
				elm = document.createElement("DIV");
				elm.innerHTML = range;
			}
			if(attr){
				Object.keys(attr).forEach(function (key) {
					//if(key == "id" || attr[key].name == "id")
					//	return;
					elm.setAttribute(attr[key].name || key, attr[key].value || attr[key]);
				});
			}
			this._attr.content.appendChild(elm);
		}
	},

  /**
   * Добавляет область и заполняет её данными
   * @method append
   * @param template {HTMLElement}
   * @param data {Object}
   */
  append: {
    value(template, data) {

      if(this._events.fill_template){
        data = this._events.fill_template(template, data);
      }

      switch (template.attributes.kind && template.attributes.kind.value){

        case 'row':
          this.draw_rows(template, data);
          break;

        case 'table':
          this.draw_table(template, data);
          break;

        default:
          this.put(dhx4.template(template.innerHTML, data), template.attributes);
          break;
      }
    }
  },

  draw_table: {
    value(template, data) {

      const tabular = template.attributes.tabular && template.attributes.tabular.value;
      if(!tabular){
        console.error('Не указана табличная часть в шаблоне ' + template.id);
        return;
      }
      const rows = data[tabular];
      if(!Array.isArray(rows)){
        console.error('В данных отсутствует массив ' + tabular);
        return;
      }

      // контейнер таблицы
      const cont = document.createElement('div');

      // заполняем контейнер по шаблону
      cont.innerHTML = template.innerHTML;

      // собственно, таблица
      const table = cont.querySelector('table');

      // шаблон строки таблицы
      const tpl_row = table.querySelector('[name=row]');

      // удаляем пустую строку из итоговой таблицы
      if(tpl_row){
        tpl_row.parentElement.removeChild(tpl_row);
      }
      else{
        console.error('Отсутствует <TR name="row"> в шаблоне таблицы');
        return;
      }

      // находим все шаблоны группировок
      const tpl_grouping = table.querySelector('tbody').querySelectorAll('tr');

      // удаляем шаблоны группировок из итоговой таблицы
      tpl_grouping.forEach((elm) => elm.parentElement.removeChild(elm));


      // подвал таблицы
      const tfoot = table.querySelector("tfoot");
      if(tfoot){
        tfoot.parentElement.removeChild(tfoot);
        tfoot.innerHTML = dhx4.template(tfoot.innerHTML, data);
        table.appendChild(tfoot);
      }

      // есть ли итоги

      function put_rows(rows) {
        rows.forEach((row) => {
          const table_row = document.createElement("TR");
          table_row.innerHTML = dhx4.template(tpl_row.innerHTML, row);
          table.appendChild(table_row);
        });
      }

      // есть ли группировка + цикл по табчасти
      const grouping = data._grouping && data._grouping.find_rows({use: true, parent: tabular});
      if(grouping && grouping.length === 1 && tpl_grouping.length){

        const gfield = grouping[0].field;

        $p.wsql.alasql("select distinct `"+gfield+"` from ? order by `"+gfield+"`", [rows])
          .forEach((group) => {
            const table_row = document.createElement("TR");
            table_row.innerHTML = dhx4.template(tpl_grouping[0].innerHTML, group);
            table.appendChild(table_row);
            put_rows(rows.filter((row) => row[gfield] == group[gfield]));
          })
      }
      else{
        put_rows(rows);
      }

      // собственно, вывод табличной части в отчет
      this.put(cont.innerHTML, cont.attributes);
    }
  },

  draw_rows: {
    value(template, data) {

      const tabular = template.attributes.tabular && template.attributes.tabular.value;
      if(!tabular){
        console.error('Не указана табличная часть в шаблоне ' + template.id);
        return;
      }
      const rows = data[tabular];
      if(!Array.isArray(rows)){
        console.error('В данных отсутствует массив ' + tabular);
        return;
      }

      // цикл по табчасти - выводим строку
      for(const row of rows){
        this.put(dhx4.template(template.innerHTML.replace(/<!---/g, '').replace(/--->/g, ''), row), template.attributes);
      }
    }
  },

  /**
   * Копирование элемента
   */
  copy_element: {
    value(elem) {
      const elm = document.createElement(elem.tagName);
      elm.innerHTML = elem.innerHTML;
      const attr = elem.attributes;
      Object.keys(attr).forEach((key) => elm.setAttribute(attr[key].name || key, attr[key].value || attr[key]));
      return elm;
    }
  },

  /**
   * Возвращает objectURL шаблона пустой страницы
   */
  blankURL: {
    get: function () {
      if(!this._blob) {
        if(this.blank) {
          this._blob = new Blob([this.blank], {type: 'text/html'});
        }
        else {
          this._blob = $p.injected_data['view_blank.html'] instanceof Blob ?
            $p.injected_data['view_blank.html'] :
            new Blob([$p.injected_data['view_blank.html']], {type: 'text/html'});
        }
      }
      return URL.createObjectURL(this._blob);
    }
  },

  /**
   * Показывает отчет в отдельном окне
   */
  print: {
    value() {

      const doc = this,
        url = this.blankURL;

      try{

        const wnd_print = window.open(url, '_blank',
            'fullscreen,menubar=no,toolbar=no,location=no,status=no,directories=no,resizable=yes,scrollbars=yes');

        if (wnd_print.outerWidth < screen.availWidth || wnd_print.outerHeight < screen.availHeight){
          wnd_print.moveTo(0,0);
          wnd_print.resizeTo(screen.availWidth, screen.availHeight);
        }

        wnd_print.onload = function() {
          URL.revokeObjectURL(url);
          // копируем элементы из head
          for (let i = 0; i < doc.head.children.length; i++) {
            wnd_print.document.head.appendChild(doc.copy_element(doc.head.children[i]));
          }
          // копируем элементы из content
          if (doc.innerContent) {
            for (let i = 0; i < doc.content.children.length; i++) {
              wnd_print.document.body.appendChild(doc.copy_element(doc.content.children[i]));
            }
          } else {
            wnd_print.document.body.appendChild(doc.content);
          }
          if(doc.title){
            wnd_print.document.title = doc.title;
          }
          setTimeout(() => wnd_print.print(), 200);
        };

        return wnd_print;
      }
      catch(err){
        URL.revokeObjectURL(url);
        $p.msg.show_msg({
          title: $p.msg.bld_title,
          type: "alert-error",
          text: err.message.match("outerWidth") ?
            "Ошибка открытия окна печати<br />Вероятно, в браузере заблокированы всплывающие окна" : err.message
        });
      }
    }
  },

  /**
   * Сохраняет печатную форму в файл
   */
  save_as: {
    value(filename) {

      const doc = this,
        url = this.blankURL;

      try{
        const wnd_print = window.open(url, '_blank',
            'fullscreen,menubar=no,toolbar=no,location=no,status=no,directories=no,resizable=yes,scrollbars=yes');

        if (wnd_print.outerWidth < screen.availWidth || wnd_print.outerHeight < screen.availHeight){
          wnd_print.moveTo(0,0);
          wnd_print.resizeTo(screen.availWidth, screen.availHeight);
        }

        wnd_print.onload = function() {
          URL.revokeObjectURL(url);
          // копируем элементы из head
          for (let i = 0; i < doc.head.children.length; i++) {
            wnd_print.document.head.appendChild(doc.copy_element(doc.head.children[i]));
          }
          // копируем элементы из content
          if (doc.innerContent) {
            for (let i = 0; i < doc.content.children.length; i++) {
              wnd_print.document.body.appendChild(doc.copy_element(doc.content.children[i]));
            }
          } else {
            wnd_print.document.body.appendChild(doc.content);
          }
          if(doc.title){
            wnd_print.document.title = doc.title;
          }

          // сохраняем содержимое документа
          setTimeout(() => {
            const blob = new Blob([wnd_print.document.firstElementChild.outerHTML], {type: 'text/html'});
            if(navigator.msSaveOrOpenBlob) {
              navigator.msSaveBlob(blob, filename);
            }
            else {
              const elem = document.createElement('a');
              elem.href = URL.createObjectURL(blob);
              elem.download = filename;
              document.body.appendChild(elem);
              elem.click();
              document.body.removeChild(elem);
            }
            wnd_print.close();
          }, 200);

        };

        return null;
      }
      catch(err){
        URL.revokeObjectURL(url);
        $p.msg.show_msg({
          title: $p.msg.bld_title,
          type: "alert-error",
          text: err.message.match("outerWidth") ?
            "Ошибка сохранения документа" : err.message
        });
      }
    }
  },

  /**
   * Получаем HTML печатной формы
   */
  get_html: {
    value() {
      return new Promise((resolve, reject) => {
        const doc = this,
          // вызываем для заполнения _blob
          url = this.blankURL;
    
        // отзываем объект
        URL.revokeObjectURL(url);
    
        const reader = new FileReader();
    
        // срабатывает после как blob будет загружен
        reader.addEventListener('loadend', e => {
          const document = new DOMParser().parseFromString(e.srcElement.result, 'text/html');
    
          // копируем элементы из head
          for (let i = 0; i < doc.head.children.length; i++) {
            document.head.appendChild(doc.copy_element(doc.head.children[i]));
          }
          // копируем элементы из content
          if (doc.innerContent) {
            for (let i = 0; i < doc.content.children.length; i++) {
              document.body.appendChild(doc.copy_element(doc.content.children[i]));
            }
          } else {
            document.body.appendChild(doc.content);
          }
          if (doc.title) {
            document.title = doc.title;
          }
    
          resolve(document.firstElementChild.outerHTML);
        });
    
        // срабатывает при ошибке в процессе загрузки blob
        reader.addEventListener('error', e => {
          reject(e);
        });
    
        // читаем blob как текст
        reader.readAsText(this._blob);
      });
    }
  },

  blank: {
    get: function () {
      return this._attr.blank
    },
    set: function (v) {
      this._attr.blank = v;
    }
  },

  head: {
    get: function () {
      return this._attr.head
    },
    set: function (v) {
      this.clear_head();
      if(typeof v === 'string') {
        this._attr.head.innerHTML = v;
      }
      else if(v instanceof HTMLElement) {
        this._attr.head.innerHTML = v.innerHTML;
      }
    }
  },

	content: {
		get: function () {
			return this._attr.content
		},
    set: function (v) {
      this.clear();
      if(typeof v === 'string') {
        this._attr.content.innerHTML = v;
      }
      else if(v instanceof HTMLElement) {
        this._attr.content.innerHTML = v.innerHTML;
      }
    }
  },

	title: {
		get: function () {
			return this._attr.title
		},
		set: function (v) {
			this._attr.title = v;
		}
	}

});

/**
 * Экспортируем конструктор SpreadsheetDocument, чтобы экземпляры печатного документа можно было создать снаружи
 * @property SpreadsheetDocument
 * @for MetaEngine
 * @type {function}
 */
$p.SpreadsheetDocument = SpreadsheetDocument;


/**
 * Табличный документ для экранных отчетов
 * @param container {HTMLElement|dhtmlXCellObject} - элемент DOM, в котором будет размещена таблица
 * @param [attr] {Object} - атрибуты инициплизации
 * @constructor
 */
function HandsontableDocument(container, attr) {

	const init = function () {
		ithis._then && this._then(this);
	}.bind(this);

	this._online = (attr && attr.allow_offline) || (navigator.onLine && $p.wsql.pouch.authorized);

	if(container instanceof dhtmlXCellObject){
		this._cont = document.createElement('div');
		container.detachObject(true);
		container.attachObject(this._cont);
	}else{
		this._cont = container;
	}

	this._cont.classList.add("handsontable_wrapper");
	if(!this._online){
		this._cont.innerHTML = $p.msg.report_need_online;
	}else{
		this._cont.innerHTML = attr.autorun ? $p.msg.report_prepare : $p.msg.report_need_prepare;
	}

	this.then = function (callback) {
		this._then = callback;
		return this;
	};

	this.requery = function (opt) {

		if(this.hot)
			this.hot.destroy();

		if(opt instanceof Error){
			this._cont.innerHTML = $p.msg.report_error + (opt.name ? " <b>" + opt.name + "</b>" : "") + (opt.message ? " " + opt.message : "");
		}else{
			this._cont.innerHTML = "";
			this.hot = new Handsontable(this._cont, opt);
		}
	};

	// отложенная загрузка handsontable и зависимостей
	if(typeof Handsontable !== "function" && this._online){
    $p.load_script('https://cdnjs.cloudflare.com/ajax/libs/pikaday/1.4.0/pikaday.min.js', 'script')
      .then(() => $p.load_script('https://cdnjs.cloudflare.com/ajax/libs/numbro/1.9.2/numbro.min.js', 'script'))
      .then(() => $p.load_script('https://cdn.jsdelivr.net/g/zeroclipboard,handsontable@0.26(handsontable.min.js)', 'script'))
      .then(() => Promise.all([
        $p.load_script('https://cdn.jsdelivr.net/handsontable/0.26/handsontable.min.css', 'link'),
        $p.load_script('https://cdnjs.cloudflare.com/ajax/libs/numbro/1.9.2/languages/ru-RU.min.js', 'script')
      ]))
      .then(init);
	}
	else{
		setTimeout(init);
	}
}

/**
 * Экспортируем конструктор HandsontableDocument, чтобы экземпляры табличного документа можно было создать снаружи
 * @property HandsontableDocument
 * @for MetaEngine
 * @type {function}
 */
$p.HandsontableDocument = HandsontableDocument;

/**
 * Процедуры импорта и экспорта данных
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 *
 * @module metadata
 * @submodule import_export
 * @requires common
 */


/**
 * ### Экспортирует данные в файл или в строковую переменную или на сервер
 * - Выгружаться может как единичный объект, так и коллекция объектов
 * - В параметрах метода либо интерактивно могут задаваться правила экспорта, такие как:
 *   - Формат формируемого файла (json, xlsx, sql)
 *   - Дополнять ли формируемый файл информацией о метаданных (типы и связи полей)
 *   - Включать ли в формируемый файл данные связанных объектов<br />(например, выгружать вместе с заказом объекты номенклатуры и характеристик)
 *
 * @method export
 * @for DataManager
 * @param attr {Object} - параметры экспорта
 * @param [attr.pwnd] {dhtmlXWindows} - указатель на родительскую форму
 *
 * @example
 *
 *     //	обработчик нажатия кнопок командной панели формы списка
 *     function toolbar_click(btn_id){
 *       if(btn_id=="btn_import"){
 *         // открываем диалог импорта объектов текущего менеджера
 *         _mgr.import();
 *       }else if(btn_id=="btn_export"){
 *         // открываем диалог экспорта объектов текущего менеджера и передаём ссылку текущей строки
 *         // если ссылка не пустая, будет предложено экспортировать единственный объект
 *         // при необходимости, в диалоге можно указать экспорт всех объектов текущего менеджера
 *         _mgr.export(wnd.elmnts.grid.getSelectedRowId());
 *       }
 *     }
 */
DataManager.prototype.export = function(attr){

	if(attr && "string" === typeof attr)
		attr = {items: attr.split(",")};
	else if(!attr)
		attr = {items: []};


	var _mgr = this, wnd,
		options = {
			name: 'export',
			wnd: {
				top: 130,
				left: 200,
				width: 480,
				height: 350
			}
		};

	// читаем объект из локального SQL или из 1С
	frm_create();


	/**
	 * ПриСозданииНаСервере()
	 */
	function frm_create(){

		$p.wsql.restore_options("data_manager", options);
		options.wnd.caption = "Экспорт " + _mgr.family_name + " '" + (_mgr.metadata().synonym || _mgr.metadata().name) + "'";

		wnd = $p.iface.dat_blank(null, options.wnd);

		wnd.bottom_toolbar({
			buttons: [
				{name: 'btn_cancel', text: '<i class="fa fa-times fa-lg"></i> Отмена', title: 'Отмена', width:'80px', float: 'right'},
				{name: 'btn_ok', b: '<i class="fa fa-floppy-o"></i> Ок', title: 'Выполнить экспорт', width:'50px', float: 'right'}],
			onclick: function (name) {
					if(name == 'btn_ok')
						do_export();
					else
						wnd.close();
					return false;
				}
			});


		wnd.button('close').show();
		wnd.button('park').hide();
		wnd.attachEvent("onClose", frm_close);

		var str = [
			{ type:"fieldset" , name:"form_range", label:"Выгрузить", list:[
				{ type:"settings" , labelWidth:320, labelAlign:"left", position:"label-right"  },
				{ type:"radio" , name:"range", label:"Выделенные строки", value:"selected"  },
				{ type:"radio" , name:"range", label:"Весь справочник", value:"all"  }
			]},
			{ type:"fieldset" , name:"form_fieldset_2", label:"Дополнительно выгрузить", list:[
				{ type:"settings" , labelWidth:160, position:"label-right"  },
				{ type:"checkbox" , name:"meta", label:"Описание метаданных", labelAlign:"left", position:"label-right", checked: options.meta  },
				{ type:"newcolumn"   },
				{ type:"checkbox" , name:"relation", label:"Связанные объекты", position:"label-right", checked: options.relation, tooltip: "Связанные объекты по ссылкам (пока не реализовано)" }
			]  },
			{ type:"fieldset" , name:"fieldset_format", label:"Формат файла", list:[
				{ type:"settings" , labelWidth:60, labelAlign:"left", position:"label-right"  },
				{ type:"radio" , name:"format", label:"json", value:"json", tooltip: "Выгрузить в формате JSON"  },
				{ type:"newcolumn"   },
				{ type:"radio" , name:"format", label:"xlsx", value:"xlsx", tooltip: "Выгрузить в офисном формате XLSX" },
				{ type:"newcolumn"   },
				{ type:"radio" , name:"format", label:"atom", value:"atom", tooltip: "Выгрузить в формате XML Atom" }

			]  }


		];
		wnd.elmnts.frm = wnd.attachForm(str);

		wnd.elmnts.frm.setItemValue("range", options.range || "all");

		if(attr.items && attr.items.length == 1){
			if(attr.obj)
				wnd.elmnts.frm.setItemLabel("range", "selected", "Тек. объект: " + attr.items[0].presentation);
			else
				_mgr.get(attr.items[0], 'promise').then((Obj) => wnd.elmnts.frm.setItemLabel("range", "selected", "Тек. объект: " + Obj.presentation));
			wnd.elmnts.frm.setItemValue("range", "selected");

		}else if(attr.items && attr.items.length)
			wnd.elmnts.frm.setItemLabel("range", "selected", "Выделенные строки (" + attr.items.length + " элем.)");

		if(_mgr instanceof DocManager)
			wnd.elmnts.frm.setItemLabel("range", "all", "Все документы из кеша (0 элем.)");


		wnd.elmnts.frm.setItemValue("format", options.format || "json");

		wnd.elmnts.frm.attachEvent("onChange", set_availability);

		set_availability();

		if(attr.pwnd && attr.pwnd.isModal && attr.pwnd.isModal()){
			attr.set_pwnd_modal = true;
			attr.pwnd.setModal(false);
		}
		wnd.setModal(true);

	}

	function set_availability(){

		wnd.elmnts.frm.setItemValue("relation", false);
		wnd.elmnts.frm.disableItem("relation");

		if(wnd.elmnts.frm.getItemValue("range") == "all"){
			wnd.elmnts.frm.disableItem("format", "atom");
			if(wnd.elmnts.frm.getItemValue("format") == "atom")
				wnd.elmnts.frm.setItemValue("format", "json");
		}else
			wnd.elmnts.frm.enableItem("format", "atom");

		if(wnd.elmnts.frm.getItemValue("format") == "json"){
			wnd.elmnts.frm.enableItem("meta");

		}else if(wnd.elmnts.frm.getItemValue("format") == "sql"){
			wnd.elmnts.frm.setItemValue("meta", false);
			wnd.elmnts.frm.disableItem("meta");

		}else{
			wnd.elmnts.frm.setItemValue("meta", false);
			wnd.elmnts.frm.disableItem("meta");

		}
	}

	function refresh_options(){
		options.format = wnd.elmnts.frm.getItemValue("format");
		options.range = wnd.elmnts.frm.getItemValue("range");
		options.meta = wnd.elmnts.frm.getItemValue("meta");
		options.relation = wnd.elmnts.frm.getItemValue("relation");
		return options;
	}

	function do_export(){

		refresh_options();

		function export_xlsx(){
			if(attr.obj)
				$p.wsql.alasql("SELECT * INTO XLSX('"+_mgr.table_name+".xlsx',{headers:true}) FROM ?", [attr.items[0]._obj]);
			else
				$p.wsql.alasql("SELECT * INTO XLSX('"+_mgr.table_name+".xlsx',{headers:true}) FROM " + _mgr.table_name);
		}

		var res = {meta: {}, items: {}},
			items = res.items[_mgr.class_name] = [];

		//$p.wsql.aladb.tables.refs.data.push({ref: "dd274d11-833b-11e1-92c2-8b79e9a2b61c"})
		//$p.wsql.alasql('select * from cat_cashboxes where ref in (select ref from refs)')

		if(options.meta)
			res.meta[_mgr.class_name] = _mgr.metadata();

		if(options.format == "json"){

			if(attr.obj)
				items.push(attr.items[0]._obj);
			else
				_mgr.each(function (o) {
					if(options.range == "all" || attr.items.indexOf(o.ref) != -1)
						items.push(o._obj);
				});

			if(attr.items.length && !items.length)
				_mgr.get(attr.items[0], 'promise').then(function (Obj) {
					items.push(Obj._obj);
					alasql.utils.saveFile(_mgr.table_name+".json", JSON.stringify(res, null, 4));
				});

			else
				alasql.utils.saveFile(_mgr.table_name+".json", JSON.stringify(res, null, 4));

		}else if(options.format == "xlsx"){
			if(!window.xlsx)
				$p.load_script("/dist/xlsx.full.min.js", "script", export_xlsx);
			else
				export_xlsx();

		}else if(options.format == "atom" && attr.items.length){

			var po = attr.obj ? Promise.resolve(attr.items[0]) : _mgr.get(attr.items[0], 'promise');
			po.then(function (o) {
				alasql.utils.saveFile(_mgr.table_name+".xml", o.to_atom());
			});

		}else{
			//$p.wsql.alasql("SELECT * INTO SQL('"+_mgr.table_name+".sql') FROM " + _mgr.table_name);
			$p.msg.show_not_implemented();
		}
	}

	function frm_close(win){

		$p.iface.popup.hide();
		wnd.wnd_options(options.wnd);
		$p.wsql.save_options("data_manager", refresh_options());

		wnd.setModal(false);
		if(attr.set_pwnd_modal && attr.pwnd.setModal)
			attr.pwnd.setModal(true);

		return true;
	}


};

/**
 * Осуществляет загрузку данных из json-файла
 * @param [file] {String|Blob|undefined}
 * @param [obj] {DataObj} - если указано, загрузка осуществляется только в этот объект. остальные данные файла - игнорируются
 */
DataManager.prototype.import = function(file, obj){

	var input_file, imported;

	function import_file(event){

		function do_with_collection(cl_name, items){
			var _mgr = _md.mgr_by_class_name(cl_name);
			if(items.length){
				if(!obj){
					imported = true;
					_mgr.load_array(items, true);
				} else if(obj._manager == _mgr){
					for(var i in items){
						if($p.utils.fix_guid(items[i]) == obj.ref){
							imported = true;
							_mgr.load_array([items[i]], true);
						}
					}
				}
			}
		}

		wnd.close();
		if(input_file.files.length){

			var reader = new FileReader();
			reader.onload = function(e) {
				try{
					var res = JSON.parse(reader.result);

					if(res.items){
						for(var cl_name in res.items)
							do_with_collection(cl_name, res.items[cl_name]);

					}else{
						["cat", "doc", "ireg", "areg", "cch", "cacc"].forEach(function (cl) {
							if(res[cl]) {
								for (var cl_name in res[cl])
									do_with_collection(cl + "." + cl_name, res.cat[cl_name]);
							}
						});
					}
					if(!imported)
						$p.msg.show_msg($p.msg.sync_no_data);

				}catch(err){
					$p.msg.show_msg(err.message);
				}
			};
			reader.readAsText(input_file.files[0]);
		}
	}

	if(!file && typeof window != undefined){

		var options = {
				name: 'import',
				wnd: {
					width: 300,
					height: 100,
					caption: $p.msg.select_file_import
				}
			},
			wnd = $p.iface.dat_blank(null, options.wnd);

		input_file = document.createElement("input");
		input_file.setAttribute("id", "json_file");
		input_file.setAttribute("type", "file");
		input_file.setAttribute("accept", ".json");
		input_file.setAttribute("value", "*.json");
		input_file.onchange = import_file;

		wnd.button('close').show();
		wnd.button('park').hide();
		wnd.attachObject(input_file);
		wnd.centerOnScreen();
		wnd.setModal(true);

		setTimeout(function () {
			input_file.click();
		}, 100);
	}
};

$p.injected_data._mixin({"form_auth.xml":"<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<items>\n\t<item type=\"settings\" position=\"label-left\" labelWidth=\"80\" inputWidth=\"180\" noteWidth=\"180\"/>\n\t<item type=\"fieldset\" name=\"data\" inputWidth=\"auto\" label=\"Авторизация\">\n\n        <item type=\"radio\" name=\"type\" labelWidth=\"auto\" position=\"label-right\" checked=\"true\" value=\"guest\" label=\"Гостевой (демо) режим\">\n            <item type=\"select\" name=\"guest\" label=\"Роль\">\n                <option value=\"Дилер\" label=\"Дилер\"/>\n            </item>\n        </item>\n\n\t\t<item type=\"radio\" name=\"type\" labelWidth=\"auto\" position=\"label-right\" value=\"auth\" label=\"Есть учетная запись\">\n\t\t\t<item type=\"input\" value=\"\" name=\"login\" label=\"Логин\" validate=\"NotEmpty\" />\n\t\t\t<item type=\"password\" value=\"\" name=\"password\" label=\"Пароль\" validate=\"NotEmpty\" />\n\t\t</item>\n\n\t\t<item type=\"button\" value=\"Войти\" name=\"submit\"/>\n\n        <item type=\"template\" name=\"text_options\" className=\"order_dealer_options\" inputWidth=\"170\"\n              value=\"&lt;a href='#' onclick='$p.iface.open_settings();' title='Страница настроек программы' &gt; &lt;i class='fa fa-cog fa-lg'&gt;&lt;/i&gt; Настройки &lt;/a&gt; &lt;a href='//www.oknosoft.ru/feedback' target='_blank' style='margin-left: 9px;' title='Задать вопрос через форму обратной связи' &gt; &lt;i class='fa fa-question-circle fa-lg'&gt;&lt;/i&gt; Вопрос &lt;/a&gt;\"  />\n\n\t</item>\n</items>","toolbar_add_del.xml":"<?xml version=\"1.0\" encoding='utf-8'?>\n<toolbar>\n  <item id=\"sep0\" type=\"separator\"/>\n  <item id=\"btn_add\" type=\"button\"  text=\"&lt;i class='fa fa-plus-circle fa-fw'&gt;&lt;/i&gt; Добавить\" title=\"Добавить строку\"  />\n  <item id=\"btn_delete\" type=\"button\" text=\"&lt;i class='fa fa-times fa-fw'&gt;&lt;/i&gt; Удалить\"  title=\"Удалить строку\" />\n  <item id=\"sep1\" type=\"separator\"/>\n\n  <item id=\"sp\" type=\"spacer\"/>\n  <item id=\"input_filter\" type=\"buttonInput\" width=\"200\" title=\"Поиск по подстроке\" />\n\n  <item id=\"sep2\" type=\"separator\"/>\n  <item type=\"buttonSelect\"   id=\"bs_more\"  text=\"&lt;i class='fa fa-share-alt fa-fw'&gt;&lt;/i&gt;\"  title=\"Экспорт\" openAll=\"true\">\n    <item type=\"button\" id=\"btn_csv\" text=\"&lt;i class='fa fa-file-text-o fa-fw'&gt;&lt;/i&gt; Скопировать в CSV\" />\n    <item type=\"button\" id=\"btn_json\" text=\"&lt;i class='fa fa-file-code-o fa-fw'&gt;&lt;/i&gt; Скопировать в JSON\" />\n    <item type=\"button\" id=\"btn_xls\" text=\"&lt;i class='fa fa-file-excel-o fa-fw'&gt;&lt;/i&gt; Выгрузить в XLS\" />\n  </item>\n</toolbar>\n","toolbar_add_del_compact.xml":"<?xml version=\"1.0\" encoding='utf-8'?>\n<toolbar>\n    <item id=\"btn_add\" type=\"button\"  text=\"&lt;i class='fa fa-plus-circle fa-fw'&gt;&lt;/i&gt;\" title=\"Добавить строку\" />\n    <item id=\"btn_delete\" type=\"button\" text=\"&lt;i class='fa fa-times fa-fw'&gt;&lt;/i&gt;\"  title=\"Удалить строку\" />\n    <item id=\"sep1\" type=\"separator\"/>\n</toolbar>","toolbar_obj.xml":"<?xml version=\"1.0\" encoding='utf-8'?>\n<toolbar>\n    <item id=\"sep0\" type=\"separator\"/>\n    <item type=\"button\" id=\"btn_save_close\" text=\"&lt;b&gt;Записать и закрыть&lt;/b&gt;\" title=\"Рассчитать, записать и закрыть\" />\n    <item type=\"button\" id=\"btn_save\" text=\"&lt;i class='fa fa-floppy-o fa-fw'&gt;&lt;/i&gt;\" title=\"Рассчитать и записать данные\"/>\n    <item type=\"button\" id=\"btn_post\" enabled=\"false\" text=\"&lt;i class='fa fa-check-square-o fa-fw'&gt;&lt;/i&gt;\" title=\"Провести документ\" />\n    <item type=\"button\" id=\"btn_unpost\" enabled=\"false\" text=\"&lt;i class='fa fa-square-o fa-fw'&gt;&lt;/i&gt;\" title=\"Отмена проведения\" />\n\n    <item type=\"button\" id=\"btn_files\" text=\"&lt;i class='fa fa-paperclip fa-fw'&gt;&lt;/i&gt;\" title=\"Присоединенные файлы\"/>\n\n    <item type=\"buttonSelect\" id=\"bs_print\" text=\"&lt;i class='fa fa-print fa-fw'&gt;&lt;/i&gt;\" title=\"Печать\" openAll=\"true\">\n    </item>\n\n    <item type=\"buttonSelect\" id=\"bs_create_by_virtue\" text=\"&lt;i class='fa fa-bolt fa-fw'&gt;&lt;/i&gt;\" title=\"Создать на основании\" openAll=\"true\" >\n        <item type=\"button\" id=\"btn_message\" enabled=\"false\" text=\"Сообщение\" />\n    </item>\n\n    <item type=\"buttonSelect\" id=\"bs_go_to\" text=\"&lt;i class='fa fa-external-link fa-fw'&gt;&lt;/i&gt;\" title=\"Перейти\" openAll=\"true\" >\n        <item type=\"button\" id=\"btn_go_connection\" enabled=\"false\" text=\"Связи\" />\n    </item>\n\n    <item type=\"buttonSelect\"   id=\"bs_more\"  text=\"&lt;i class='fa fa-th-large fa-fw'&gt;&lt;/i&gt;\"  title=\"Дополнительно\" openAll=\"true\">\n\n        <item type=\"button\" id=\"btn_import\" text=\"&lt;i class='fa fa-upload fa-fw'&gt;&lt;/i&gt; Загрузить\" />\n        <item type=\"button\" id=\"btn_export\" text=\"&lt;i class='fa fa-download fa-fw'&gt;&lt;/i&gt; Выгрузить\" />\n    </item>\n\n    <item id=\"sep1\" type=\"separator\"/>\n    <item type=\"button\" id=\"btn_close\" text=\"&lt;i class='fa fa-times fa-fw'&gt;&lt;/i&gt;\" title=\"Закрыть форму\"/>\n    <item id=\"sep2\" type=\"separator\"/>\n\n</toolbar>\n","toolbar_ok_cancel.xml":"<?xml version=\"1.0\" encoding='utf-8'?>\r\n<toolbar>\r\n    <item id=\"btn_ok\"       type=\"button\"   img=\"\"  imgdis=\"\"   text=\"&lt;b&gt;Ок&lt;/b&gt;\"  />\r\n    <item id=\"btn_cancel\"   type=\"button\"\timg=\"\"  imgdis=\"\"   text=\"Отмена\" />\r\n</toolbar>","toolbar_rep.xml":"<?xml version=\"1.0\" encoding='utf-8'?>\n<toolbar>\n    <item id=\"sep0\" type=\"separator\"/>\n    <item type=\"button\" id=\"btn_run\" text=\"&lt;i class='fa fa-play fa-fw'&gt;&lt;/i&gt; Сформировать\" title=\"Сформировать отчет\"/>\n\n    <item type=\"buttonSelect\"   id=\"bs_more\"  text=\"&lt;i class='fa fa-th-large fa-fw'&gt;&lt;/i&gt;\"  title=\"Дополнительно\" openAll=\"true\">\n\n        <item type=\"button\" id=\"btn_print\" text=\"&lt;i class='fa fa-print fa-fw'&gt;&lt;/i&gt; Печать\" />\n\n        <item id=\"sep3\" type=\"separator\"/>\n\n        <item type=\"button\" id=\"btn_export\" text=\"&lt;i class='fa fa-file-excel-o fa-fw'&gt;&lt;/i&gt; Выгрузить\" />\n\n        <item id=\"sep4\" type=\"separator\"/>\n\n        <item type=\"button\" id=\"btn_save\" text=\"&lt;i class='fa fa-folder-open-o fa-fw'&gt;&lt;/i&gt; Выбрать вариант\" />\n        <item type=\"button\" id=\"btn_load\" text=\"&lt;i class='fa fa-floppy-o fa-fw'&gt;&lt;/i&gt; Сохранить вариант\" />\n\n    </item>\n\n    <item id=\"sep1\" type=\"separator\"/>\n\n</toolbar>\n","toolbar_selection.xml":"<?xml version=\"1.0\" encoding='utf-8'?>\n<toolbar>\n\n  <item id=\"sep0\" type=\"separator\"/>\n\n  <item id=\"btn_select\" type=\"button\" title=\"Выбрать элемент списка\" text=\"&lt;b&gt;Выбрать&lt;/b&gt;\"/>\n\n  <item id=\"sep1\" type=\"separator\"/>\n  <item id=\"btn_new\" type=\"button\" text=\"&lt;i class='fa fa-plus-circle fa-fw'&gt;&lt;/i&gt;\" title=\"Создать\"/>\n  <item id=\"btn_edit\" type=\"button\" text=\"&lt;i class='fa fa-pencil fa-fw'&gt;&lt;/i&gt;\" title=\"Изменить\"/>\n  <item id=\"btn_delete\" type=\"button\" text=\"&lt;i class='fa fa-times fa-fw'&gt;&lt;/i&gt;\" title=\"Удалить\"/>\n  <item id=\"sep2\" type=\"separator\"/>\n\n  <item type=\"buttonSelect\" id=\"bs_print\" text=\"&lt;i class='fa fa-print fa-fw'&gt;&lt;/i&gt; Печать\" openAll=\"true\">\n  </item>\n\n  <item type=\"buttonSelect\" id=\"bs_create_by_virtue\" text=\"&lt;i class='fa fa-bolt fa-fw'&gt;&lt;/i&gt;\" title=\"Создать на основании\" openAll=\"true\">\n  </item>\n\n  <item type=\"buttonSelect\" id=\"bs_go_to\" text=\"&lt;i class='fa fa-external-link fa-fw'&gt;&lt;/i&gt;\" title=\"Перейти\" openAll=\"true\" >\n    <item type=\"button\" id=\"btn_go_connection\" enabled=\"false\" text=\"Связи\" />\n  </item>\n\n  <item type=\"buttonSelect\" id=\"bs_more\" text=\"&lt;i class='fa fa-th-large fa-fw'&gt;&lt;/i&gt;\" title=\"Дополнительно\" openAll=\"true\">\n    <item id=\"btn_requery\" type=\"button\" text=\"&lt;i class='fa fa-refresh fa-fw'&gt;&lt;/i&gt; Обновить список\"/>\n  </item>\n\n  <item id=\"sep3\" type=\"separator\"/>\n\n</toolbar>\n"});
};