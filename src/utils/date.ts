import { Card, Project, ProjectDeadlineStatus } from '../types';

/**
 * Formats ISO date or date string to DD.MM.YYYY
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  } catch {
    return dateStr;
  }
}

/**
 * Formats ISO timestamp to DD.MM.YYYY, HH:mm
 */
export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year}, ${hours}:${minutes}`;
  } catch {
    return dateStr;
  }
}

/**
 * Normalizes date to midnight local time for pure calendar day comparison
 */
function toMidnight(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Calculates project deadline status based on project cards and target end date
 */
export function getProjectDeadlineStatus(project: Project, cards: Card[]): {
  status: ProjectDeadlineStatus;
  label: string;
  daysRemaining: number;
} {
  const projectCards = cards.filter(c => c.projectId === project.id);
  const isAllDone = projectCards.length > 0 && projectCards.every(c => c.stage === 'Готово');

  if (isAllDone) {
    return {
      status: 'completed',
      label: 'Завершён',
      daysRemaining: 0
    };
  }

  const today = toMidnight(new Date());
  const endDate = toMidnight(new Date(project.targetEndDate));
  
  // Calculate difference in whole days
  const msPerDay = 1000 * 60 * 60 * 24;
  const diffDays = Math.round((endDate.getTime() - today.getTime()) / msPerDay);

  if (diffDays < 0) {
    return {
      status: 'overdue',
      label: `Просрочен (на ${Math.abs(diffDays)} дн.)`,
      daysRemaining: diffDays
    };
  }

  if (diffDays <= 3) {
    return {
      status: 'urgent',
      label: diffDays === 0 ? 'Срок сегодня' : `Срок близко (${diffDays} дн.)`,
      daysRemaining: diffDays
    };
  }

  return {
    status: 'in_progress',
    label: `В работе (осталось ${diffDays} дн.)`,
    daysRemaining: diffDays
  };
}
