
import proto from './proto';
import adapter from './adapter';

const plugin = {

	proto(constructor) {
		// дополняем и модифицируем конструкторы
		proto(constructor);
		adapter(constructor);
	},

	constructor(){
		// создаём экземпляр адаптера нашего типа
		const {AdapterPouch} = this.classes;
		this.adapters.pouch = new AdapterPouch(this);
	}
}
export default plugin;