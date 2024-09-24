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


	<%= contents %>
};
