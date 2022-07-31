/**
 * ### модификатор метод columns() справочника scheme_settings - добавляет форматтеры и редакторы
 *
 * @module rx_columns
 *
 * Created 10.01.2017
 */

import React from 'react';
import ReactDOM from 'react-dom';

import DataCell from 'metadata-react/DataField/DataCell';
import DataCellTyped from "./DataField/DataCellTyped";
import TypeFieldCell from 'metadata-react/DataField/FieldTypeCell';
import PathFieldCell from 'metadata-react/DataField/FieldPathCell';
import PropsFieldCell from 'metadata-react/DataField/FieldPropsCell';
import dialogs from 'metadata-react/App/dialogs';
import {Editors, Formatters} from 'react-data-grid-addons';
import DataGrid from 'react-data-grid';
import {withStyles, makeStyles} from '@material-ui/styles';
import * as muiCore from '@material-ui/core';
import classnames from 'classnames';
import SchemeSettingsObj from './SchemeSettings/SchemeSettingsLazyObj';

const {CheckboxEditor, DropDownEditor, SimpleTextEditor} = Editors;
const {editors: {EditorBase}, Row, RowComparer} = DataGrid;

const {DropDownFormatter, ImageFormatter} = Formatters;
const stub = {presentation: ''};

class ToggleEditor extends CheckboxEditor {

  getInputNode() {

  }

  getValue() {
    return this.props.rowData[this.props.column.key];
  }

  handleChange(e) {
    const {rowData, column} = this.props;
    rowData[column.key] = !rowData[column.key];
    //this.props.column.onCellChange(this.props.rowIdx, this.props.column.key, this.props.dependentValues, e);
  }
}

EditorBase.prototype.getInputNode = SimpleTextEditor.prototype.getInputNode = function () {
  let domNode = ReactDOM.findDOMNode(this);
  if (domNode.tagName === 'INPUT' || domNode.tagName === 'SELECT') {
    return domNode;
  }

  return domNode.querySelector('input:not([type=hidden])');
}

Row.prototype.shouldComponentUpdate = function(nextProps) {
  const res = RowComparer(nextProps, this.props);
  if(!res && nextProps.row._modified) {
    Promise.resolve().then(() => {delete nextProps.row._modified});
    return true;
  }
  return res;
}

