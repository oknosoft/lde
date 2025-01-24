[![Stars](https://img.shields.io/github/stars/oknosoft/metadata.js.svg?label=Github%20%E2%98%85&a)](https://github.com/oknosoft/metadata.js/stargazers)
[![NPM downloads](http://img.shields.io/npm/dm/metadata-js.svg?style=flat&label=npm%20downloads)](https://npmjs.org/package/metadata-js?)
[![NPM version](https://img.shields.io/npm/l/metadata-js.svg?)](http://licenseit.ru/wiki/index.php/MIT)

_Metadata.js - проект с открытым кодом.<br />Приглашаем к сотрудничеству всех желающих. Будем благодарны за любую помощь._

[English version](README.en.md)

### Почему Metadata.js?
Библиотека предназначена для разработки бизнес-ориентированных и учетных offline-first приложений на JavaScript.
- Для управления данными на стороне браузера, используется Pouchdb и AlaSQL
- Основным серверным хранилищем данных выбрана [Couchdb](https://couchdb.apache.org/)
- Поддержана возможность подключения адаптеров данных к [1С](http://v8.1c.ru/overview/Platform.htm) и прочим ORM, SQL и NoSQL серверам
- Metadata.js реализует внутри браузера или Node.js классы _DataObj_, схожие в своём поведении с объектами платформы 1С, но адаптированными для работы в распределенной среде на плохих каналах связи

### Для кого?
Для разработчиков мобильных и браузерных приложений, которым близка парадигма 1С _на базе бизнес-объектов: документов и справочников_, но которым тесно в рамках платформы 1С.
Metadata.js предоставляет программисту:
- высокоуровневые [data-объекты](http://www.oknosoft.ru/upzp/apidocs/classes/DataObj.html), схожие по функциональности с документами, регистрами и справочниками платформы 1С
- инструменты декларативного описания метаданных и автогенерации интерфейса, схожие по функциональности с метаданными и формами платформы 1С
- средства событийно-целостной репликации и эффективные классы обработки данных, не имеющие прямых аналогов в 1С

### Философия
- Не важно, где данные возникли и через какой интерфейс
- Не важно, где данные хранятся физически
- Важно, что данные всегда под рукой. При этом, они строго типизированы, разделяемы и пригодны к репликации

### Исходный код
Актуальные файлы библиотек и компонентов, живут в каталоге [packages](https://github.com/oknosoft/metadata.js/tree/v3/packages).

### Отличия от конкурентов
Metadata.js не конкурирует с UI фреймворками, а дополняет их новой абстракцией в виде [Объектов](http://www.oknosoft.ru/upzp/apidocs/classes/DataObj.html) и [Менеджеров](http://www.oknosoft.ru/upzp/apidocs/classes/DataManager.html) данных. Использование этих классов упрощает разработку сложных интерфейсов бизнес-приложений.
С платформой 1С, metadata так же, не конкурирует, т.к. рассчитана на работу в браузере или на мобильном устройстве в глобальной сети или автономном режиме, в то время, как 1С - для локальной сети и настольных компьютеров.

### Благодарности
- Идеологам [1С](https://v8.1c.ru/overview/Term_000000586.htm#06) за прототипы DataObj и DataManager
- Andrey Gershun & M. Rangel Wulff, authors of [AlaSQL](https://github.com/agershun/alasql) - Javascript SQL database library
- Авторам [PouchDB](http://pouchdb.com/) и [CouchDB](http://couchdb.apache.org/) - NoSQL database and data synchronization engine
- Прочим авторам за их замечательные инструменты, упрощающие нашу работу

### Лицензия
[MIT](LICENSE)

Данная лицензия распространяется на все содержимое репозитория, но не заменеют существующие лицензии для продуктов, используемых библиотекой metadata.js

(c) 2014-2025, компания Окнософт (info@oknosoft.ru)
