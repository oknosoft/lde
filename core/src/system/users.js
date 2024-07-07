// метаданные и класс справочника Пользователи

export const meta = {
  cat: {
    users: {
      name: "Пользователи",
      synonym: "Пользователи 1C",
      illustration: "",
      objPresentation: "Пользователь",
      inputBy: ["name"],
      hierarchical: false,
      groupHierarchy: true,
      mainPresentation: "name",
      codeLength: 0,
      id: "u",
      fields: {
        invalid: {
          synonym: "Недействителен",
          tooltip: "Пользователь больше не работает в программе, но сведения о нем сохранены.\nНедействительные пользователи скрываются из всех списков\nпри выборе или подборе в документах и других местах программы.",
          type: {types: ["boolean"]}
        },
        note: {
          synonym: "Комментарий",
          multiline: true,
          tooltip: "Произвольная строка",
          type: {types: ["string"], strLen: 0}
        },
        ancillary: {
          synonym: "Служебный",
          tooltip: "Неразделенный или разделенный служебный пользователь, права к которому устанавливаются непосредственно и программно.",
          type: {types: ["boolean"]}
        }
      },
      tabulars: {
        extraFields: {
          name: "ДополнительныеРеквизиты",
          synonym: "Дополнительные реквизиты",
          tooltip: "Дополнительные реквизиты объекта",
          fields: {
            property: {
              synonym: "Свойство",
              tooltip: "Дополнительный реквизит",
              choiceGrp: "elm",
              type: {types: ["cch.properties"]}
            },
            value: {
              synonym: "Значение",
              multiline: false,
              tooltip: "Значение дополнительного реквизита",
              choiceLinks: [{
                  name: ["selection", "owner"],
                  path: ["extraFields", "property"]
              }],
              choiceGrp: "elm",
              choiceType: {
                path: ["extraFields", "property"],
                elm: 0
              },
              type: {
                types: [
                  "cat.property_values_hierarchy",
                  "boolean",
                  "cat.property_values",
                  "string",
                  "date",
                  "number",
                  "cat.users"
                ],
                "strLen": 1024,
                "datePart": "date_time",
                "digits": 15,
                "fraction": 3
              }
            },
            txtRow: {
              synonym: "Текстовая строка",
              multiline_mode: false,
              tooltip: "Полный текст строкового дополнительного реквизита",
              type: {types: ["string"], strLen: 0}
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

  class CatUsers extends CatObj{
    get invalid(){return this[get]('invalid')}
    set invalid(v){this[set]('invalid',v)}
    get note(){return this[get]('note')}
    set note(v){this[set]('note',v)}
    get ancillary(){return this[get]('ancillary')}
    set ancillary(v){this[set]('ancillary',v)}
    get extraFields(){return this[get]('extraFields')}
  }
  classes.CatUsers = CatUsers;
  class CatUsersExtraFieldsRow extends TabularSectionRow{
    get property(){return this[get]('property')}
    set property(v){this[set]('property',v)}
    get value(){return this[get]('value')}
    set value(v){this[set]('value',v)}
    get txtRow(){return this[get]('txtRow')}
    set txtRow(v){this[set]('txtRow',v)}
  }
  classes.CatUsersExtraFieldsRow = CatUsersExtraFieldsRow;

  // но оставляем возможность дополнить-переопределить
  // если пользователь попросил не спешить с созданием менеджера - не спешим
  if(!exclude.includes('cat.users')) {
    cat.create('users');
    exclude.push('cat.users');
  }
};
