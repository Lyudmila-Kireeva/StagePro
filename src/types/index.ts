export type UserRole = 'admin' | 'assignee' | 'viewer';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  title?: string;
  avatarColor: string;
}

export type TaskType = 
  | 'Проектирование' 
  | 'Закупка материалов' 
  | 'Изготовление' 
  | 'Монтаж';

export type StageType = 
  | 'Ожидает' 
  | 'В работе' 
  | 'На проверке' 
  | 'Доработка' 
  | 'Готово';

export const TASK_TYPES: readonly TaskType[] = [
  'Проектирование',
  'Закупка материалов',
  'Изготовление',
  'Монтаж'
] as const;

export const STAGE_TYPES: readonly StageType[] = [
  'Ожидает',
  'В работе',
  'На проверке',
  'Доработка',
  'Готово'
] as const;

export interface Project {
  id: string;
  title: string;
  client: string;
  startDate: string; // ISO date YYYY-MM-DD
  targetEndDate: string; // ISO date YYYY-MM-DD
  isArchived: boolean;
  createdAt: string; // ISO timestamp
}

export interface Card {
  id: string;
  projectId: string;
  taskType: TaskType;
  assigneeId: string;
  stage: StageType;
  stageSince: string; // ISO timestamp
}

export interface Move {
  id: string;
  cardId: string;
  projectId: string;
  fromStage: StageType;
  toStage: StageType;
  movedAt: string; // ISO timestamp
  movedById: string;
}

export interface Comment {
  id: string;
  cardId: string;
  authorId: string;
  text: string;
  createdAt: string; // ISO timestamp
}

export type ProjectDeadlineStatus = 'completed' | 'overdue' | 'urgent' | 'in_progress';

export interface StageVisualConfig {
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  columnHeaderBg: string;
  columnHeaderBorder: string;
  dropZoneHover: string;
  accentColor: string;
}

export const STAGE_CONFIGS: Record<StageType, StageVisualConfig> = {
  'Ожидает': {
    badgeBg: 'bg-stone-100',
    badgeText: 'text-stone-700',
    badgeBorder: 'border-stone-200',
    columnHeaderBg: 'bg-stone-100/80',
    columnHeaderBorder: 'border-stone-300',
    dropZoneHover: 'bg-stone-100/60 ring-stone-400',
    accentColor: '#78716c'
  },
  'В работе': {
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-200',
    columnHeaderBg: 'bg-blue-50/80',
    columnHeaderBorder: 'border-blue-200',
    dropZoneHover: 'bg-blue-50/60 ring-blue-400',
    accentColor: '#2563eb'
  },
  'На проверке': {
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-200',
    columnHeaderBg: 'bg-amber-50/80',
    columnHeaderBorder: 'border-amber-200',
    dropZoneHover: 'bg-amber-50/60 ring-amber-400',
    accentColor: '#d97706'
  },
  'Доработка': {
    badgeBg: 'bg-orange-50',
    badgeText: 'text-orange-800',
    badgeBorder: 'border-orange-200',
    columnHeaderBg: 'bg-orange-50/80',
    columnHeaderBorder: 'border-orange-200',
    dropZoneHover: 'bg-orange-50/60 ring-orange-400',
    accentColor: '#ea580c'
  },
  'Готово': {
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-200',
    columnHeaderBg: 'bg-emerald-50/80',
    columnHeaderBorder: 'border-emerald-200',
    dropZoneHover: 'bg-emerald-50/60 ring-emerald-400',
    accentColor: '#059669'
  }
};
