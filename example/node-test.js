
const MetaEngine = require('../core/dist');
// MetaEngine.plugin(...)
const $p = global.$p = new MetaEngine();
// параметры сеанса инициализируем сразу
$p.jobPrm.init(require('./app.settings'));
$p.md.init(require('./meta.json'));
$p.md.createManagers([]);

console.log($p.cat);
