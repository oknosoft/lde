
export const meta = {
  cch: {
    predefinedElmnts: {
      name: "ПредопределенныеЭлементы",
      synonym: "Константы и списки",
      illustration: "Хранит значения настроек и параметров подсистем",
      objPresentation: "Значение настроек",
      listPresentation: "",
      inputBy: ["name", "synonym"],
      hierarchical: true,
      groupHierarchy: false,
      mainPresentation: "name",
      codeLength: 0,
      fields: {
        value: {
          synonym: "Значение",
          multiline: false,
          choiceType: {
            path: ["type"],
            elm: 0
          },
          type: {
            types: [
              "cat.formulas",
              "boolean",
              "cch.properties",
              "string",
              "date",
              "number"
            ],
            strLen: 1024,
            datePart: "date",
            digits: 8,
            fraction: 1
          }
        },
        definition: {
          synonym: "Описание",
          multiline: true,
          type: {
            types: ["string"],
            strLen: 0
          }
        },
        synonym: {
          synonym: "Синоним",
          multiline: false,
          tooltip: "Синоним предопределенного элемента латиницей для обращения из javascript",
          type: {
            types: ["string"],
            strLen: 50
          }
        },
        list: {
          synonym: "Список",
          multiline: false,
          tooltip: "",
          type: {
            types: ["number"],
            digits: 1,
            fraction: 0
          }
        },
        captured: {
          synonym: "Захвачен",
          multiline: false,
          type: {
            types: ["boolean"]
          }
        },
        editor: {
          synonym: "Редактор",
          multiline: false,
          choiceGrp: "elm",
          type: {
            types: ["cat.users", "cat.accounts"]
          }
        },
        parent: {
          synonym: "Группа",
          type: {
            types: ["cch.predefinedElmnts"]
          }
        },
        type: {
          synonym: "Тип",
          type: {
            types: [
              "cat.formulas",
              "boolean",
              "cch.properties",
              "string",
              "date",
              "number"
            ],
            strLen: 1024,
            datePart: "date",
            digits: 8,
            fraction: 1
          }
        }
      },
      tabulars: {
        elmnts: {
          name: "Элементы",
          synonym: "Элементы",
          fields: {
            value: {
              synonym: "Значение",
              choiceType: {
                path: ["type"],
                elm: 0
              },
              type: {
                types: [
                  "cat.formulas",
                  "boolean",
                  "cch.properties",
                  "string",
                  "date",
                  "number"
                ],
                strLen: 1024,
                datePart: "date",
                digits: 8,
                fraction: 1
              }
            },
            elm: {
              synonym: "Элемент",
              type: {
                types: [
                  "cat.formulas",
                  "boolean",
                  "cch.properties",
                  "string",
                  "date",
                  "number"
                ],
                strLen: 1024,
                datePart: "date",
                digits: 8,
                fraction: 1
              }
            }
          }
        }
      },
      cachable: "ram",
      id: "pd",
      aliases: ['predefined_elmnts'],
    }
  },
};

export default function ({cch, classes, symbols}, exclude) {
  const {CatObj, TabularSectionRow} = classes;
  const {get, set} = symbols;

  // базовое поведение класса, задаём сразу


  // но оставляем возможность дополнить-переопределить
  // если пользователь попросил не спешить с созданием менеджера - не спешим
  // if(!exclude.includes('cch.predefinedElmnts')) {
  //   cch.create('predefinedElmnts');
  // }
};
