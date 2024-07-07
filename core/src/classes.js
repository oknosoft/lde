import * as mngrs from './mngrs';
import * as objs from './objs';
import * as tabulars from './tabulars';
import Meta from './meta';
import MetaEventEmitter from './meta/emitter';
import AbstracrAdapter from './adapter';

const classes = Object.assign({Meta, MetaEventEmitter, AbstracrAdapter}, mngrs, objs, tabulars);
export default classes;
