import React from 'react';
import MetaEngine from '../core/src'; // можно из '../core/dist', который компилируется скриптом build:core
import settings from './app.settings';
import meta from './meta.json';

const $p = global.$p = new MetaEngine();

// параметры сеанса инициализируем сразу
$p.jobPrm.init(settings);

$p.md.init(meta);

const plugins = [
  ({cat, classes, symbols}) => {
    const {CatObj} = classes;
    const {get, set} = symbols;

    // class CatTags extends CatObj{
    //   get synonym(){return this[get]('synonym')}
    //   set synonym(v){this[set]('synonym',v)}
    // }
    // classes.CatTags = CatTags;
    // cat.create('tags');
    //
    // class CatOrganizations extends CatObj{
    //   get prefix(){return this[get]('prefix')}
    //   set prefix(v){this[set]('prefix',v)}
    //   get individualLegal(){return this[get]('individualLegal')}
    //   set individualLegal(v){this[set]('individualLegal',v)}
    //   get inn(){return this[get]('inn')}
    //   set inn(v){this[set]('inn',v)}
    //   get kpp(){return this[get]('kpp')}
    //   set kpp(v){this[set]('kpp',v)}
    //   get ogrn(){return this[get]('ogrn')}
    //   set ogrn(v){this[set]('ogrn',v)}
    //   get parent(){return this[get]('parent')}
    //   set parent(v){this[set]('parent',v)}
    // }
    // classes.CatOrganizations = CatOrganizations;
    // cat.create('organizations');
  },
];

$p.md.createManagers(plugins);


$p.cat.tags.load([{
  "ref": "9ad312f7-4700-11e8-8509-d85d4c80ec2a",
  "_rev": "2-94352f81e1089ff22542bbc9e69955f4",
  "name": "Документация",
  "synonym": "docs",
  "className": "cat.tags",
  "timestamp": {
    "user": "Администратор",
    "moment": "2022-09-28T02:08:00 +0500",
    "e1cib": true
  }
}]);


$p.cat.accounts.load([{
  "ref": "7d9a8f80-30e1-11ed-b994-7085c299da15",
  "_rev": "2-3f51ebd0fb3dc35437bd0d5ef40dd904",
  "owner": "b9afd3b0-4858-11e8-8c82-9df658a78f70",
  "name": "nmivan",
  "prefix": "nm",
  "pushOnly": false,
  "subscription": false,
  "aclObjs": [
    {
      "row": 1,
      "obj": "og:3e4b009b-2e75-11ed-b994-7085c299da15",
      "by_default": true
    }
  ],
  "subscribers": [
    {
      "row": 1,
      "abonent": "affcc11a-5820-11e8-851d-d85d4c80ec2a",
      "roles": ["ram_reader","ram_editor","doc_full"]
    }
  ],
  "ids": [
    {
      "row": 1,
      "identifier": "org.couchdb.user:nmivan",
      "server": "affcc119-5820-11e8-851d-d85d4c80ec2a"
    }
  ],
  "className": "cat.accounts",
  "timestamp": {
    "user": "Администратор",
    "moment": "2022-10-07T12:11:24 +0500",
    "e1cib": true
  },
  "acl": {
    "cat.nom_prices_types": "rvueid",
    "cat.articles": "rvueid",
    "cat.users": "rvuid",
    "cat.organizations": "rvueid",
    "cat.partners": "rvueid",
    "cat.accounts": "rv",
    "cat.property_values": "rvueid",
    "cat.currencies": "rvueid",
    "cat.tags": "rvueid",
    "cat.destinations": "rvueid",
    "cch.predefined_elmnts": "rvueid",
    "cat.formulas": "rvueid",
    "cch.properties": "rvueid"
  }
}]);


$p.cat.organizations.load([{
  "ref": "3e4b009b-2e75-11ed-b994-7085c299da15",
  "_rev": "1-0cf302ca5388cb255da1797456a576e0",
  "isFolder": false,
  "parent": "00000000-0000-0000-0000-000000000000",
  "name": "Окнософт",
  "id": "00000000001",
  "individualLegal": "ЮрЛицо",
  "className": "cat.organizations",
  "timestamp": {
    "user": "Администратор",
    "moment": "2022-09-08T12:13:02 +0500",
    "e1cib": true
  }
}]);



export default function App() {
  return <div>Metadata</div>;
};
