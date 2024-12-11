/**
 * Методы для вызова диалогов react в процедурном стиле
 *
 * @module dialogs
 *
 * Created by Evgeniy Malyarov on 16.11.2018.
 */

import React from 'react';
import TextField from '@material-ui/core/TextField';
import InputRadio from './InputRadio';
import InputCheckbox from './InputCheckbox';
import Alert from './Alert';
import Dialog from './Dialog';

export default {

  /**
   * ### Инициализирует UI
   * Сюда передаём метод управления состоянием
   * @param handleIfaceState
   */
  init ({handleIfaceState, handleNavigate, DataList, lazy}) {
    Object.assign(this, {handleIfaceState, handleNavigate, DataList, lazy});
  },

  Dialog,
  Alert,

  close_confirm(name = 'confirm') {
    this.handleIfaceState({
      component: '',
      name,
      value: {open: false}
    });
    this._confirm = false;
  },

  /**
   * ### Диалог ввода значения
   * @param [title] {String} - заголовое диалога
   * @param [text] {String} - если задано, будет показан текст
   * @param [timeout] {Number} - секунд до автозакрытия
   * @param [type] {String} - имя типа значение (например, 'cat.clrs')
   * @param [list] {Array} - список значений
   * @param [initialValue] - начальной значение выбора
   * @return {Promise}
   */
  input_value({
                title = 'Ввод значения',
                text,
                timeout = 30000,
                type,
                list,
                initialValue,
                ...other
  }) {

    if(!this.handleIfaceState) {
      return Promise.reject('init');
    }
    if(this._confirm) {
      return Promise.reject('already open');
    }
    if(!type && !list) {
      return Promise.reject('type or list must be defined');
    }
    if(list && list.some((v) => {
      const key = v.value || v.ref || v;
      return !key || typeof key !== 'string';
    })) {
      return Promise.reject('list keys must be defined and has a string type');
    }

    return new Promise((resolve, reject) => {

      const close_confirm = () => {
        this.close_confirm();
        if(timer) {
          clearTimeout(timer);
          timer = 0;
        }
        resolve(value);
      };

      const reject_confirm = () => {
        this.close_confirm();
        if(timer) {
          clearTimeout(timer);
          timer = 0;
        }
        reject();
      };

      const handleChange = (v) => value = v;

      let timer = setTimeout(reject_confirm, timeout);
      let value;
      const iface_state = {
        component: '',
        name: 'confirm',
        value: {
          open: true,
          title,
          text,
          children: [],
          handleOk: close_confirm,
          handleCancel: reject_confirm,
          ...other,
        }
      }

      if(list) {
        if (type === "checkbox") {
          value = list;
          iface_state.value.children = <InputCheckbox list={list} />;
        } 
        else {
          if (!initialValue) {
            initialValue = list[0].value || list[0].ref || list[0];
          }
          value = initialValue.value || initialValue.ref || initialValue;
          iface_state.value.children = <InputRadio
            value={value}
            list={list}
            handleChange={handleChange}
          />;
        }
      } 
      else if(type.includes('.')) {
        value = initialValue ? (initialValue.ref || initialValue) : '';
        const _mgr = $p.md.mgr_by_class_name(type);
        if(_mgr) {
          let {DataList, lazy} = this;
          if(!DataList && lazy){
            DataList = lazy.DataList;
          }
          if(DataList) {
            iface_state.value.children = <DataList
              _mgr={_mgr}
              _acl="r"
              _ref={value}
              handlers={{
                handleSelect: (v) => {
                  _mgr.get(v, 'promise')
                    .then((v) => {
                      handleChange(v);
                      close_confirm();
                    });
                },
              }}
              selectionMode
              denyAddDel
            />;
            iface_state.value.noSpace = true;
            iface_state.value.hide_actions = true;
          }
          else {
            iface_state.value.children = `Компонент DataList не подключен к $p.ui`;
          }
        }
        else {
          iface_state.value.children = `Не найден менеджер для типа '${type}'`;
        }
      }
      else {
        value = initialValue.value || initialValue;
        iface_state.value.children = <TextField
          defaultValue={value}
          onChange={({target}) => {
            if(type === 'number') {
              const v = parseFloat(target.value);
              if(!isNaN(v)) {
                handleChange(v);
              }
            }
            else {
              handleChange(target.value);
            }
          }}
          InputProps={{type}}
        />;
      }

      this.handleIfaceState(iface_state);

    });
  },

  /**
   * Диалог Ок, Отмена
   * @param [title] {String} - заголовое диалога
   * @param [text] {String} - если задано, будет показан текст
   * @param [html] {String} - если задано, будет показан htlm
   * @param [initFullScreen] {Boolean} - открывать распахнутым
   * @param [timeout] {Number} - секунд до автозакрытия
   * @return {Promise}
   */
  confirm({title = 'Внимание', timeout = 30000, ...other}) {
    if(!this.handleIfaceState) {
      return Promise.reject('init');
    }
    if(this._confirm) {
      return Promise.reject('already open');
    }

    return new Promise((resolve, reject) => {

      const close_confirm = () => {
        this.close_confirm();
        if(timer) {
          clearTimeout(timer);
          timer = 0;
        }
        resolve();
      };

      const reject_confirm = () => {
        this.close_confirm();
        if(timer) {
          clearTimeout(timer);
          timer = 0;
        }
        reject();
      };

      let timer = timeout && setTimeout(reject_confirm, timeout);

      this.handleIfaceState({
        component: '',
        name: 'confirm',
        value: {open: true, title, handleOk: close_confirm, handleCancel: reject_confirm, ...other}
      });

    });
  },

  /**
   * Диалог alert
   * @param [title] {String} - заголовое диалога
   * @param [text] {String} - если задано, будет показан текст
   * @param [html] {String} - если задано, будет показан htlm
   * @param [markdown] {String} - если задано, будет показан markdown
   * @param [initFullScreen] {Boolean} - открывать распахнутым
   * @param [Component] {NodeType} - произвольный компонент для рендеринга сожержимого диалога
   * @param [timeout] {Number} - секунд до автозакрытия
   * @param [props] {Object} - дополнительные свойства для передачи в Component
   * @return {Promise}
   */
  alert({title = 'Внимание', timeout = 30000, ...other}) {
    if(!this.handleIfaceState) {
      return Promise.reject('init');
    }
    if(this._confirm) {
      return Promise.reject('already open');
    }

    return new Promise((resolve, reject) => {

      const close_confirm = (res) => {
        this.close_confirm('alert');
        if(timer) {
          clearTimeout(timer);
          timer = 0;
        }
        resolve(res);
      };

      let timer = timeout && setTimeout(close_confirm, timeout);

      this.handleIfaceState({
        component: '',
        name: 'alert',
        value: {open: true, title, handleOk: close_confirm, handleIfaceState: this.handleIfaceState, handleNavigate: this.handleNavigate, ...other}
      });

    });
  },

  /**
   * Всплывающтй snackbar оповещений пользователя
   * @param text
   */
  snack({timeout = 10000, ...other}) {
    if(this.handleIfaceState) {
      const close_confirm = () => {
        this.close_confirm('snack');
        if(timer) {
          clearTimeout(timer);
          timer = 0;
        }
      }
      let timer = setTimeout(close_confirm, timeout);
      this.handleIfaceState({
        component: '',
        name: 'snack',
        value: {
          open: true,
          button: other.reset ? 'Сброс' : 'OK',
          handleClose: other.reset ? null : close_confirm,
          ...other}
      });
    }
  },

  /**
   * Рендерит компонент в отдельное окно
   * @param {React.Component} Component
   * @param {DataObj} obj - объект данных, для которого создаётся окно
   * @param {String} [title] - заголовок
   * @param {Object} [attr] - произвольные дополнительные реквизиты
   * @param {Boolean} [print] - если взведён, печатать сразу после рендера 
   */
  window({Component, obj, title, attr, print}) {
    if(this.handleIfaceState) {
      // если у компонента определён метод класса beforeOpen, вызываем его перед открытием окна
      const pre = typeof Component.beforeOpen === 'function' ?
        Component.beforeOpen({obj, title, attr, print}) : Promise.resolve(); 
      pre.then((props) => {
        this.handleIfaceState({
          component: '',
          name: 'wnd_portal',
          value: {
            open: true,
            Component,
            obj,
            title,
            attr: Object.assign({}, attr, props), // если метод beforeOpen(), вернёт некий объект, подмешиваем его свойства в props вызываемого компонента 
            print,
            handleClose: this.close_confirm.bind(this, 'wnd_portal'),
          }
        });
      });
    }
  },

  popup({anchorEl, timeout = 30000, open, ...other}) {
    if(this.handleIfaceState) {
      const handleClose = () => {
        this.close_confirm('popup');
        if(timer) {
          clearTimeout(timer);
          timer = 0;
        }
      };
      let timer = setTimeout(handleClose, timeout);
      this.handleIfaceState({
        component: '',
        name: 'popup',
        value: {anchorEl, handleClose, open: Boolean(anchorEl), ...other}
      });
    }
  },

};
