/**
 * ### Абстрактное поле ввода
 * Тип элемента управления вычисляется по метаданным поля
 *
 * @module AbstractField
 *
 */

import React, {} from 'react';
import PropTypes from 'prop-types';
import MComponent from '../common/MComponent';

export function suggestionText(suggestion) {
  const text = suggestion ? suggestion.presentation || suggestion.toString() : '';
  return text === '_' ? '' : text;
}

export class FieldWithMeta extends MComponent {

  constructor(props, context) {
    super(props, context);
    const {_obj, _fld, _meta, dyn_meta} = props;
    if(dyn_meta && _meta) {
      Object.defineProperty(this, '_meta', {
        get() {
          return this.props._meta;
        }
      })
    }
    else {
      this._meta = _meta || (typeof _obj._metadata === 'function' ? _obj._metadata(_fld) : _obj._metadata?.fields[_fld]) || {type: {types: ['string']}};
      if(!this._meta.synonym) {
        if(_fld === 'parent') {
          this._meta.synonym = 'Группа';
        }
        else if(_fld === 'owner') {
          this._meta.synonym = 'Владелец';
        }
      }

      if(this._meta.choice_type) {
        const {path} = this._meta.choice_type;
        const prm = _obj[path[path.length - 1]] || (_obj._owner && _obj._owner[path[path.length - 1]]);
        if(prm && !prm.empty()) {
          this._meta = Object.assign({}, this._meta, {type: prm.type});
          prm.choice_params && prm.choice_params.forEach(({name, path}) => {
            if(!this._meta.choice_params){
              this._meta.choice_params = [];
            }
            this._meta.choice_params.push({name, path});
          });
        }
      }
    }
  }
}

FieldWithMeta.propTypes = {
  _obj: PropTypes.object.isRequired,  // DataObj, к реквизиту которого будет привязано поле
  _fld: PropTypes.string.isRequired,  // имя поля объекта - путь к данным
  _meta: PropTypes.object,            // метаданные поля - могут быть переопределены снаружи, если не указано, будут задействованы стандартные метаданные

  dyn_meta: PropTypes.bool,           // требование "не кешировать метаданные" - всегда получать из props
  fullWidth: PropTypes.bool,          // растягивать по ширине
  label_position: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),   // положение заголовка, $p.enm.label_positions
  read_only: PropTypes.bool,          // поле только для чтения
  mandatory: PropTypes.bool,          // поле обязательно для заполнения
  multi: PropTypes.bool,              // множественный выбор - значение является массивом
  handleValueChange: PropTypes.func,  // обработчик при изменении значения в поле
};

export default class AbstractField extends FieldWithMeta {

  constructor(props, context) {
    super(props, context);
    const {_obj, _fld} = props;
    this.state = {value: _obj[_fld]};
    this.onChange = this.onChange.bind(this);
  }

  get isTabular() {
    const {props} = this;
    return props.hasOwnProperty('isTabular') ? props.isTabular : $p.utils.is_tabular(props._obj);
  }

  get read_only() {
    const {props, _meta} = this;
    const {read_only} = (props.hasOwnProperty('read_only') ? props : _meta);
    return read_only;
  }

  onChange({target}) {
    const {_obj, _fld, handleValueChange} = this.props;
    _obj[_fld] = target.value;
    handleValueChange && handleValueChange(target.value);
    this._mounted && this.setState({value: _obj[_fld]});
  };
};

