/**
 * Экспортирует конструктор PouchDB с учетом среды исполнения
 */

let PouchDB;

/**
 * В зависимости от среды исполнения, подключаем адаптер memory или idb или websql
 * isNode
 */
if(typeof process !== 'undefined' && process.versions && process.versions.node) {
  PouchDB = require('pouchdb-core')
    .plugin(require('pouchdb-adapter-http'))
    .plugin(require('pouchdb-replication'))
    .plugin(require('pouchdb-mapreduce'))
    .plugin(require('pouchdb-find'))
    .plugin(require('pouchdb-adapter-memory'));
}
else if(typeof window !== 'undefined' && window.PouchDB) {
  PouchDB = window.PouchDB;
}
else {
  PouchDB = require('pouchdb-core').default
    .plugin(require('pouchdb-adapter-http').default)
    .plugin(require('pouchdb-replication').default)
    .plugin(require('pouchdb-mapreduce').default)
    .plugin(require('pouchdb-find').default)
    .plugin(require('pouchdb-adapter-indexeddb').default);
  if(typeof window !== 'undefined') {
    window.PouchDB = PouchDB;
  }
}

export default PouchDB;

