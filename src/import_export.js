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
