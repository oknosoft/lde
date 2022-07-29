/**
 * ### Табы сохраненных настроек
 * По умолчанию, приклеены к диалогу, но их можно расположить где угодно
 *
 * @module SchemeSettings
 *
 * Created 19.12.2016
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';

import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import FormGroup from '@material-ui/core/FormGroup';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import TabularSection from '../TabularSection';
import SchemeSettingsSelect from './SchemeSettingsSelect';
import DataField, {FieldSelect} from '../DataField';
import Divider from '@material-ui/core/Divider';


/**
 * Wrapper for tabs whitch returned function above.
 */
export default class SchemeSettingsTabs extends Component {

  state = {
    value: 0
  };

  handleTabChange = (event, value) => {
    this.setState({value});
  };

  get sizes() {
    const {dnr} = this.context;
    let {width, height} = this.props;
    if(!height) {
      height = dnr && parseInt(dnr.frameRect.height) - 130;
    }
    if(!height || height < 260) {
      height = 260;
    }
    if(!width) {
      width = dnr && parseInt(dnr.frameRect.width);
    }
    return {width, height};
  }

  rowSelection(scheme, by_row) {
    return {
      showCheckbox: true,
      enableShiftSelect: true,
      selectBy: {
        keys: {
          rowKey: by_row ? 'row' : 'field',
          markKey: 'use',
          values: by_row ? scheme[by_row].find_rows({use: true}).map(r => r.row) : scheme.used_fields()
        }
      }
    }
  }

  render() {

    const {state, props, sizes} = this;
    const {scheme, handleSchemeChange, frm_key, source_mode, tabParams} = props;
    const {value} = state;
    const is_tabular = scheme.obj.split('.').length > 2;
    const styleBar = sizes.width ? {width: sizes.width} : undefined;
    const styleTabs = {height: sizes.height, width: sizes.width};
    if(sizes.width) {
      styleTabs.width = sizes.width;
    }

    // до лучших времён, настройки показываем только полноправному пользователю
    const {current_user} = $p;
    const is_admin = current_user.role_available('ИзменениеТехнологическойНСИ') ||
      current_user.roles.includes('doc_full') || current_user.roles.includes('_admin');

    return is_admin ? [
      <AppBar key="bar" position="static" color="default" style={styleBar}>
        <Tabs
          value={value}
          onChange={this.handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="on"
        >
          <Tab label="Параметры"/>
          <Tab label="Колонки"/>
          <Tab label="Отбор"/>
          {is_tabular && <Tab label="Группировка"/>}
          {is_tabular && <Tab label="Ресурсы"/>}
          <Tab label="Сортировка"/>
          <Tab label="Оформление"/>
          <Tab label="Вариант"/>
        </Tabs>
      </AppBar>,

      <div key="tabs" style={styleTabs}>
        {value === 0 &&
        (tabParams ? tabParams : (
          scheme.query.match('date') ?
            <div>
              <DataField _obj={scheme} _fld="date_from"/>
              <DataField _obj={scheme} _fld="date_till"/>
            </div>
            :
            <TabularSection _obj={scheme} _tabular="params"/>
        ))}

        {value === 1 && <TabularSection
          _obj={scheme}
          _tabular="fields"
          rowSelection={this.rowSelection(scheme)}
        />}

        {value === 2 && <TabularSection
          _obj={scheme}
          _tabular="selection"
          rowSelection={this.rowSelection(scheme, 'selection')}
        />}

        {is_tabular && (value === 3) && <TabularSection
          _obj={scheme}
          _tabular="dimensions"
          rowSelection={this.rowSelection(scheme, 'dimensions')}
        />}

        {is_tabular && (value === 4) && <TabularSection _obj={scheme} _tabular="resources"/>}

        {value === (is_tabular ? 5 : 3) && <TabularSection
          _obj={scheme}
          _tabular="sorting"
          rowSelection={this.rowSelection(scheme, 'sorting')}
        />}

        {value === (is_tabular ? 6 : 4) && <TabularSection
          _obj={scheme}
          _tabular="conditional_appearance"
          rowSelection={this.rowSelection(scheme, 'conditional_appearance')}
        />}

        {value === (is_tabular ? 7 : 5) && <SchemeSettingsSelect
          scheme={scheme}
          handleSchemeChange={handleSchemeChange}
          frm_key={frm_key}
          source_mode={source_mode}
        />}

      </div>
    ]
      :
      <div style={styleTabs}>{
        tabParams ? tabParams : (
          scheme.query.match('date') ?
            <div>
              <DataField _obj={scheme} _fld="date_from"/>
              <DataField _obj={scheme} _fld="date_till"/>
            </div>
            :
            <TabularSection _obj={scheme} _tabular="params"/>
        )
      }</div>;
  }
}

SchemeSettingsTabs.propTypes = {
  scheme: PropTypes.object.isRequired,
  handleSchemeChange: PropTypes.func.isRequired,
  tabParams: PropTypes.object,
  frm_key: PropTypes.string,
  source_mode: PropTypes.string,
};

SchemeSettingsTabs.contextTypes = {
  dnr: PropTypes.object
};
