/**
 * Переопределяет методы менеджеров данных
 *
 * @module proto
 *
 */

import RamIndexer from './ram_indexer'

export default ({classes}) => {

	const {DataManager, DataObj, DocObj, TaskObj, BusinessProcessObj} = classes;

	// RamIndexer в classes
  classes.RamIndexer = RamIndexer;

}
