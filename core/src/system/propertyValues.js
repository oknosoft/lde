
export const meta = {
  cat: {
    propertyValues: {
      name: "ЗначенияСвойствОбъектов",
      synonym: "Дополнительные значения",
      illustration: "",
      objPresentation: "Дополнительное значение",
      listPresentation: "",
      inputBy: ["name"],
      hierarchical: true,
      hasOwners: true,
      groupHierarchy: true,
      mainPresentation: "name",
      codeLength: 0,
      fields: {
        heft: {
          synonym: "Весовой коэффициент",
          multiline: false,
          tooltip: "Относительный вес дополнительного значения (значимость).",
          type: {
            types: [
              "number"
            ],
            "digits": 10,
            "fraction": 2
          }
        },
        css: {
          synonym: "Класс css",
          multiline: false,
          tooltip: "css класс картинки значения - для оживления списков выбора",
          type: {
            types: [
              "string"
            ],
            "str_len": 50
          }
        },
        owner: {
          synonym: "Свойство",
          multiline: false,
          tooltip: "Дополнительный реквизит или сведение.",
          "mandatory": true,
          type: {
            types: [
              "cch.properties"
            ],
            "is_ref": true
          }
        },
        parent: {
          synonym: "Входит в группу",
          multiline: false,
          tooltip: "Группа дополнительных значений свойства.",
          choiceLinks: [
            {
              "name": [
                "selection",
                "owner"
              ],
              "path": [
                "owner"
              ]
            }
          ],
          type: {
            types: [
              "cat.property_values"
            ],
            "is_ref": true
          }
        }
      },
      tabulars: {},
      cachable: "ram",
      id: "v",
      aliases: ['property_values'],
    },
    propertyValuesHierarchy: {
      name: "ЗначенияСвойствОбъектовИерархия",
      synonym: "Дополнительные значения (иерархия)",
      illustration: "",
      objPresentation: "Дополнительное значение (иерархия)",
      listPresentation: "",
      inputBy: ["name"],
      hierarchical: true,
      hasOwners: true,
      groupHierarchy: true,
      mainPresentation: "name",
      codeLength: 0,
      fields: {
        heft: {
          synonym: "Весовой коэффициент",
          multiline: false,
          tooltip: "Относительный вес дополнительного значения (значимость).",
          type: {
            types: [
              "number"
            ],
            "digits": 10,
            "fraction": 2
          }
        },
        css: {
          synonym: "Класс css",
          multiline: false,
          tooltip: "css класс картинки значения - для оживления списков выбора",
          type: {
            types: [
              "string"
            ],
            "str_len": 50
          }
        },
        owner: {
          synonym: "Свойство",
          multiline: false,
          tooltip: "Дополнительный реквизит или сведение.",
          "mandatory": true,
          type: {
            types: [
              "cch.properties"
            ],
            "is_ref": true
          }
        },
        parent: {
          synonym: "Входит в группу",
          multiline: false,
          tooltip: "Группа дополнительных значений свойства.",
          choiceLinks: [
            {
              "name": [
                "selection",
                "owner"
              ],
              "path": [
                "owner"
              ]
            }
          ],
          type: {
            types: [
              "cat.property_values"
            ],
            "is_ref": true
          }
        }
      },
      tabulars: {},
      cachable: "ram",
      id: "vh",
      aliases: ['property_values_hierarchy'],
    },
  }
};
