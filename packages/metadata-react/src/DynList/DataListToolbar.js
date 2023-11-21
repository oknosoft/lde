import React, {Component} from 'react';
import PropTypes from 'prop-types';

import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';

import AddIcon from '@material-ui/icons/AddCircleOutline';
import RemoveIcon from '@material-ui/icons/DeleteOutline';
import EditIcon from '@material-ui/icons/Edit';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import AttachIcon from '@material-ui/icons/AttachFile';
import HistoryIcon from '@material-ui/icons/History';
import SelectIcon from '@material-ui/icons/PlaylistAddCheck';
import SettingsIcon from '@material-ui/icons/Settings';
import TreeIcon from '@material-ui/icons/AccountTree';
import ListIcon from '@material-ui/icons/List';

import SchemeSettingsButtons from '../SchemeSettings/SchemeSettingsButtons';
import SearchBox from '../SchemeSettings/SearchBox';
import DateRange from '../SchemeSettings/DateRange';

import {compose} from 'redux';
import classnames from 'classnames';
import withStyles from '../Header/toolbar';
import withWidth, {isWidthUp} from '@material-ui/core/withWidth';

import MenuPrint from './MenuPrint';


class DataListToolbar extends Component {

  state = {
    anchorEl: undefined,
    open: false,
  };

  handleClick = event => {
    this.setState({open: true, anchorEl: event.currentTarget});
  };

  handleRequestClose = () => {
    this.setState({open: false});
  };

  handleSettingsToggle = () => {
    const {props} = this;
    if(props.settings_open) {
      props.handleSettingsClose();
    }
    else {
      props.handleSettingsOpen();
    }
    this.handleRequestClose();
  };

  render() {

    const {props, state} = this;
    const {classes, scheme, width, btns, end_btns, alter_end_btns, menu_items, toolbar2row, flat, show_flat, setting_in_menu} = props;
    const widthUpSm = isWidthUp('sm', width);

    return [
      <Toolbar key="toolbar1" disableGutters className={classes.toolbar}>

        {props.selectionMode && <Button
          key="select"
          title="Выбрать из списка"
          size="small"
          variant="outlined"
          className={classes.spaceLeft}
          onClick={props.handleSelect}>Выбрать</Button>}

        {!props.denyAddDel && <IconButton key="create" title="Создать объект" onClick={props.handleAdd}><AddIcon/></IconButton>}

        {props.handleEdit && !props.hide_edit && <IconButton
          key="edit" title="Открыть форму объекта" onClick={props.handleEdit}><EditIcon/></IconButton>}

        {!props.denyAddDel && !props.denyDel && <IconButton
          key="del" title="Пометить на удаление" onClick={props.handleRemove}><RemoveIcon/></IconButton>}

        {show_flat && <IconButton
          key="flat"
          title={flat ? 'Включить иерархию' : 'Включить плоский список'}
          onClick={props.flatChange}>{flat ? <ListIcon/> : <TreeIcon/>}</IconButton>}

        {!scheme.standard_period.empty() && widthUpSm && <IconButton disabled>|</IconButton>}

        {!scheme.standard_period.empty() && widthUpSm && !btns && <DateRange
          _obj={scheme}
          _fld={'date'}
          _meta={{synonym: 'Период'}}
          classes={classes}
          handleChange={props.handleFilterChange}
        /> /* если не указаны дополнительные кнопки и в схеме предусмотрен выбор периода, показываем кнопку Период */}

        {(!toolbar2row || widthUpSm) && btns /* дополнительные кнопки */}

        <div className={classes.flex} />

        <SchemeSettingsButtons
          handleSettingsOpen={props.handleSettingsOpen}
          handleSettingsClose={props.handleSettingsClose}
          handleSchemeChange={props.handleSchemeChange}
          handleFilterChange={props.handleFilterChange}
          settings_open={props.settings_open}
          classes={classes}
          scheme={scheme}
          show_search={props.show_search && (!toolbar2row || widthUpSm)}
          show_variants={props.show_variants}
          hide_btn={!widthUpSm || setting_in_menu}
        />

        {(!toolbar2row || widthUpSm) && !alter_end_btns && end_btns /* дополнительные кнопки */}

        {alter_end_btns /* дополнительные кнопки */}

        {!alter_end_btns && <IconButton onClick={this.handleClick} title="Дополнительно"><MoreVertIcon/></IconButton>}
        {!alter_end_btns &&
          <Menu
          anchorEl={state.anchorEl}
          open={state.open}
          onClose={this.handleRequestClose}
          >
          {(!widthUpSm || setting_in_menu) &&
          <MenuItem onClick={this.handleSettingsToggle}><ListItemIcon><SettingsIcon/></ListItemIcon>{
            `${props.settings_open ? 'Скрыть н' : 'Н'}астройки`
          }</MenuItem>}

          {props.handlePrint && <MenuPrint scheme={scheme} handlePrint={props.handlePrint} />}

          {props.handleHistory &&
            <MenuItem onClick={() => {
              this.handleRequestClose();
              props.handleHistory();
            }}><ListItemIcon><HistoryIcon/></ListItemIcon>История</MenuItem>}

          {props.handleAttachments &&
          <MenuItem onClick={props.handleAttachments}><ListItemIcon><AttachIcon/></ListItemIcon>Вложения</MenuItem>}

          {menu_items /* дополнительные пункты меню */}
          </Menu>
        }

      </Toolbar>,

      toolbar2row && !widthUpSm && <Toolbar key="toolbar2" disableGutters className={classes.toolbar}>
        {btns /* дополнительные кнопки */}
        <div className={classes.flex}/>
        {end_btns /* дополнительные кнопки */}
        <SearchBox
          scheme={scheme}
          handleFilterChange={props.handleFilterChange}
          isWidthUp={widthUpSm}
        />
      </Toolbar>
    ];
  }
}

DataListToolbar.propTypes = {
  selectionMode: PropTypes.bool,                  // режим выбора из списка. Если истина - дополнительно рисум кнопку выбора
  denyAddDel: PropTypes.bool,                     // Запрет добавления и удаления строк (скрывает кнопки в панели, отключает обработчики)

  handleSchemeChange: PropTypes.func.isRequired,  // обработчик при изменении настроек компоновки
  scheme: PropTypes.object.isRequired,            // значение настроек компоновки

  handleAdd: PropTypes.func,                      // обработчик добавления объекта
  handleEdit: PropTypes.func,                     // обработчик открфтия формы редактора
  handleRemove: PropTypes.func,                   // обработчик удаления строки
  handlePrint: PropTypes.func,                    // обработчик открытия диалога печати
  handleAttachments: PropTypes.func,              // обработчик открытия диалога присоединенных файлов

  end_btns: PropTypes.node,
  alter_end_btns: PropTypes.node,
  menu_items: PropTypes.node,
};

DataListToolbar.defaultProps = {
  show_search: true
};


export default compose(withStyles, withWidth())(DataListToolbar);

