
/**
 * При установке параметров сеанса
 * Процедура устанавливает параметры работы программы при старте веб-приложения
 *
 * @param prm {Object} - в свойствах этого объекта определяем параметры работы программы
 */

const isNode = typeof process !== 'undefined' && process.versions?.node;
const lsPrefix = 'www_';

module.exports = function settings(prm = {}) {

  return Object.assign(prm, {

      isNode,

      // разделитель для localStorage
      lsPrefix,

      // по умолчанию, обращаемся к зоне 1
      zone: 0,

      // размер вложений 5Mb
      attachmentMaxSize: 5000000,

      // ключи google, yandex.map, dadata и т.д.
      keys: {
        geonames: 'oknosoft',
      },

      additionalPrms: [],

    },
    isNode && {
      // авторизация couchdb
      userNode: {
        username: process.env.DBUSER || 'admin',
        password: process.env.DBPWD || 'admin',
        secret: process.env.COUCHSECRET,
      },

      server: {
        prefix: '/adm/api',             // Mount path, no trailing slash
        port: process.env.PORT || 3033, // Port
        lang: process.env.LANG || 'ru', // язык текущего экземпляра
        startCommon: Boolean(process.env.START_COMMON),
        commonUrl: process.env.RAMURL || 'http://localhost:3036',
        maxpost: 40 * 1024 * 1024,      // Max size of POST request
        abonents: process.env.ABONENTS ? JSON.parse(process.env.ABONENTS) : [0],  // абоненты - источники
        branches: process.env.BRANCHES ? JSON.parse(process.env.BRANCHES) : null, // список отделов можно ограничить
        singleDb: true,                                    // использовать основную базу doc вместо перебора баз абонентов
        noMdm: Boolean(process.env.NOMDM),
        disableMdm: Boolean(process.env.DISABLEMDM),
        defer: (process.env.DEFER ? parseFloat(process.env.DEFER) : 20000) + Math.random() * 10000,  // задержка пересчета mdm
        rater: {                        // Request rate locker
          all: {                        // Total requests limit
            interval: 4,                // Seconds, collect interval
            limit: 2000,                // Max requests per interval - пока не используем
          },
          ip: {                         // Per-ip requests limit
            interval: 3,
            limit: 20,                  // Если limit > 20, добавляем задержку в несколько мс
          }
        },
      },

      workers: {
        count: process.env.WORKERS_COUNT ? parseFloat(process.env.WORKERS_COUNT) : 1,  // Total threads
        reloadAt: process.env.RELOAD_AT ? parseFloat(process.env.RELOAD_AT) : 3,       // Hour all threads are restarted
        reloadOverlap: 40e3,      // Gap between restarts of simultaneous threads
        killDelay: 10e3           // Delay between shutdown msg to worker and kill, ms
      },
    });
};
