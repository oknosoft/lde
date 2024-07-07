
export default {
  enm: {
    labelPositions: [
      {
        order: 0,
        name: 'inherit',
        synonym: 'Наследовать',
        'default': true,
      },
      {
        order: 1,
        name: 'hide',
        synonym: 'Скрыть'
      },
      {
        order: 2,
        name: 'left',
        synonym: 'Лево'
      },
      {
        order: 3,
        name: 'right',
        synonym: 'Право'
      },
      {
        order: 4,
        name: 'top',
        synonym: 'Верх'
      },
      {
        order: 5,
        name: 'bottom',
        synonym: 'Низ'
      },
      {
        tag: 'Положение заголовка элемеента управления',
        description: 'Системное перечисление',
        id: 'lp',
        aliases: ['label_positions'],
      },
    ],
    dataFieldKinds: [
      {
        order: 0,
        name: 'field',
        synonym: 'Поле ввода',
        'default': true,
      },
      {
        order: 1,
        name: 'input',
        synonym: 'Простой текст'
      },
      {
        order: 2,
        name: 'text',
        synonym: 'Многострочный текст'
      },
      {
        order: 3,
        name: 'label',
        synonym: 'Надпись'
      },
      {
        order: 4,
        name: 'link',
        synonym: 'Гиперссылка'
      },
      {
        order: 5,
        name: 'cascader',
        synonym: 'Каскадер'
      },
      {
        order: 6,
        name: 'toggle',
        synonym: 'Переключатель'
      },
      {
        order: 7,
        name: 'image',
        synonym: 'Картинка'
      },
      {
        order: 8,
        name: 'type',
        synonym: 'Тип значения'
      },
      {
        order: 9,
        name: 'path',
        synonym: 'Путь к данным'
      },
      {
        order: 10,
        name: 'typed_field',
        synonym: 'Поле связи по типу'
      },
      {
        order: 11,
        name: 'props',
        synonym: 'Свойства объекта'
      },
      {
        order: 12,
        name: 'star',
        synonym: 'Пометка'
      },
      {
        tag: 'Типы полей ввода данных',
        description: 'Системное перечисление',
      },
    ],
    quickAccess: [
      {
        order: 0,
        name: 'none',
        synonym: 'Нет',
        'default': true,
      },
      {
        order: 1,
        name: 'toolbar',
        synonym: 'Панель инструментов'
      },
      {
        order: 2,
        name: 'drawer',
        synonym: 'Панель формы'
      },
      {
        tag: 'Расположение элемента быстрого доступа',
        description: 'Для компоновки',
      },
    ],
    reportOutput: [
      {
        order: 0,
        name: 'grid',
        synonym: 'Таблица',
        'default': true
      },
      {
        order: 1,
        name: 'chart',
        synonym: 'Диаграмма'
      },
      {
        order: 2,
        name: 'pivot',
        synonym: 'Cводная таблица'
      },
      {
        order: 3,
        name: 'html',
        synonym: 'Документ HTML'
      },
      {
        tag: 'Варианты вывода отчёта',
        description: 'Для компоновки',
      },
    ],
  },
  cat: {
    metaObjs: {
      fields: {}
    },
    metaFields: {
      fields: {}
    },
  },
  dp: {
    schemeSettings: {
      name: 'schemeSettings',
      synonym: 'Варианты настроек компоновки',
      fields: {
        scheme: {
          synonym: 'Текущая настройка',
          tooltip: 'Текущий вариант настроек',
          mandatory: true,
          type: {
            types: ['cat.schemeSettings'],
          }
        }
      }
    }
  }
};
