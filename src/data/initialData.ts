import { Card, Comment, Move, Project, User } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-1',
    name: 'Анна Орлова',
    role: 'admin',
    title: 'Руководитель мастерской',
    avatarColor: 'bg-emerald-700'
  },
  {
    id: 'user-2',
    name: 'Игорь Петров',
    role: 'assignee',
    title: 'Инженер-конструктор',
    avatarColor: 'bg-blue-600'
  },
  {
    id: 'user-3',
    name: 'Мария Сидорова',
    role: 'assignee',
    title: 'Менеджер по закупкам',
    avatarColor: 'bg-indigo-600'
  },
  {
    id: 'user-4',
    name: 'Дмитрий Козлов',
    role: 'assignee',
    title: 'Мастер цеха изготовления',
    avatarColor: 'bg-amber-700'
  },
  {
    id: 'user-5',
    name: 'Сергей Волков',
    role: 'assignee',
    title: 'Бригадир монтажа',
    avatarColor: 'bg-teal-700'
  },
  {
    id: 'user-6',
    name: 'Елена Миронова',
    role: 'viewer',
    title: 'Куратор сервиса',
    avatarColor: 'bg-stone-600'
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    title: 'Кухня семьи Ивановых',
    client: 'Семья Ивановых',
    startDate: '2026-10-01',
    targetEndDate: '2026-11-15',
    isArchived: false,
    createdAt: '2026-10-01T08:00:00.000Z'
  },
  {
    id: 'proj-2',
    title: 'Офис «Вектор»',
    client: 'ООО «Вектор»',
    startDate: '2026-09-15',
    targetEndDate: '2026-10-20',
    isArchived: false,
    createdAt: '2026-09-15T09:00:00.000Z'
  },
  {
    id: 'proj-3',
    title: 'Шкаф-купе Смирновых',
    client: 'Семья Смирновых',
    startDate: '2026-09-05',
    targetEndDate: '2026-09-30',
    isArchived: false,
    createdAt: '2026-09-05T08:30:00.000Z'
  }
];

// Cards for the 3 projects (4 cards each in strict task order)
export const INITIAL_CARDS: Card[] = [
  // Проект 1: Кухня семьи Ивановых
  {
    id: 'card-p1-1',
    projectId: 'proj-1',
    taskType: 'Проектирование',
    assigneeId: 'user-2', // Игорь Петров
    stage: 'Готово',
    stageSince: '2026-10-04T16:00:00.000Z'
  },
  {
    id: 'card-p1-2',
    projectId: 'proj-1',
    taskType: 'Закупка материалов',
    assigneeId: 'user-3', // Мария Сидорова
    stage: 'В работе',
    stageSince: '2026-10-05T09:30:00.000Z'
  },
  {
    id: 'card-p1-3',
    projectId: 'proj-1',
    taskType: 'Изготовление',
    assigneeId: 'user-4', // Дмитрий Козлов
    stage: 'Ожидает',
    stageSince: '2026-10-01T08:00:00.000Z'
  },
  {
    id: 'card-p1-4',
    projectId: 'proj-1',
    taskType: 'Монтаж',
    assigneeId: 'user-5', // Сергей Волков
    stage: 'Ожидает',
    stageSince: '2026-10-01T08:00:00.000Z'
  },

  // Проект 2: Офис «Вектор»
  {
    id: 'card-p2-1',
    projectId: 'proj-2',
    taskType: 'Проектирование',
    assigneeId: 'user-2',
    stage: 'Готово',
    stageSince: '2026-09-22T14:00:00.000Z'
  },
  {
    id: 'card-p2-2',
    projectId: 'proj-2',
    taskType: 'Закупка материалов',
    assigneeId: 'user-3',
    stage: 'Готово',
    stageSince: '2026-09-29T11:45:00.000Z'
  },
  {
    id: 'card-p2-3',
    projectId: 'proj-2',
    taskType: 'Изготовление',
    assigneeId: 'user-4',
    stage: 'На проверке',
    stageSince: '2026-10-04T15:20:00.000Z'
  },
  {
    id: 'card-p2-4',
    projectId: 'proj-2',
    taskType: 'Монтаж',
    assigneeId: 'user-5',
    stage: 'Ожидает',
    stageSince: '2026-09-15T09:00:00.000Z'
  },

  // Проект 3: Шкаф-купе Смирновых (просрочен)
  {
    id: 'card-p3-1',
    projectId: 'proj-3',
    taskType: 'Проектирование',
    assigneeId: 'user-2',
    stage: 'Готово',
    stageSince: '2026-09-10T12:00:00.000Z'
  },
  {
    id: 'card-p3-2',
    projectId: 'proj-3',
    taskType: 'Закупка материалов',
    assigneeId: 'user-3',
    stage: 'Готово',
    stageSince: '2026-09-16T17:30:00.000Z'
  },
  {
    id: 'card-p3-3',
    projectId: 'proj-3',
    taskType: 'Изготовление',
    assigneeId: 'user-4',
    stage: 'Готово',
    stageSince: '2026-09-26T18:00:00.000Z'
  },
  {
    id: 'card-p3-4',
    projectId: 'proj-3',
    taskType: 'Монтаж',
    assigneeId: 'user-5',
    stage: 'Доработка',
    stageSince: '2026-09-29T16:15:00.000Z'
  }
];

