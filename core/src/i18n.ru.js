/**
 * Строковые константы интернационализации
 *
 * @module metadata
 * @submodule i18n
 */

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
    };
    return syn[this._lang];
	}
}

/**
 * Возвращает текст строковой константы с учетом текущего языка
 *
 * @param id {String}
 * @return {String|Object}
 */
const msg = new I18n({
	ru: {

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
      fields: 'Поля',
      field: 'Поле',
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
				return this.mgr + ' перечислений';
			},
			get cat() {
				return this.mgr + ' справочников';
			},
			get doc() {
				return this.mgr + ' документов';
			},
			get cch() {
				return this.mgr + ' планов видов характеристик';
			},
			get cacc() {
				return this.mgr + ' планов счетов';
			},
			get tsk() {
				return this.mgr + ' задач';
			},
			get ireg() {
				return this.mgr + ' регистров сведений';
			},
			get areg() {
				return this.mgr + ' регистров накопления';
			},
			get accreg() {
				return this.mgr + ' регистров бухгалтерии';
			},
			get bp() {
				return this.mgr + ' бизнес-процессов';
			},
			get dp() {
				return this.mgr + ' обработок';
			},
			get rep() {
				return this.mgr + ' отчетов';
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
		unknown_error: 'Неизвестная ошибка в функции "%1"',

		value: 'Значение',

	},
});

export default msg;
