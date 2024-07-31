/**
 * Содержит методы и подписки на события Postgres
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2024
 * @module common
 * @submodule postgres
 */

import {Client} from 'pg';

function adapter({AbstracrAdapter}) {

  /**
   * ### Интерфейс сетевой базы данных PostgreSQL
   *
   * @class AdapterPostgres
   * @static
   * @menuorder 35
   * @tooltip Данные postgres
   */
  return class AdapterPostgres extends AbstracrAdapter {

    constructor($p) {
      super($p);
      this.props = {};
      this.client = null;
    }

    /**
     * Инициализация адаптера
     * @param wsql
     * @param job_prm
     */
    init(wsql, job_prm) {
      return Promise.resolve();
    }


    /**
     * ### Подключается к серверу и устанавливает признак авторизованности
     * @method log_in
     * @param username {String}
     * @param password {String}
     * @return {Promise}
     */
    log_in(username, password) {
      this.client = new Client({});
      return Promise.resolve();
    }

    /**
     * ### Отключается от сервера и снимает признак авторизованности
     * @method log_out
     */
    log_out() {
      if(this.client) {
        return client.end()
          .catch(() => null)
          .then(() => this.client = null);
      }
      else {
        return Promise.resolve();
      }
    }

    /**
     * ### Загружает условно-постоянные данные из базы ram в alasql
     * Используется при инициализации данных на старте приложения
     *
     * @method load_data
     */
    load_data() {
      return Promise.resolve();
    }

    /**
     * ### Читает объект из PostgreSQL
     *
     * @method load_obj
     * @param tObj {DataObj} - объект данных, который необходимо прочитать - дозаполнить
     * @param attr {Object} - ополнительные параметры, например, db - прочитать из другой базы
     * @return {Promise.<DataObj>} - промис с загруженным объектом
     */
    load_obj(tObj, attr) {
      return Promise.resolve({});
    }

    /**
     * ### Записывает объект в PostgreSQL
     *
     * @method save_obj
     * @param tObj {DataObj} - записываемый объект
     * @param attr {Object} - ополнительные параметры записи
     * @return {Promise.<DataObj>} - промис с записанным объектом
     */
    save_obj(tObj, attr) {
      return Promise.resolve({});
    }


    /**
     * Загружает объекты из PostgreSQL по массиву ссылок
     *
     * @param _mgr {DataManager}
     * @param refs {Array}
     * @return {*}
     */
    load_array(_mgr, refs) {
      if(!refs || !refs.length) {
        return Promise.resolve(false);
      }
      return Promise.resolve(false);
    }


    /**
     * ### Найти строки
     * Возвращает массив дата-объектов, обрезанный отбором _selection_<br />
     * Eсли отбор пустой, возвращаются все строки из PouchDB.
     *
     * @method find_rows
     * @param _mgr {DataManager}
     * @param selection {Object|function} - в ключах имена полей, в значениях значения фильтра или объект {like: "значение"} или {not: значение}
     * @param [selection._top] {Number}
     * @param [selection._skip] {Number}
     * @param [selection._raw] {Boolean} - если _истина_, возвращаются сырые данные, а не дата-объекты
     * @param [selection._total_count] {Boolean} - если _истина_, вычисляет общее число записей под фильтром, без учета _skip и _top
     * @return {Promise.<Array>}
     */
    find_rows(_mgr, selection) {
      return Promise.resolve([]);
    }

    /**
     * ### Сохраняет присоединенный файл
     *
     * @method save_attachment
     * @param _mgr {DataManager}
     * @param ref
     * @param att_id
     * @param attachment
     * @param type
     * @return {Promise}
     * @async
     */
    save_attachment(_mgr, ref, att_id, attachment, type) {

      if(!type) {
        type = {type: 'text/plain'};
      }

      if(!(attachment instanceof Blob) && type.indexOf('text') == -1) {
        attachment = new Blob([attachment], {type: type});
      }

      return Promise.resolve();

    }

    /**
     * Получает присоединенный к объекту файл
     * @param _mgr {DataManager}
     * @param ref
     * @param att_id
     * @return {Promise}
     */
    get_attachment(_mgr, ref, att_id) {
      return Promise.resolve();
    }

    /**
     * Удаляет присоединенный к объекту файл
     * @param _mgr {DataManager}
     * @param ref
     * @param att_id
     * @return {Promise}
     */
    delete_attachment(_mgr, ref, att_id) {
      return Promise.resolve();
    }


    /**
     * Формирует архив полной выгрузки базы для сохранения в файловой системе клиента
     * @method backup_database
     * @param [do_zip] {Boolean} - указывает на необходимость архивировать стоки таблиц в озу перед записью файла
     * @async
     */
    backup_database(do_zip) {

      // получаем строку create_tables

      // получаем строки для каждой таблицы

      // складываем все части в файл
    }

    /**
     * Восстанавливает базу из архивной копии
     * @method restore_database
     * @async
     */
    restore_database(do_zip) {

      // получаем строку create_tables

      // получаем строки для каждой таблицы

      // складываем все части в файл
    }

    /**
     * ### Информирует об авторизованности на сервере CouchDB
     *
     * @property authorized
     */
    get authorized() {
      const {_auth} = this.props;
      return _auth && _auth.username;
    }

  };
}

export default ({classes}) => {
  classes.AdapterPostgres = adapter(classes);
}