function rx_columns({utils: {moment}, enm, md}) {

  const typed_formatters = {};

  const indicator_formatter = (is_doc, is_date) => ({value, row}) => {
    if(value && value.toString) {
      value = value.toString();
    }
    let indicator = 'cell_ref_elm';
    if(row.deleted) {
      indicator = is_doc ? 'cell_doc_deleted' : 'cell_ref_elm_deleted';
    }
    else if(row._open) {
      indicator = 'cell_ref_folder_open';
    }
    else if(row.is_folder) {
      indicator = 'cell_ref_folder';
    }
    else if(is_doc) {
      indicator = row.posted ? 'cell_doc_posted' : 'cell_doc';
    }
    if(is_date) {
      const values = value.split(' ');
      if(values.length === 2) {
        return <div className={indicator} title={value}>{values[0]}<small>{` ${values[1]}`}</small></div>;
      }
    }
    return <div className={indicator} title={value}>{value}</div>;
  };

  const date_formatter = (format, indicator, is_doc) => {
    const formatter = indicator && indicator_formatter(is_doc, true);
    return ({value, row}) => {
      if(!value || value.length < 5) {
        value = String(value || '');
      }
      else {
        value = moment(value).format(moment._masks[format]);
      }
      if(formatter) {
        return formatter({value, row});
      }
      const values = value.split(' ');
      if(values.length === 2) {
        return <div className={indicator} title={value}>{values[0]}<small>{` ${values[1]}`}</small></div>;
      }
      return <div title={value}>{value}</div>;
    }
  }

  const presentation_formatter = ({value}) => {
    let text = typeof value === 'string' ? value : (value && value.presentation) || '';
    if(text === '_') {
      text = '';
    }
    return <div title={text}>{text}</div>;
  };

  const typed_formatter = (type) => {
    if(typed_formatters[type]) {
      return typed_formatters[type];
    }
    const _mgr = md.mgr_by_class_name(type);
    if(_mgr) {
      typed_formatters[type] = (row) => {
        return presentation_formatter({value: _mgr.get(row.value, true) || stub});
      };
      return typed_formatters[type];
    }
  }

  const number_formatter = (fraction = 0) => {
    return ({value}) => {
      if(!value && value !== 0) value = 0;
      const text = typeof value === 'number' ? value.toFixed(fraction) : value.toString();
      return <div title={text} style={{textAlign: 'right'}}>{text}</div>;
    };
  };

  const bool_formatter = ({value}) => {
    return <div>{value ? 'Да' : 'Нет'}</div>;
  };

  const props_formatter = ({value}) => {
    return <div title={value.toString()}>{value.presentation}</div>;
  };

  return function columns({mode, fields, _obj, _mgr, read_only}) {

    const res = this.columns(mode);
    const {input, text, label, link, cascader, toggle, image, type, path, props, typed_field} = enm.data_field_kinds;
    if(!_mgr && _obj) {
      _mgr = _obj._manager;
    }
    const editable = (_obj && !read_only) ? _mgr.class_name.indexOf('rep.') !== 0 || this.obj.indexOf(`.${_mgr._tabular || 'data'}`) === -1 : false;
    const is_doc = _mgr.class_name.startsWith('doc.');

    if(fields) {
      res.forEach((column, index) => {

        const keys = column.key.split('.');
        let _fld = column._meta = fields[keys[0]];
        for(let i = 1; i < keys.length; i++) {
          const pmeta = md.get(_fld.type.types[0]);
          if(pmeta) {
            _fld = column._meta = pmeta.fields[keys[i]];
          }
        }
        if(!_fld && _mgr) {
          _fld = column._meta = _mgr.metadata(keys[0]);
        }

        if(!column.formatter && _fld && _fld.type) {

          if(column.key === 'ref' || _fld.type.is_ref) {
            column.formatter = !_obj && _fld.type.types[0].includes('.') ? typed_formatter(_fld.type.types[0]) : presentation_formatter;
          }
          else if(_fld.type.date_part) {
            column.formatter = date_formatter(_fld.type.date_part, !index && !editable, is_doc);
          }
          else if(_fld.type.digits && _fld.type.types.length === 1){
            column.formatter = number_formatter(_fld.type.fraction);
          }
          else if(_fld.type.types.includes('boolean')) {
            column.formatter = bool_formatter;
          }
        }

        switch (column.ctrl_type) {

        case label:
          break;

        case input:
        case text:
        case link:
        case cascader:
          column.editable = editable;
          break;

        case toggle:
          const toggle_options = [
            {
              id: 0,
              value: false,
              text: 'Нет',
              title: 'Нет',
            },
            {
              id: 1,
              value: true,
              text: 'Да',
              title: 'Да',
            }
          ];
          if(editable){
            column.editor = <DropDownEditor options={toggle_options}/>;
          }
          column.formatter = <DropDownFormatter options={toggle_options} value={''}/>;
          break;

        case path:
          if(editable){
            column.editor = PathFieldCell;
          }
          break;

        case type:
          if(editable){
            column.editor = TypeFieldCell;
          }
          break;

        case props:
          if(editable){
            column.editor = PropsFieldCell;
          }
          column.formatter = props_formatter;
          break;

        case typed_field:
          if(editable){
            column.editor = DataCellTyped;
          }
          column.formatter = presentation_formatter;
          break;

        default:
          if(editable){
            column.editor = DataCell;
          }
          else if(!column.formatter && !index) {
            column.formatter = indicator_formatter(is_doc);
          }
        }

      });
    }

    return res;
  };
}

