
export const meta = {
  cat: {
    destinations: {
      name: "НаборыДополнительныхРеквизитовИСведений",
      synonym: "Наборы дополнительных реквизитов и сведений",
      illustration: "",
      objPresentation: "Набор дополнительных реквизитов и сведений",
      listPresentation: "",
      inputBy: ["name"],
      hierarchical: true,
      groupHierarchy: true,
      mainPresentation: "name",
      codeLength: 0,
      id: "",
      fields: {
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
          synonym: "Входит в группу",
          multiline: false,
          tooltip: "Группа, к которой относится набор.",
          type: {
            "types": [
              "cat.destinations"
            ]
          }
        }
      },
      tabulars: {
        extra_fields: {
          name: "ДополнительныеРеквизиты",
          synonym: "Дополнительные реквизиты",
          tooltip: "",
          fields: {
            "property": {
              synonym: "Дополнительный реквизит",
              multiline: false,
              tooltip: "Дополнительный реквизит этого набора",
              choiceGrp: "elm",
              type: {
                "types": [
                  "cch.properties"
                ]
              }
            },
            "_deleted": {
              synonym: "Пометка удаления",
              multiline: false,
              tooltip: "Устанавливается при исключении дополнительного реквизита из набора,\nчтобы можно было вернуть связь с уникальным дополнительным реквизитом.",
              type: {
                "types": [
                  "boolean"
                ]
              }
            }
          }
        },
        extra_properties: {
          name: "ДополнительныеСведения",
          synonym: "Дополнительные сведения",
          tooltip: "",
          fields: {
            "property": {
              synonym: "Дополнительное сведение",
              multiline: false,
              tooltip: "Дополнительное сведение этого набора",
              choiceGrp: "elm",
              type: {
                "types": [
                  "cch.properties"
                ]
              }
            },
            "_deleted": {
              synonym: "Пометка удаления",
              multiline: false,
              tooltip: "Устанавливается при исключении дополнительного сведения из набора,\nчтобы можно было вернуть связь с уникальным дополнительным сведением.",
              type: {
                "types": [
                  "boolean"
                ]
              }
            }
          }
        }
      },
      cachable: "ram"
    },
  }
};
