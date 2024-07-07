
export const meta = {
  cat: {
    branches: {
      name: "ИнтеграцияОтделыАбонентов",
      splitted: false,
      synonym: "Отделы абонентов",
      illustration: "",
      objPresentation: "Отдел абонента",
      listPresentation: "",
      inputBy: ["name", "suffix"],
      hierarchical: true,
      hasOwners: true,
      groupHierarchy: false,
      mainPresentation: "name",
      codeLength: 11,
      id: "br",
      fields: {
        suffix: {
          synonym: "Суффикс CouchDB",
          multiline: false,
          tooltip: "Для разделения данных в CouchDB",
          "mandatory": true,
          type: {
            types: [
              "string"
            ],
            "strLen": 4
          }
        },
        lang: {
          synonym: "Язык",
          multiline: false,
          tooltip: "Язык интерфейса пользователя",
          type: {
            types: [
              "string"
            ],
            strLen: 2,
            strFix: true
          }
        },
        server: {
          synonym: "Сервер",
          multiline: false,
          tooltip: "Если указано, используется этот сервер, а не основной сервер абонента",
          choiceGrp: "elm",
          type: {
            types: [
              "cat.servers"
            ]
          }
        },
        back_server: {
          synonym: "Обратный сервер",
          multiline: false,
          tooltip: "Если указано, этот сервер, для настройки репликации от сервера отдела к родителю",
          choiceGrp: "elm",
          type: {
            types: [
              "cat.servers"
            ]
          }
        },
        repl_server: {
          synonym: "Сервер репликатора",
          multiline: false,
          tooltip: "Если указано, задание репликации будет запущено на этом сервере",
          choiceGrp: "elm",
          type: {
            types: [
              "cat.servers"
            ]
          }
        },
        direct: {
          synonym: "Direct",
          multiline: false,
          tooltip: "Для пользователя запрещен режим offline",
          type: {
            types: [
              "boolean"
            ]
          }
        },
        use: {
          synonym: "Используется",
          multiline: false,
          tooltip: "Использовать данный отдел при создании баз и пользователей",
          type: {
            types: [
              "boolean"
            ]
          }
        },
        mode: {
          synonym: "Режим",
          multiline: false,
          tooltip: "Режим репликации текущего отдела",
          type: {
            types: [
              "number"
            ],
            "digits": 1,
            "fraction": 0
          }
        },
        no_mdm: {
          synonym: "NoMDM",
          multiline: false,
          tooltip: "Отключить MDM для данного отдела (напрмиер, если это dev-база)",
          type: {
            types: [
              "boolean"
            ]
          }
        },
        no_partners: {
          synonym: "NoPartners",
          multiline: false,
          tooltip: "Не использовать фильтр по контрагенту в репликации (только по подразделению)",
          type: {
            types: [
              "boolean"
            ]
          }
        },
        no_divisions: {
          synonym: "NoDivisions",
          multiline: false,
          tooltip: "Не использовать фильтр по подразделению в репликации (только по контрагенту)",
          type: {
            types: [
              "boolean"
            ]
          }
        },
        filter: {
          synonym: "Фильтр технологии",
          multiline: false,
          tooltip: "Если указано, используется индивидуальный образ справочников",
          choiceParams: [
            {
              name: "area",
              path: true
            }
          ],
          choiceGrp: "elm",
          type: {
            types: [
              "cat.abonents"
            ]
          }
        },
        owner: {
          synonym: "Владелец репликаций",
          multiline: false,
          tooltip: "Абонент, которому принадлежит отдел",
          choiceParams: [
            {
              name: "area",
              path: false
            }
          ],
          "mandatory": true,
          type: {
            types: [
              "cat.abonents"
            ]
          }
        },
        parent: {
          synonym: "Ведущий отдел",
          multiline: false,
          tooltip: "Заполняется в случае иерархической репликации",
          type: {
            types: [
              "cat.branches"
            ]
          }
        }
      },
      tabular_sections: {
        organizations: {
          name: "Организации",
          synonym: "Организации",
          tooltip: "Организации, у которых дилер может заказывать продукцию и услуги",
          "fields": {
            "acl_obj": {
              synonym: "Объект доступа",
              multiline: false,
              tooltip: "",
              "mandatory": true,
              type: {
                types: [
                  "cat.organizations"
                ]
              }
            },
            "by_default": {
              synonym: "По умолчанию",
              multiline: false,
              tooltip: "",
              type: {
                types: [
                  "boolean"
                ]
              }
            }
          }
        },
        partners: {
          name: "Контрагенты",
          synonym: "Контрагенты",
          tooltip: "Юридические лица дилера, от имени которых он оформляет заказы",
          "fields": {
            "acl_obj": {
              synonym: "Объект доступа",
              multiline: false,
              tooltip: "",
              "mandatory": true,
              type: {
                types: [
                  "cat.partners"
                ]
              }
            },
            "by_default": {
              synonym: "По умолчанию",
              multiline: false,
              tooltip: "",
              type: {
                types: [
                  "boolean"
                ]
              }
            }
          }
        },
        divisions: {
          name: "Подразделения",
          synonym: "Подразделения",
          tooltip: "Подразделения, к данным которых, дилеру предоставлен доступ",
          "fields": {
            "acl_obj": {
              synonym: "Объект доступа",
              multiline: false,
              tooltip: "",
              "mandatory": true,
              type: {
                types: [
                  "cat.divisions"
                ]
              }
            },
            "by_default": {
              synonym: "По умолчанию",
              multiline: false,
              tooltip: "",
              type: {
                types: [
                  "boolean"
                ]
              }
            }
          }
        },
        price_types: {
          name: "ТипыЦен",
          synonym: "Типы цен",
          tooltip: "Типы цен, привязанные к дилеру",
          "fields": {
            "acl_obj": {
              synonym: "Объект доступа",
              multiline: false,
              tooltip: "",
              "mandatory": true,
              type: {
                types: [
                  "cat.nom_prices_types",
                  "cat.branches"
                ]
              }
            }
          }
        },
        keys: {
          name: "Ключи",
          synonym: "Ключи",
          tooltip: "Ключи параметров, привязанные к дилеру",
          "fields": {
            "acl_obj": {
              synonym: "Объект доступа",
              multiline: false,
              tooltip: "",
              "mandatory": true,
              type: {
                types: [
                  "cat.parameters_keys"
                ]
              }
            }
          }
        },
        extra_fields: {
          name: "ДополнительныеРеквизиты",
          synonym: "Дополнительные реквизиты",
          tooltip: "Дополнительные реквизиты объекта",
          "fields": {
            "property": {
              synonym: "Свойство",
              multiline: false,
              tooltip: "Дополнительный реквизит",
              choiceGrp: "elm",
              type: {
                types: [
                  "cch.properties"
                ]
              }
            },
            "value": {
              synonym: "Значение",
              multiline: false,
              tooltip: "Значение дополнительного реквизита",
              choiceLinks: [
                {
                  name: [
                    "selection",
                    "owner"
                  ],
                  path: [
                    "extra_fields",
                    "property"
                  ]
                }
              ],
              choiceGrp: "elm",
              "choice_type": {
                path: [
                  "extra_fields",
                  "property"
                ],
                "elm": 0
              },
              type: {
                types: [
                  "enm.sketch_view",
                  "cat.nom_groups",
                  "enm.coloring",
                  "cat.production_params",
                  "enm.opening",
                  "cat.inserts",
                  "cat.templates",
                  "cat.price_groups",
                  "cat.currencies",
                  "enm.open_directions",
                  "cat.characteristics",
                  "cat.projects",
                  "cat.individuals",
                  "cat.users",
                  "cat.values_options",
                  "cat.delivery_areas",
                  "cat.color_price_groups",
                  "cat.elm_visualization",
                  "cat.property_values_hierarchy",
                  "cat.formulas",
                  "cat.delivery_directions",
                  "cat.property_values",
                  "boolean",
                  "cat.nom_prices_types",
                  "cat.divisions",
                  "enm.elm_types",
                  "enm.align_types",
                  "cat.parameters_keys",
                  "cat.partners",
                  "string",
                  "enm.sz_line_types",
                  "enm.orientations",
                  "cat.organizations",
                  "date",
                  "cat.units",
                  "number",
                  "enm.plan_detailing",
                  "cat.abonents",
                  "cat.work_center_kinds",
                  "enm.positions",
                  "cat.branches",
                  "cat.cashboxes",
                  "enm.open_types",
                  "cat.nom",
                  "cat.cnns",
                  "cat.furns",
                  "enm.vat_rates",
                  "enm.nested_object_editing_mode",
                  "cat.stores",
                  "cch.properties",
                  "cat.clrs"
                ],
                strLen: 1024,
                "date_part": "date_time",
                "digits": 15,
                "fraction": 3
              }
            },
            "txt_row": {
              synonym: "Текстовая строка",
              multiline: false,
              tooltip: "Полный текст строкового дополнительного реквизита",
              type: {
                types: [
                  "string"
                ],
                strLen: 0
              }
            }
          }
        },
        servers: {
          name: "ИнтеграцияСерверы",
          synonym: "Серверы",
          tooltip: "",
          "fields": {
            "key": {
              synonym: "Год",
              multiline: false,
              tooltip: "",
              "mandatory": true,
              type: {
                types: [
                  "number"
                ],
                "digits": 4,
                "fraction": 0
              }
            },
            "server": {
              synonym: "Сервер",
              multiline: false,
              tooltip: "",
              choiceGrp: "elm",
              "mandatory": true,
              type: {
                types: [
                  "cat.servers"
                ]
              }
            },
            name: {
              synonym: "Имя базы",
              multiline: false,
              tooltip: "Указывается, если имя архивной базы отличается от типового",
              type: {
                types: [
                  "string"
                ],
                strLen: 255
              }
            }
          }
        }
      },
      cachable: "ram"
    },
  },
};

