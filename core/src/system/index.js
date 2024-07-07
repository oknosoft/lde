
import {meta as log} from './log';
import {meta as schemeSettings} from './schemeSettings';
import {meta as destinations} from './destinations';
import {meta as values} from './propertyValues';
import {meta as formulas} from './formulas';
import {meta as servers} from './servers';
import propertiesClasses, {meta as properties} from './properties';
import predefinedElmntsClasses, {meta as predefinedElmnts} from './predefinedElmnts';
import accountsClasses, {meta as accounts} from './accounts';
import usersClasses, {meta as users} from './users';
import abonentsClasses, {meta as abonents} from './abonents';
import branchesClasses, {meta as branches} from './branches';

const meta = [
  log,
  schemeSettings,
  destinations,
  values,
  formulas,
  servers,
  properties,
  predefinedElmnts,
  accounts,
  users,
  abonents,
  branches,
];

/**
 * Виртуальные поля перечислений
 * @type {string[]}
 */
export const enmFields = {
  latin: {
    synonym: 'latin',
    type: {
      types: ['string'],
      strLen: 50
    }
  },
  name: {
    synonym: 'name',
    type: {
      types: ['string'],
      strLen: 50
    }
  },
  order: {
    synonym: 'order',
    type: {
      types: ['number'],
      digits: 3,
      fraction: 0
    }
  },
};

export const sysFields = ['zone','id','numberDoc','date','parent','owner'];

export const sysObjs = [];
export const sysClasses = [
  accountsClasses,
  usersClasses,
  abonentsClasses,
  branchesClasses,
  propertiesClasses,
  predefinedElmntsClasses,
];

for(const curr of meta) {
  for(const cname in curr) {
    for(const name in curr[cname]) {
      sysObjs.push(`${cname}.${name}`);
    }
  }
}

export default meta;
