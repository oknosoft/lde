// метаданные и класс справочника Серверы

export const meta = {
  cat: {
    servers: {
      name: "ИнтеграцияСерверы",
      synonym: "Серверы CouchDB",
      illustration: "",
      objPresentation: "Сервер",
      listPresentation: "Серверы CouchDB",
      inputBy: ["name"],
      hierarchical: false,
      mainPresentation: "name",
      codeLength: 0,
      id: "srv",
      fields: {
        http: {
          synonym: "HTTP",
          tooltip: "Адрес сервиса интеграции metadata.js или сервера авторизации oAuth",
          mandatory: true,
          type: {
            types: [
              "string"
            ],
            "str_len": 255
          }
        },
        http_local: {
          synonym: "HTTP local",
          tooltip: "Адрес в локальной сети для репликатора (если не указан, используется основной HTTP)",
          type: {
            types: [
              "string"
            ],
            "str_len": 255
          }
        },
        username: {
          synonym: "Login (consumerKey)",
          tooltip: "Login администратора CouchDB или consumerKey сервера oAuth",
          mandatory: true,
          type: {
            types: [
              "string"
            ],
            "str_len": 100
          }
        },
        password: {
          synonym: "Password (consumerSecret)",
          tooltip: "Пароль администратора CouchDB или consumerSecret сервера oAuth",
          mandatory: true,
          type: {
            types: [
              "string"
            ],
            "str_len": 100
          }
        },
        callbackurl: {
          synonym: "Обратный url oAuth",
          tooltip: "oAuth callback URL",
          type: {
            types: [
              "string"
            ],
            "str_len": 255
          }
        },
        hv: {
          synonym: "Гипервизор",
          tooltip: "Гипервизор, на котором расположен сервер, используется при формировании очереди заданий",
          type: {
            types: [
              "string"
            ],
            "str_len": 20
          }
        }
      },
      cachable: "meta"
    },
  },
};

export default function ({cat, classes, symbols}, exclude) {

};
