// метаданные и класс регистра log

export const meta = {
  ireg: {
    log: {
      name: 'log',
      note: '',
      synonym: 'Журнал событий',
      dimensions: {
        date: {
          synonym: 'Дата',
          tooltip: 'Момент события',
          type: {types: ['number'], digits: 15, fraction: 0},
        },
        user: {
          synonym: 'Пользователь',
          tooltip: 'Пользователь, в сеансе которого произошло событие',
          type: {types: ['string'], strLen: 100},
        },
      },
      resources: {
        'class': {
          synonym: 'Класс',
          tooltip: 'Класс события',
          type: {types: ['string'], strLen: 100},
        },
        note: {
          synonym: 'Комментарий',
          multiline: true,
          tooltip: 'Текст события',
          type: {types: ['string'], strLen: 0},
        },
        obj: {
          synonym: 'Объект',
          multiline: true,
          tooltip: 'Объект, к которому относится событие',
          type: {types: ['json']},
        },
      },
      cachable: 'log',
      id: 'log',
    },
    logView: {
      name: 'Просмотр событий',
      note: '',
      synonym: 'Просмотр журнала событий',
      dimensions: {
        date: {
          synonym: 'Дата',
          tooltip: 'Момент события',
          type: {types: ['number'], digits: 15, fraction: 0},
        },
        user: {
          synonym: 'Пользователь',
          tooltip: 'Пользователь, в сеансе которого произошло событие',
          type: {types: ['string'], strLen: 100},
        },
        current: {
          synonym: 'Текйщий пользователь',
          tooltip: 'Пользователь, отметивыший событие, как просмотренное',
          type: {types: ['string'], strLen: 100},
        },
      },
      cachable: 'log',
      id: 'lv',
    },
  },
};

export default function ({ireg, classes, symbols}, exclude) {

};