/**
 * ### Обработчики экспорта
 *
 * @module export_handlers
 *
 * Created 10.01.2017
 */

export function export_handlers() {

  this.doExport = (format, evt) => {
    const {handleMenuClose, props: {_obj, _tabular, _columns}} = this;
    const t = typeof _tabular === 'object' && _tabular.export ? _tabular : _obj && _obj[_tabular];
    t && t.export(format, _columns.map(({key}) => key), evt && evt.target);
    handleMenuClose && handleMenuClose();
  };

  this.handleExportXLS = (evt) => this.doExport('xls', evt);
  this.handleExportJSON = (evt) => this.doExport('json', evt);
  this.handleExportCSV = (evt) => this.doExport('csv', evt);

  this.handleMenuOpen = (evt) => this.setState({menuOpen: true, anchorEl: evt.currentTarget});
  this.handleMenuClose = (evt) => this.setState({menuOpen: false});

}

/**
 * ### Методы печати в прототип DataManager
 *
 * @module print
 *
 * Created 10.01.2017
 */


function print(DataObj) {
  /**
   * Печатает объект
   * @method print
   * @param ref {DataObj|String} - guid ссылки на объект
   * @param model {String|DataObj.cat.formulas} - идентификатор команды печати
   * @param [wnd] {dhtmlXWindows} - окно, из которого вызываем печать
   */
  return function print(ref, model, wnd) {

    function tune_wnd_print(wnd_print) {
      wnd && wnd.progressOff && wnd.progressOff()
      wnd_print && wnd_print.focus();
    }

    wnd && wnd.progressOn && wnd.progressOn();

    setTimeout(tune_wnd_print, 3000);

    // если _printing_plates содержит ссылку на обрабочтик печати, используем его
    if(this._printing_plates[model] instanceof DataObj) {
      model = this._printing_plates[model];
    }

    // если существует локальный обработчик, используем его
    if(model instanceof DataObj && model.execute) {
      return this.get(ref, 'promise')
        .then(model.execute.bind(model))
        .then(tune_wnd_print);
    }
    else {

      // иначе - печатаем средствами 1С или иного сервера
      const rattr = {};
      $p.ajax.default_attr(rattr, job_prm.irest_url());
      rattr.url += this.rest_name + '(guid\'' + utils.fix_guid(ref) + '\')' +
        '/Print(model=' + model + ', browser_uid=' + wsql.get_user_param('browser_uid') + ')';

      return $p.ajax.get_and_show_blob(rattr.url, rattr, 'get')
        .then(tune_wnd_print);
    }

  }

}

/**
 * Плагин-модификатор react-ui для metadata.js
 *
 * @module plugin
 *
 * Created 07.01.2017
 */


/**
 * Экспортируем объект-плагин для модификации metadata.js
 */
export default {

  /**
   * ### Модификатор конструктора MetaEngine
   * Вызывается в контексте экземпляра MetaEngine
   */
  constructor() {

    const {cat, CatScheme_settings, classes: {DataManager, DataObj}} = this;

    // модифицируем метод columns() справочника scheme_settings - добавляем форматтеры и редакторы
    Object.defineProperty(CatScheme_settings.prototype, 'rx_columns', {value: rx_columns(this)});

    // методы печати в прототип DataManager
    Object.defineProperty(DataManager.prototype, 'print', {value: print(DataObj)});

    // публичные методы ui
    Object.defineProperty(this, 'ui', {
      value: {
        dialogs,
        React,
        ReactDOM,
        withStyles,
        makeStyles,
        ...muiCore,
        classnames,
        prevent(evt) {
          try {evt.preventDefault();}
          catch(e) {}
          try {evt.stopPropagation();}
          catch(e) {}
        },
      }
    });

    // форма по умолчанию для scheme_settings
    const {scheme_settings} = cat;
    if(scheme_settings) {
      scheme_settings.FrmObj = SchemeSettingsObj;
    }

  }
};
