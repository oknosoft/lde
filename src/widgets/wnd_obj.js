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
