/**
 * Поле ввода числовых данных
 *
 */

import React from 'react';
import cn from 'classnames';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/InputBase';
import FormControl from '@material-ui/core/FormControl';
import { NumericFormat  } from 'react-number-format';
import withStyles from './styles';

function NumberFormatCustom(props) {
  const { inputRef, onChange, min, max, ...other } = props;

  
  return (
    <NumericFormat
      {...other}
      getInputRef={inputRef}
      onValueChange={(values) => {
        onChange({
          target: {
            name: props.name,
            value: values.value,
          },
        });
      }}
      isAllowed={({ floatValue }) => {
        return (min === undefined || floatValue >= min) && (max === undefined || floatValue <= max);
      }}
      decimalSeparator=","
      thousandSeparator={'\u00A0'}
      valueIsNumericString
    />
  );
}

function FieldNumberNative(props) {
  let {_obj, _fld, _meta, read_only, classes, extClasses, className, fullWidth, InputProps, label_position, bar, isTabular,
    dyn_meta, handleValueChange, debounce, ...other} = props;
  if(!_meta) {
    _meta = _obj._metadata(_fld); 
  }
  if('min' in _meta) {
    other.min = _meta.min;
  }
  if('max' in _meta) {
    other.max = _meta.max;
  }
  if('fraction' in _meta?.type) {
    other.decimalScale = _meta.type.fraction;
  }
  const attr = {
    title: _meta.tooltip || _meta.synonym,
  };
  if(_meta.mandatory) {
    attr.required = true;
  }
  if(read_only) {
    other.readOnly = true;
  }
  const [value, setValue] = React.useState(_obj[_fld]);
  const ref = React.createRef();
  const onChange = ({target}) => {
    setValue(target.value);
  };
  const onKeyUp = ({key}) => {
    if(key === 'Enter' || key === 'Tab') {
      const v = parseFloat(value || 0);
      if(!read_only && !isNaN(v) && _obj[_fld] != v) {
        _obj[_fld] = v;
        handleValueChange?.(_obj[_fld]);
      }
      setValue(_obj[_fld]);
    }
  };
  const onBlur = () => {
    onKeyUp({key: 'Enter'});
  };

  const onFocus = () => {
    setValue(_obj[_fld]);
    setTimeout(() => ref.current?.firstChild?.select(), 20);
  };
  
  return <FormControl
    className={extClasses && extClasses.control ? '' : cn(classes.formControl, className)}
    classes={extClasses && extClasses.control ? extClasses.control : null}
    fullWidth={fullWidth}
    {...attr}
  >
    {label_position != 'hide' &&
      <InputLabel
        classes={extClasses && extClasses.label ? extClasses.label : null}
      >{_meta.synonym}</InputLabel>}
    <Input
      ref={ref}
      value={value}
      onChange={onChange}
      onKeyUp={onKeyUp}
      onBlur={onBlur}
      onFocus={onFocus}
      classes={
        Object.assign({
          input: cn(classes.input, attr.required && !other.value && classes.required)
        }, extClasses && extClasses.input)
      }
      inputProps={{...other}}
      inputComponent={NumberFormatCustom}
    />
  </FormControl>;
}

export default withStyles(FieldNumberNative);