// Moves history (2-3 entries for cards with dates, author, from/to)
export const INITIAL_MOVES: Move[] = [
  // Card p1-1 (Проектирование Кухни)
  {
    id: 'move-p1-1-1',
    cardId: 'card-p1-1',
    projectId: 'proj-1',
    fromStage: 'Ожидает',
    toStage: 'В работе',
    movedAt: '2026-10-01T10:00:00.000Z',
    movedById: 'user-2' // Игорь Петров
  },
  {
    id: 'move-p1-1-2',
    cardId: 'card-p1-1',
    projectId: 'proj-1',
    fromStage: 'В работе',
    toStage: 'На проверке',
    movedAt: '2026-10-03T14:30:00.000Z',
    movedById: 'user-2'
  },
  {
    id: 'move-p1-1-3',
    cardId: 'card-p1-1',
    projectId: 'proj-1',
    fromStage: 'На проверке',
    toStage: 'Готово',
    movedAt: '2026-10-04T16:00:00.000Z',
    movedById: 'user-1' // Анна Орлова
  },

  // Card p1-2 (Закупка Кухни)
  {
    id: 'move-p1-2-1',
    cardId: 'card-p1-2',
    projectId: 'proj-1',
    fromStage: 'Ожидает',
    toStage: 'В работе',
    movedAt: '2026-10-05T09:30:00.000Z',
    movedById: 'user-3' // Мария Сидорова
  },

  // Card p1-3 & p1-4 (Кухня - созданы в Ожидает при старте проекта)
  {
    id: 'move-p1-3-1',
    cardId: 'card-p1-3',
    projectId: 'proj-1',
    fromStage: 'Ожидает',
    toStage: 'Ожидает',
    movedAt: '2026-10-01T08:00:00.000Z',
    movedById: 'user-1'
  },
  {
    id: 'move-p1-4-1',
    cardId: 'card-p1-4',
    projectId: 'proj-1',
    fromStage: 'Ожидает',
    toStage: 'Ожидает',
    movedAt: '2026-10-01T08:00:00.000Z',
    movedById: 'user-1'
  },

  // Card p2-1 (Офис «Вектор» - Проектирование)
  {
    id: 'move-p2-1-1',
    cardId: 'card-p2-1',
    projectId: 'proj-2',
    fromStage: 'Ожидает',
    toStage: 'В работе',
    movedAt: '2026-09-16T09:00:00.000Z',
    movedById: 'user-2'
  },
  {
    id: 'move-p2-1-2',
    cardId: 'card-p2-1',
    projectId: 'proj-2',
    fromStage: 'В работе',
    toStage: 'Готово',
    movedAt: '2026-09-22T14:00:00.000Z',
    movedById: 'user-1'
  },

  // Card p2-2 (Офис «Вектор» - Закупка)
  {
    id: 'move-p2-2-1',
    cardId: 'card-p2-2',
    projectId: 'proj-2',
    fromStage: 'Ожидает',
    toStage: 'В работе',
    movedAt: '2026-09-23T10:00:00.000Z',
    movedById: 'user-3'
  },
  {
    id: 'move-p2-2-2',
    cardId: 'card-p2-2',
    projectId: 'proj-2',
    fromStage: 'В работе',
    toStage: 'Готово',
    movedAt: '2026-09-29T11:45:00.000Z',
    movedById: 'user-3'
  },

  // Card p2-3 (Офис «Вектор» - Изготовление)
  {
    id: 'move-p2-3-1',
    cardId: 'card-p2-3',
    projectId: 'proj-2',
    fromStage: 'Ожидает',
    toStage: 'В работе',
    movedAt: '2026-09-30T08:30:00.000Z',
    movedById: 'user-4' // Дмитрий Козлов
  },
  {
    id: 'move-p2-3-2',
    cardId: 'card-p2-3',
    projectId: 'proj-2',
    fromStage: 'В работе',
    toStage: 'На проверке',
    movedAt: '2026-10-04T15:20:00.000Z',
    movedById: 'user-4'
  },

  // Card p2-4 (Офис «Вектор» - Монтаж)
  {
    id: 'move-p2-4-1',
    cardId: 'card-p2-4',
    projectId: 'proj-2',
    fromStage: 'Ожидает',
    toStage: 'Ожидает',
    movedAt: '2026-09-15T09:00:00.000Z',
    movedById: 'user-1'
  },

  // Card p3-1 (Шкаф-купе - Проектирование)
  {
    id: 'move-p3-1-1',
    cardId: 'card-p3-1',
    projectId: 'proj-3',
    fromStage: 'Ожидает',
    toStage: 'В работе',
    movedAt: '2026-09-06T10:00:00.000Z',
    movedById: 'user-2'
  },
  {
    id: 'move-p3-1-2',
    cardId: 'card-p3-1',
    projectId: 'proj-3',
    fromStage: 'В работе',
    toStage: 'Готово',
    movedAt: '2026-09-10T12:00:00.000Z',
    movedById: 'user-1'
  },

  // Card p3-2 (Шкаф-купе - Закупка)
  {
    id: 'move-p3-2-1',
    cardId: 'card-p3-2',
    projectId: 'proj-3',
    fromStage: 'Ожидает',
    toStage: 'В работе',
    movedAt: '2026-09-11T09:15:00.000Z',
    movedById: 'user-3'
  },
  {
    id: 'move-p3-2-2',
    cardId: 'card-p3-2',
    projectId: 'proj-3',
    fromStage: 'В работе',
    toStage: 'Готово',
    movedAt: '2026-09-16T17:30:00.000Z',
    movedById: 'user-3'
  },

  // Card p3-3 (Шкаф-купе - Изготовление)
  {
    id: 'move-p3-3-1',
    cardId: 'card-p3-3',
    projectId: 'proj-3',
    fromStage: 'Ожидает',
    toStage: 'В работе',
    movedAt: '2026-09-17T08:00:00.000Z',
    movedById: 'user-4'
  },
  {
    id: 'move-p3-3-2',
    cardId: 'card-p3-3',
    projectId: 'proj-3',
    fromStage: 'В работе',
    toStage: 'На проверке',
    movedAt: '2026-09-24T16:00:00.000Z',
    movedById: 'user-4'
  },
  {
    id: 'move-p3-3-3',
    cardId: 'card-p3-3',
    projectId: 'proj-3',
    fromStage: 'На проверке',
    toStage: 'Готово',
    movedAt: '2026-09-26T18:00:00.000Z',
    movedById: 'user-1'
  },

  // Card p3-4 (Шкаф-купе - Монтаж)
  {
    id: 'move-p3-4-1',
    cardId: 'card-p3-4',
    projectId: 'proj-3',
    fromStage: 'Ожидает',
    toStage: 'В работе',
    movedAt: '2026-09-27T09:00:00.000Z',
    movedById: 'user-5'
  },
  {
    id: 'move-p3-4-2',
    cardId: 'card-p3-4',
    projectId: 'proj-3',
    fromStage: 'В работе',
    toStage: 'Доработка',
    movedAt: '2026-09-29T16:15:00.000Z',
    movedById: 'user-5'
  }
];

