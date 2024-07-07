// метаданные и класс справочника Абоненты

export const meta = {
  cat: {
    abonents: {
      name: "ИнтеграцияАбоненты",
      splitted: false,
      synonym: "Абоненты",
      illustration: "",
      objPresentation: "Абонент",
      listPresentation: "Абоненты",
      inputBy: ["name", "id"],
      hierarchical: false,
      groupHierarchy: true,
      mainPresentation: "name",
      codeLength: 6,
      id: "abn",
      fields: {
        server: {
          synonym: "Сервер",
          multiline: false,
          tooltip: "Основной сервер абонента (отделы абонента могут использовать другие серверы)",
          choiceGrp: "elm",
          mandatory: true,
          type: {
            types: [
              "cat.servers"
            ]
          }
        },
        area: {
          synonym: "Это фильтр технологии",
          multiline: false,
          tooltip: "Если \"Истина\", абонент используется не как владелец репликаций, а как фильтр технологических справочников",
          type: {
            types: [
              "boolean"
            ]
          }
        },
        no_mdm: {
          synonym: "NoMDM",
          multiline: false,
          tooltip: "Отключить MDM для данного абонента (напрмиер, если это dev-база)",
          type: {
            types: [
              "boolean"
            ]
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
        }
      },
      tabulars: {
        acl_objs: {
          "name": "ОбъектыДоступа",
          "synonym": "Базовые объекты",
          "tooltip": "Базовые объекты к регистрации: системы профилей, фурнитуры, организации, контрагенты",
          "fields": {
            "obj": {
              "synonym": "Объект",
              "multiline": false,
              "tooltip": "",
              "type": {
                "types": [
                  "doc.work_centers_performance",
                  "cat.nom_groups",
                  "cat.http_apis",
                  "cat.production_params",
                  "cat.inserts",
                  "cat.templates",
                  "cat.price_groups",
                  "doc.credit_card_order",
                  "cat.leads",
                  "cat.nom_units",
                  "doc.planning_event",
                  "cch.predefined_elmnts",
                  "cat.currencies",
                  "doc.nom_prices_setup",
                  "cat.choice_params",
                  "cat.characteristics",
                  "cat.projects",
                  "cat.individuals",
                  "cat.users",
                  "cat.insert_bind",
                  "cat.values_options",
                  "cat.partner_bank_accounts",
                  "cat.delivery_areas",
                  "cat.color_price_groups",
                  "cat.elm_visualization",
                  "doc.debit_bank_order",
                  "doc.registers_correction",
                  "cat.property_values_hierarchy",
                  "cat.formulas",
                  "cat.project_categories",
                  "cat.delivery_directions",
                  "doc.inventory_goods",
                  "cat.charges_discounts",
                  "cat.property_values",
                  "doc.purchase_order",
                  "cat.banks_qualifier",
                  "doc.credit_cash_order",
                  "doc.selling",
                  "cat.nom_prices_types",
                  "cat.organization_bank_accounts",
                  "cat.divisions",
                  "cch.mdm_groups",
                  "cat.destinations",
                  "cat.parameters_keys",
                  "doc.purchase",
                  "cat.contact_information_kinds",
                  "cat.params_links",
                  "cat.partners",
                  "doc.debit_cash_order",
                  "cat.lead_src",
                  "cat.nom_kinds",
                  "cat.organizations",
                  "cat.countries",
                  "cat.units",
                  "doc.inventory_cuts",
                  "doc.work_centers_task",
                  "cat.abonents",
                  "cat.work_center_kinds",
                  "cat.servers",
                  "doc.calc_order",
                  "cat.branches",
                  "doc.credit_bank_order",
                  "cat.cashboxes",
                  "cat.nom",
                  "cat.cnns",
                  "cat.furns",
                  "cat.cash_flow_articles",
                  "cat.work_centers",
                  "cat.meta_ids",
                  "cat.contracts",
                  "cat.stages",
                  "cat.stores",
                  "cch.properties",
                  "cat.clrs"
                ],
              }
            },
            "type": {
              "synonym": "Тип",
              "multiline": false,
              "tooltip": "",
              "type": {
                "types": [
                  "string"
                ],
                strLen: 255
              }
            }
          }
        },
        ex_bases: {
          "name": "ДополнительныеБазы",
          "synonym": "Дополнительные базы",
          "tooltip": "Шаблоны, логгер и т.д. - копируем в _security пользователей из ram",
          "fields": {
            "name": {
              "synonym": "Наименование",
              "multiline": false,
              "tooltip": "",
              "mandatory": true,
              "type": {
                "types": [
                  "string"
                ],
                strLen: 25
              }
            },
            "server": {
              "synonym": "Сервер",
              "multiline": false,
              "tooltip": "",
              choiceGrp: "elm",
              "mandatory": true,
              "type": {
                "types": [
                  "cat.servers"
                ],
              }
            }
          }
        },
        extra_fields: {
          "name": "ДополнительныеРеквизиты",
          "synonym": "Дополнительные реквизиты",
          "tooltip": "Дополнительные реквизиты объекта",
          "fields": {
            "property": {
              "synonym": "Свойство",
              "multiline": false,
              "tooltip": "Дополнительный реквизит",
              choiceGrp: "elm",
              "type": {
                "types": [
                  "cch.properties"
                ],
              }
            },
            "value": {
              "synonym": "Значение",
              "multiline": false,
              "tooltip": "Значение дополнительного реквизита",
              choiceLinks: [
                {
                  "name": [
                    "selection",
                    "owner"
                  ],
                  "path": [
                    "extra_fields",
                    "property"
                  ]
                }
              ],
              choiceGrp: "elm",
              "choice_type": {
                "path": [
                  "extra_fields",
                  "property"
                ],
                "elm": 0
              },
              "type": {
                "types": [
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
              "synonym": "Текстовая строка",
              "multiline": false,
              "tooltip": "Полный текст строкового дополнительного реквизита",
              "type": {
                "types": [
                  "string"
                ],
                strLen: 0
              }
            }
          }
        },
        http_apis: {
          "name": "ПоставщикиСВнешнимAPI",
          "synonym": "Поставщики с внешним API",
          "tooltip": "",
          "fields": {
            "is_supplier": {
              "synonym": "Поставщик",
              "multiline": false,
              "tooltip": "",
              choiceGrp: "elm",
              "type": {
                "types": [
                  "cat.http_apis"
                ],
              }
            },
            "partner": {
              "synonym": "Контрагент",
              "multiline": false,
              "tooltip": "Этот контрагент будет указан в Заказах поставщику",
              "mandatory": true,
              "type": {
                "types": [
                  "cat.partners"
                ],
              }
            },
            "server": {
              "synonym": "Сервер",
              "multiline": false,
              "tooltip": "Сервер для доступа к API поставщика",
              choiceGrp: "elm",
              "type": {
                "types": [
                  "cat.servers"
                ],
              }
            }
          }
        },
        servers: {
          "name": "ИнтеграцияСерверы",
          "synonym": "Серверы",
          "tooltip": "",
          "fields": {
            "key": {
              "synonym": "Год",
              "multiline": false,
              "tooltip": "",
              "mandatory": true,
              "type": {
                "types": [
                  "number"
                ],
                "digits": 4,
                "fraction": 0
              }
            },
            "name": {
              "synonym": "Имя базы",
              "multiline": false,
              "tooltip": "Указывается, если имя архивной базы отличается от типового",
              "type": {
                "types": [
                  "string"
                ],
                strLen: 255
              }
            },
            "proxy": {
              "synonym": "url auth-proxy",
              "multiline": false,
              "tooltip": "Для редиректа из основного маршрута",
              "type": {
                "types": [
                  "string"
                ],
                strLen: 255
              }
            }
          }
        }
      },
      cachable: "meta"
    }
  },
};

export default function ({cat, classes, symbols}, exclude) {

  const {CatObj, CatManager, TabularSectionRow} = classes;
  const {get, set} = symbols;

  class CatAbonents extends CatObj{
    get no_mdm(){return this[get]('no_mdm')}
    set no_mdm(v){this[set]('no_mdm',v)}
    get area(){return this[get]('area')}
    set area(v){this[set]('area',v)}
    get servers(){return this[get]('servers')}
    set servers(v){this[set]('servers',v)}
  }
  classes.CatAbonents = CatAbonents;

  class CatAbonentsServersRow extends TabularSectionRow{
    get key(){return this[get]('key')}
    set key(v){this[set]('key',v)}
    get name(){return this[get]('name')}
    set name(v){this[set]('name',v)}
    get proxy(){return this[get]('proxy')}
    set proxy(v){this[set]('proxy',v)}
  }
  classes.CatAbonentsServersRow = CatAbonentsServersRow;

  class CatAbonentsManager extends CatManager {

    get current() {
      const {session_zone, zone} = this.root.jobPrm;
      return this.byId(session_zone || zone);
    }

    get price_types() {
      const {server} = this.root.jobPrm;
      const price_types = new Set();
      for(const id of server.abonents) {
        for(const price_type of this.byId(id)?.price_types) {
          price_types.add(price_type);
        }
      }
      return Array.from(price_types);
    }
  }
  classes.CatAbonentsManager = CatAbonentsManager;

  if(!exclude.includes('cat.abonents')) {
    cat.create('abonents');
    exclude.push('cat.abonents');
  }
};
