
export const meta = {
  cch: {
    properties: {
      name: "ДополнительныеРеквизитыИСведения",
      synonym: "Дополнительные реквизиты и сведения",
      illustration: "",
      objPresentation: "Дополнительный реквизит / сведение",
      listPresentation: "",
      inputBy: ["name"],
      hierarchical: false,
      groupHierarchy: false,
      mainPresentation: "name",
      codeLength: 0,
      id: "pr",
      fields: {
        shown: {
          synonym: "Виден",
          multiline: false,
          tooltip: "Настройка видимости дополнительного реквизита",
          type: {
            "types": [
              "boolean"
            ]
          }
        },
        sorting_field: {
          synonym: "Порядок",
          multiline: false,
          tooltip: "Используется для упорядочивания (служебный)",
          type: {
            "types": [
              "number"
            ],
            "digits": 6,
            "fraction": 0
          }
        },
        extra_values_owner: {
          synonym: "Владелец дополнительных значений",
          multiline: false,
          tooltip: "Свойство-образец, с которым у этого свойства одинаковый список дополнительных значений",
          choiceGrp: "elm",
          type: {
            "types": [
              "cch.properties"
            ]
          }
        },
        available: {
          synonym: "Доступен",
          multiline: false,
          tooltip: "Настройка доступности дополнительного реквизита",
          type: {
            "types": [
              "boolean"
            ]
          }
        },
        mandatory: {
          synonym: "Заполнять обязательно",
          multiline: false,
          tooltip: "Настройка проверки заполненности дополнительного реквизита",
          type: {
            "types": [
              "boolean"
            ]
          }
        },
        include_to_name: {
          synonym: "Включать в наименование",
          multiline: false,
          tooltip: "Добавлять значение параметра в наименование продукции",
          type: {
            "types": [
              "boolean"
            ]
          }
        },
        list: {
          synonym: "Список",
          multiline: false,
          tooltip: "Реквизит подсистемы интеграции metadata.js - реализует функциональность списка опций",
          type: {
            "types": [
              "number"
            ],
            "digits": 1,
            "fraction": 0
          }
        },
        caption: {
          synonym: "Наименование",
          multiline: false,
          tooltip: "Краткое представление свойства, которое\nвыводится в формах редактирования его значения",
          mandatory: true,
          type: {
            "types": [
              "string"
            ],
            strLen: 75
          }
        },
        note: {
          synonym: "Комментарий",
          multiline: false,
          tooltip: "Поясняет назначение свойства",
          type: {
            "types": [
              "string"
            ],
            strLen: 0
          }
        },
        destination: {
          synonym: "Набор свойств",
          multiline: false,
          tooltip: "Набор свойств, которому принадлежит уникальное свойство. Если не задан, значит свойство общее.",
          choiceGrp: "elm",
          type: {
            "types": [
              "cat.destinations"
            ]
          }
        },
        tooltip: {
          synonym: "Подсказка",
          multiline: false,
          tooltip: "Показывается пользователю при редактировании свойства в форме объекта",
          type: {
            "types": [
              "string"
            ],
            strLen: 0
          }
        },
        is_extra_property: {
          synonym: "Это дополнительное сведение",
          multiline: false,
          tooltip: "Свойство является дополнительным сведением, а не дополнительным реквизитом",
          type: {
            "types": [
              "boolean"
            ]
          }
        },
        include_to_description: {
          synonym: "Включать в описание",
          multiline: false,
          tooltip: "Добавлять имя и значение параметра в строку описания продукции",
          type: {
            "types": [
              "boolean"
            ]
          }
        },
        calculated: {
          synonym: "Вычисляемый",
          multiline: false,
          tooltip: "Если параметр вычисляемый, здесь указываем формулу",
          choiceGrp: "elm",
          type: {
            "types": [
              "cat.formulas"
            ]
          }
        },
        showcalc: {
          synonym: "Показывать вычисляемый",
          multiline: false,
          tooltip: "Показывать параметр в списках свойств объекта ",
          type: {
            "types": [
              "boolean"
            ]
          }
        },
        inheritance: {
          synonym: "Наследование",
          multiline: false,
          tooltip: "Правило уточнения значений свойства\n0 - Обычный параметр\n1 - Переопределять для элемента\n2 - Только для элемента\n3 - Переопределять для отдела абонента\n4 - Умолчание для отдела\n6 - Значение из шаблона",
          type: {
            "types": [
              "number"
            ],
            "digits": 6,
            "fraction": 0
          }
        },
        captured: {
          synonym: "Захвачен",
          multiline: false,
          tooltip: "Реквизит подсистемы MDM. Указывает, что объект в настоящий момент, захвачен для редактирования",
          choiceGrp: "elm",
          type: {
            "types": [
              "boolean",
              "string"
            ],
            strLen: 50
          }
        },
        editor: {
          synonym: "Редактор",
          multiline: false,
          tooltip: "Реквизит подсистемы MDM, указывает на {@link CatUsers|Пользователя}, захватившего объект для редактирования",
          choiceGrp: "elm",
          type: {
            "types": [
              "cat.users"
            ]
          }
        },
        predefined_name: {
          synonym: "",
          multiline: false,
          tooltip: "",
          type: {
            "types": [
              "string"
            ],
            strLen: 256
          }
        },
        type: {
          synonym: "",
          multiline: false,
          tooltip: "Типы значения, которое можно ввести при заполнении свойства.",
          mandatory: true,
          type: {
            types: [
              "cat.abonents",
              "cat.accounts",
              "cat.branches",
              "cat.users",
              "cat.values_options",
              "cat.property_values_hierarchy",
              "cat.formulas",
              "cat.property_values",
              "cat.parameters_keys",
              "cch.properties",
              "boolean",
              "string",
              "date",
              "number"
            ],
            "strLen": 1024,
            "datePart": "date_time",
            "digits": 15,
            "fraction": 3
          }
        }
      },
      tabulars: {
        hide: {
          name: "Скрыть",
          synonym: "Скрываемые значения",
          tooltip: "Для печатных форм. Значения, перечисленные в данной табчасти, могут быть скрыты",
          fields: {
            value: {
              synonym: "Скрывать значения",
              multiline: false,
              tooltip: "",
              choiceLinks: [
                {
                  "name": [
                    "selection",
                    "owner"
                  ],
                  "path": [
                    "ref"
                  ]
                }
              ],
              choiceGrp: "elm",
              choiceType: {
                "path": [
                  "type"
                ],
                "elm": 0
              },
              type: {
                "types": [
                  "cat.abonents",
                  "cat.accounts",
                  "cat.branches",
                  "cat.users",
                  "cat.values_options",
                  "cat.property_values_hierarchy",
                  "cat.formulas",
                  "cat.property_values",
                  "cat.parameters_keys",
                  "cch.properties",
                  "boolean",
                  "string",
                  "date",
                  "number"
                ],
                "strLen": 1024,
                "datePart": "date_time",
                "digits": 15,
                "fraction": 3
              }
            }
          }
        }
      },
      cachable: "ram"
    }
  }
};

export default function ({cat, classes, symbols}, exclude) {

};