// Initial comments (5 realistic comments from different users)
export const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'com-1',
    cardId: 'card-p1-1',
    authorId: 'user-2', // Игорь Петров
    text: 'Согласовали с клиентом раскладку ящиков под варочной панелью и профиль Gola в графитовом цвете. Чертежи загружены.',
    createdAt: '2026-10-03T11:20:00.000Z'
  },
  {
    id: 'com-2',
    cardId: 'card-p1-2',
    authorId: 'user-3', // Мария Сидорова
    text: 'Фасады из массива дуба заказаны, срок поставки на фабрику — четверг. Фурнитура Blum уже на складе.',
    createdAt: '2026-10-05T14:10:00.000Z'
  },
  {
    id: 'com-3',
    cardId: 'card-p2-3',
    authorId: 'user-4', // Дмитрий Козлов
    text: 'Столы руководителей собраны, лакировка завершена. Ожидаем проверку качества лакокрасочного покрытия.',
    createdAt: '2026-10-04T15:25:00.000Z'
  },
  {
    id: 'com-4',
    cardId: 'card-p3-4',
    authorId: 'user-5', // Сергей Волков
    text: 'При установке выяснилось, что правая стена имеет отклонение 18 мм. Требуется подрезка фальш-планки в цеху.',
    createdAt: '2026-09-29T16:10:00.000Z'
  },
  {
    id: 'com-5',
    cardId: 'card-p3-4',
    authorId: 'user-1', // Анна Орлова (Админ)
    text: 'Дмитрий, возьми фальш-планку в приоритет завтра утром, чтобы Сергей успел закрыть объект.',
    createdAt: '2026-09-29T17:05:00.000Z'
  }
];
