import {log_in, log_out, log_error} from './actions_auth';
import {data_page, data_loaded, data_error, load_start, autologin,
  no_data, sync_data, sync_error, sync_paused, sync_resumed, sync_denied} from './actions_pouch';
import {change} from './actions_obj';
import {second_instance} from './actions_base';
import Idle from './idle';


let attached;

/**
 * Подключает диспетчеризацию событий redux к pouchdb
 */
export default function metaMiddleware({adapters, md, job_prm}) {
  return ({dispatch}) => {
    return next => action => {
      if(!attached) {
        attached = true;

        // события pouchdb
        adapters.pouch.on({

          user_log_in: (name) => dispatch(log_in(name)),

          user_log_out: () => dispatch(log_out()),

          user_log_fault: (err) => dispatch(log_error(err)),

          user_log_stop: () => dispatch(log_in()),

          pouch_data_page: (page) => dispatch(data_page(page)),

          pouch_data_loaded: (page) => dispatch(data_loaded(page)),

          pouch_doc_ram_loaded: () => dispatch(data_loaded('doc_ram')),

          pouch_complete_loaded: () => dispatch(data_loaded('complete')),

          pouch_data_error: (dbid, err) => dispatch(data_error(dbid, err)),

          pouch_load_start: (page) => dispatch(load_start(page)),

          pouch_autologin: (page) => dispatch(autologin()),

          pouch_no_data: (dbid, err) => dispatch(no_data(dbid, err)),

          pouch_sync_data: (dbid, change) => dispatch(sync_data(dbid, change)),

          pouch_sync_error: (dbid, err) => dispatch(sync_error(dbid, err)),

          pouch_sync_paused: (dbid, info) => dispatch(sync_paused(dbid, info)),

          pouch_sync_resumed: (dbid, info) => dispatch(sync_resumed(dbid, info)),

          pouch_sync_denied: (dbid, info) => dispatch(sync_denied(dbid, info)),

        });

        // события metaengine
        md.on({
          obj_loaded: (_obj) => {
            dispatch(change(_obj._manager.class_name, _obj.ref));
          },
          second_instance: (_obj) => {
            dispatch(second_instance());
          },

          setting_changed: () => {
          },
        });

        // события window
        if(job_prm.idle_timeout) {
          job_prm.idle = new Idle(dispatch, job_prm.idle_timeout);
        }

      }
      return next(action);
    };
  };
}