export default function ({cat, classes, symbols}, exclude) {

  const {CatObj, CatManager, TabularSectionRow, ExtraFieldsRow} = classes;
  const {get, set} = symbols;

  class CatBranches extends CatObj{
    get suffix(){return this[get]('suffix')}
    set suffix(v){this[set]('suffix',v)}
    get lang(){return this[get]('lang')}
    set lang(v){this[set]('lang',v)}
    get direct(){return this[get]('direct')}
    set direct(v){this[set]('direct',v)}
    get use(){return this[get]('use')}
    set use(v){this[set]('use',v)}
    get no_mdm(){return this[get]('no_mdm')}
    set no_mdm(v){this[set]('no_mdm',v)}
    get no_partners(){return this[get]('no_partners')}
    set no_partners(v){this[set]('no_partners',v)}
    get no_divisions(){return this[get]('no_divisions')}
    set no_divisions(v){this[set]('no_divisions',v)}
    get filter(){return this[get]('filter')}
    set filter(v){this[set]('filter',v)}
    get organizations(){return this[get]('organizations')}
    set organizations(v){this[set]('organizations',v)}
    get partners(){return this[get]('partners')}
    set partners(v){this[set]('partners',v)}
    get divisions(){return this[get]('divisions')}
    set divisions(v){this[set]('divisions',v)}
    get price_types(){return this[get]('price_types')}
    set price_types(v){this[set]('price_types',v)}
    get keys(){return this[get]('keys')}
    set keys(v){this[set]('keys',v)}
    get extra_fields(){return this[get]('extra_fields')}
    set extra_fields(v){this[set]('extra_fields',v)}
  }
  classes.CatBranches = CatBranches;

  class CatBranchesOrganizationsRow extends TabularSectionRow{
    get acl_obj(){return this[get]('acl_obj')}
    set acl_obj(v){this[set]('acl_obj',v)}
    get by_default(){return this[get]('by_default')}
    set by_default(v){this[set]('by_default',v)}
  }
  classes.CatBranchesOrganizationsRow = CatBranchesOrganizationsRow;

  class CatBranchesPartnersRow extends TabularSectionRow{
    get acl_obj(){return this[get]('acl_obj')}
    set acl_obj(v){this[set]('acl_obj',v)}
    get by_default(){return this[get]('by_default')}
    set by_default(v){this[set]('by_default',v)}
  }
  classes.CatBranchesPartnersRow = CatBranchesPartnersRow;

  class CatBranchesDivisionsRow extends TabularSectionRow{
    get acl_obj(){return this[get]('acl_obj')}
    set acl_obj(v){this[set]('acl_obj',v)}
    get by_default(){return this[get]('by_default')}
    set by_default(v){this[set]('by_default',v)}
  }
  classes.CatBranchesDivisionsRow = CatBranchesDivisionsRow;

  class CatBranchesPriceTypesRow extends TabularSectionRow{
    get acl_obj(){return this[get]('acl_obj')}
    set acl_obj(v){this[set]('acl_obj',v)}
  }
  classes.CatBranchesPriceTypesRow = CatBranchesPriceTypesRow;

  class CatBranchesKeysRow extends TabularSectionRow{
    get acl_obj(){return this[get]('acl_obj')}
    set acl_obj(v){this[set]('acl_obj',v)}
  }
  classes.CatBranchesKeysRow = CatBranchesKeysRow;

  class CatBranchesExtraFieldsRow extends ExtraFieldsRow {}
  classes.CatBranchesExtraFieldsRow = CatBranchesExtraFieldsRow;

  class CatBranchesManager extends CatManager {}
  classes.CatBranchesManager = CatBranchesManager;

  if(!exclude.includes('cat.branches')) {
    cat.create('branches');
    exclude.push('cat.branches');
  }
};
