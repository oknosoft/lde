
const MetaEngine = require('../core/dist');
// MetaEngine.plugin(...)
const $p = global.$p = new MetaEngine();

console.log($p.version);
