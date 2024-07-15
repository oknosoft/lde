/*
 * Содержит методы и подписки на события PouchDB
 * для хранения данных в idb браузера и синхронизации с CouchDB
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2023
 */


import PouchDB from './pouchdb';

const purge_fields = '_id,search,timestamp'.split(',');
function purge(res) {
  for(const fld of purge_fields) {
    delete res[fld];
  }
}

function attachments(adapter) {

  /**
   * Получает присоединенный к объекту файл
   * @param _mgr {DataManager}
   * @param ref
   * @param att_id
   * @return {Promise}
   */
  adapter.attachment.get = function getAttachment(_mgr, ref, att_id) {
    return this.db(_mgr).getAttachment(_mgr.class_name + '|' + this.$p.utils.fix.guid(ref), att_id);
  }
  .bind(adapter);

  /**
   * Сохраняет присоединенный файл
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
  adapter.attachment.save = function saveAttachment(_mgr, ref, att_id, attachment, type) {

    if(!type) {
      type = {type: 'text/plain'};
    }

    if(!(attachment instanceof Blob) && type.indexOf('text') == -1) {
      attachment = new Blob([attachment], {type: type});
    }

    // получаем ревизию документа
    let _rev,
      db = this.db(_mgr);

    ref = _mgr.class_name + '|' + this.$p.utils.fix.guid(ref);

    return db.get(ref)
      .then((res) => {
        if(res) {
          _rev = res._rev;
        }
      })
      .catch((err) => {
        if(err.status != 404) {
          throw err;
        }
      })
      .then(() => {
        return db.putAttachment(ref, att_id, _rev, attachment, type);
      });

  }
    .bind(adapter);

  /**
   * Удаляет присоединенный к объекту файл
   * @param _mgr {DataManager}
   * @param ref
   * @param att_id
   * @return {Promise}
   */
  adapter.attachment.delete = function delete_attachment(_mgr, ref, att_id) {

    // получаем ревизию документа
    let _rev,
      db = this.db(_mgr);

    ref = _mgr.class_name + '|' + this.$p.utils.fix.guid(ref);

    return db.get(ref)
      .then((res) => {
        if(res) {
          _rev = res._rev;
        }
      })
      .catch((err) => {
        if(err.status != 404) {
          throw err;
        }
      })
      .then(() => {
        return db.removeAttachment(ref, att_id, _rev);
      });
  }
    .bind(adapter);
}

function adapter({AbstracrAdapter}, {own}) {


  /**
   * Интерфейс локальной и сетевой баз данных PouchDB
   *
   * @extends AbstracrAdapter
   */
  return class AdapterPouch extends AbstracrAdapter {

    constructor(owner) {
      super(owner);
      attachments(this);
      Object.defineProperty(this, 'local', {value: {}, enumerable: true});
      Object.defineProperty(this, 'remote', {value: {}, enumerable: true});
    }

    get props() {
      return this[own].jobPrm;
    }

    /**
     * @summary Инициализация после авторизации
     * @desc Или на старте приложения, если включён автономный режим
     * @param {Object} attr
     */
    async init(attr) {
      if(this.props.idb) {
        let res = Promise.resolve();
        for(const name of this[own].md.bases) {
          if(['ram', 'doc'].includes(name)) {
            Object.defineProperty(this.local, name, {
              value: new PouchDB(name, {adapter: 'indexeddb', revs_limit: 20})
            });
            res = res.then(() => this.local[name].info());
          }
        }
        return res;
      }
    }

    loadRam() {
      const {md} = this[own];
      return this.local.ram.allDocs({include_docs: true, limit: 1e6})
        .then(({rows}) => {
          for(const {doc} of rows) {
            const [id, ref] = doc._id.split('|');
            if(id && ref) {
              const mgr = md.mgr(id);
              if(mgr) {
                delete doc._id;
                doc.ref = ref;
                mgr.create(doc);
              }
            }
          }
        });
    }


  };
}

export default (constructor) => {

  const {classes, symbols} = constructor;
  classes.PouchDB = PouchDB;
  classes.AdapterPouch = adapter(classes, symbols);

}

