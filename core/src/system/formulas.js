
export const meta = {
  cat: {
    formulas: {
      name: "Формулы",
      synonym: "Формулы",
      illustration: "Формулы пользователя, для выполнения при расчете спецификаций, модификаторы, вычисляемые свойства",
      objPresentation: "Формула",
      listPresentation: "",
      inputBy: ["name"],
      hierarchical: true,
      groupHierarchy: true,
      mainPresentation: "name",
      codeLength: 0,
      id: "f",
      fields: {
        formula: {
          synonym: "Формула",
          multiline: false,
          tooltip: "Текст функции на языке javascript",
          type: {
            "types": [
              "string"
            ],
            strLen: 0
          }
        },
        leading_formula: {
          synonym: "Ведущая формула",
          multiline: false,
          tooltip: "Если указано, выполняется код ведущей формулы с параметрами, заданными для текущей формулы",
          choiceParams: [
            {
              "name": "leading_formula",
              "path": "00000000-0000-0000-0000-000000000000"
            }
          ],
          choiceGrp: "elm",
          type: {
            "types": [
              "cat.formulas"
            ]
          }
        },
        condition_formula: {
          synonym: "Это формула условия",
          multiline: false,
          tooltip: "Формула используется, как фильтр, а не как алгоритм расчета количества.\nЕсли возвращает не Истина, строка в спецификацию не добавляется",
          type: {
            "types": [
              "boolean"
            ]
          }
        },
        definition: {
          synonym: "Описание",
          multiline: true,
          tooltip: "Описание в формате html",
          type: {
            "types": [
              "string"
            ],
            strLen: 0
          }
        },
        template: {
          synonym: "Шаблон",
          multiline: true,
          tooltip: "html или jsx шаблон отчета",
          type: {
            "types": [
              "string"
            ],
            strLen: 0
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
        async: {
          synonym: "Асинхронный режим",
          multiline: false,
          tooltip: "Создавать асинхронную функцию",
          type: {
            "types": [
              "boolean"
            ]
          }
        },
        disabled: {
          synonym: "Отключена",
          multiline: false,
          tooltip: "Имеет смысл только для печатных форм и модификаторов",
          type: {
            "types": [
              "boolean"
            ]
          }
        },
        context: {
          synonym: "Контекст",
          multiline: false,
          tooltip: "Выполнять в браузере, node или везде",
          "max": 2,
          "min": 0,
          type: {
            "types": [
              "number"
            ],
            "digits": 6,
            "fraction": 0
          }
        },
        jsx: {
          synonym: "JSX",
          multiline: false,
          tooltip: "Транспилировать формулу из шаблона jsx",
          type: {
            "types": [
              "boolean"
            ]
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
        parent: {
          synonym: "Группа",
          multiline: false,
          tooltip: "Группа формул",
          "mandatory": true,
          type: {
            "types": [
              "cat.formulas"
            ]
          }
        }
      },
      tabulars: {
        params: {
          name: "Параметры",
          synonym: "Параметры",
          tooltip: "",
          fields: {
            param: {
              synonym: "Параметр",
              multiline: false,
              tooltip: "",
              choiceGrp: "elm",
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
            },
            value: {
              synonym: "Значение",
              multiline: false,
              tooltip: "",
              choiceLinks: [
                {
                  "name": [
                    "selection",
                    "owner"
                  ],
                  "path": [
                    "params",
                    "param"
                  ]
                }
              ],
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
          }
        }
      },
      cachable: "ram"
    },
  }
};
