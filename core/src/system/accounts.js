// метаданные и класс справочника Учётные записи (логины)

export const meta = {
  cat: {
    accounts: {
      name: "ИнтеграцияПользователи",
      splitted: false,
      synonym: "Пользователи сервиса",
      illustration: "",
      objPresentation: "Пользователь сервиса",
      listPresentation: "",
      inputBy: [],
      hierarchical: false,
      hasOwners: true,
      groupHierarchy: true,
      mainPresentation: "name",
      codeLength: 0,
      id: "a",
      fields: {
        prefix: {
          synonym: "Префикс нумерации",
          multiline: false,
          tooltip: "Префикс номеров документов текущего пользователя",
          mandatory: true,
          type: {
            types: [
              "string"
            ],
            strLen: 2
          }
        },
        pushOnly: {
          synonym: "Только push",
          tooltip: "Для пользователя установлен режим push-only (изменения мигрируют в одну сторону - от пользователя на сервер)",
          type: {
            types: [
              "boolean"
            ]
          }
        },
        subscription: {
          synonym: "Подписан",
          tooltip: "Подписан на рассылку и прочие услуги сервиса",
          type: {
            types: [
              "boolean"
            ]
          }
        },
        ips: {
          synonym: "IP-адреса входа",
          multiline: true,
          tooltip: "Список ip-адресов с маской через запятую, с которых разрешена авторизация\n192.168.9.0/24, 192.168.21.*",
          type: {
            types: [
              "string"
            ],
            strLen: 0
          }
        },
        direct: {
          synonym: "Direct",
          tooltip: "Для пользователя запрещен режим offline",
          type: {
            types: [
              "boolean"
            ]
          }
        },
        owner: {
          synonym: "Пользователь 1С",
          tooltip: "Ссылка на стандартного пользователя",
          type: {
            types: [
              "cat.users"
            ]
          }
        }
      },
      tabulars: {
        aclObjs: {
          name: "ОбъектыДоступа",
          synonym: "Объекты доступа",
          tooltip: "",
          fields: {
            obj: {
              synonym: "Объект доступа",
              tooltip: "",
              type: {
                types: [
                  "cat.individuals",
                  "cat.partners",
                  "cat.organizations",
                  "cat.users"
                ]
              }
            },
            byDefault: {
              synonym: "По умолчанию",
              tooltip: "",
              type: {
                types: [
                  "boolean"
                ]
              }
            }
          }
        },
        subscribers: {
          name: "Абоненты",
          synonym: "Абоненты",
          tooltip: "",
          fields: {
            abonent: {
              synonym: "Абонент",
              tooltip: "",
              choiceGrp: "elm",
              mandatory: true,
              type: {
                types: [
                  "cat.abonents"
                ]
              }
            },
            branch: {
              synonym: "Отдел",
              tooltip: "",
              choiceLinks: [
                {
                  name: [
                    "selection",
                    "owner"
                  ],
                  path: [
                    "subscribers",
                    "abonent"
                  ]
                }
              ],
              choiceGrp: "elm",
              type: {
                types: [
                  "cat.branches"
                ]
              }
            },
            roles: {
              synonym: "Роли Couchdb",
              multiline: true,
              tooltip: "",
              type: {
                types: [
                  "json"
                ]
              }
            }
          }
        },
        ids: {
          name: "Идентификаторы",
          synonym: "Идентификаторы авторизации",
          tooltip: "",
          fields: {
            identifier: {
              synonym: "Идентификатор",
              multiline: false,
              tooltip: "",
              mandatory: true,
              type: {
                types: [
                  "string"
                ],
                strLen: 255
              }
            },
            server: {
              synonym: "Сервер",
              tooltip: "",
              choiceGrp: "elm",
              mandatory: true,
              type: {
                types: [
                  "cat.servers"
                ]
              }
            },
            passwordHash: {
              synonym: "Хеш пароля",
              multiline_mode: false,
              tooltip: "",
              type: {
                types: [
                  "string"
                ],
                strLen: 1000
              }
            }
          }
        }
      },
      cachable: "ram"
    }
  },
};

export default function ({cat, classes, symbols}, exclude) {
  const {CatObj, TabularSectionRow} = classes;
  const {get, set} = symbols;

  // базовое поведение класса, задаём сразу
  class CatAccounts extends CatObj{
    get prefix(){return this[get]('prefix')}
    set prefix(v){this[set]('prefix',v)}
    get pushOnly(){return this[get]('pushOnly')}
    set pushOnly(v){this[set]('pushOnly',v)}
    get subscription(){return this[get]('subscription')}
    set subscription(v){this[set]('subscription',v)}
    get ips(){return this[get]('ips')}
    set ips(v){this[set]('ips',v)}
    get direct(){return this[get]('direct')}
    set direct(v){this[set]('direct',v)}
    get owner(){return this[get]('owner')}
    set owner(v){this[set]('owner',v)}
    get aclObjs(){return this[get]('aclObjs')}
    get subscribers(){return this[get]('subscribers')}
    get ids(){return this[get]('ids')}
  }
  classes.CatAccounts = CatAccounts;
  class CatAccountsAclObjsRow extends TabularSectionRow{
    get obj(){return this[get]('obj')}
    set obj(v){this[set]('obj',v)}
    get byDefault(){return this[get]('byDefault')}
    set byDefault(v){this[set]('byDefault',v)}
  }
  classes.CatAccountsAclObjsRow = CatAccountsAclObjsRow;
  class CatAccountsSubscribersRow extends TabularSectionRow{
    get abonent(){return this[get]('abonent')}
    set abonent(v){this[set]('abonent',v)}
    get branch(){return this[get]('branch')}
    set branch(v){this[set]('branch',v)}
    get roles(){return this[get]('roles')}
    set roles(v){this[set]('roles',v)}
  }
  classes.CatAccountsSubscribersRow = CatAccountsSubscribersRow;
  class CatAccountsIdsRow extends TabularSectionRow{
    get identifier(){return this[get]('identifier')}
    set identifier(v){this[set]('identifier',v)}
    get server(){return this[get]('server')}
    set server(v){this[set]('server',v)}
    get passwordHash(){return this[get]('password_hash')}
    set passwordHash(v){this[set]('password_hash',v)}
  }
  classes.CatAccountsIdsRow = CatAccountsIdsRow;

  // но оставляем возможность дополнить-переопределить
  // если пользователь попросил не спешить с созданием менеджера - не спешим
  if(!exclude.includes('cat.accounts')) {
    cat.create('accounts');
    exclude.push('cat.accounts');
  }
};
