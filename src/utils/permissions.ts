import { Card, Comment, Project, User } from '../types';

export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Checks whether user can move a specific card to a new stage
 */
export function canMoveCard(user: User | null, card: Card): PermissionCheckResult {
  if (!user) {
    return { allowed: false, reason: 'Необходимо войти в систему' };
  }

  if (user.role === 'admin') {
    return { allowed: true };
  }

  if (user.role === 'assignee') {
    if (card.assigneeId === user.id) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'Вы можете перемещать только те карточки, где вы назначены ответственным'
    };
  }

  if (user.role === 'viewer') {
    return {
      allowed: false,
      reason: 'Наблюдателям доступен только просмотр. Перемещение карточек запрещено'
    };
  }

  return { allowed: false, reason: 'Недостаточно прав' };
}

/**
 * Checks whether user can view comments on a card
 * Restricts internal task discussions to the card's assignee and Administrator
 */
export function canViewComments(user: User | null, card: Card): PermissionCheckResult {
  if (!user) {
    return { allowed: false, reason: 'Необходимо войти в систему' };
  }

  if (user.role === 'admin') {
    return { allowed: true };
  }

  if (user.role === 'assignee') {
    if (card.assigneeId === user.id) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'Рабочие комментарии и детали задачи доступны только назначенному ответственному и Администратору'
    };
  }

  if (user.role === 'viewer') {
    return {
      allowed: false,
      reason: 'В режиме наблюдателя внутренние рабочие комментарии ответственного скрыты'
    };
  }

  return { allowed: false, reason: 'Недостаточно прав для просмотра комментариев' };
}

/**
 * Checks whether user can add comment to a card
 */
export function canAddComment(user: User | null, card: Card): PermissionCheckResult {
  if (!user) {
    return { allowed: false, reason: 'Необходимо войти в систему' };
  }

  if (user.role === 'admin') {
    return { allowed: true };
  }

  if (user.role === 'assignee') {
    if (card.assigneeId === user.id) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'Ответственные могут оставлять комментарии только в своих задачах'
    };
  }

  if (user.role === 'viewer') {
    return {
      allowed: false,
      reason: 'Наблюдателям доступен только просмотр. Оставлять комментарии запрещено'
    };
  }

  return { allowed: false, reason: 'Недостаточно прав' };
}

/**
 * Checks whether user can delete a specific comment
 */
export function canDeleteComment(user: User | null, comment: Comment): PermissionCheckResult {
  if (!user) {
    return { allowed: false, reason: 'Необходимо войти в систему' };
  }

  if (user.role === 'admin') {
    return { allowed: true };
  }

  if (comment.authorId === user.id) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: 'Вы можете удалять только свои комментарии'
  };
}

/**
 * Checks whether user can manage projects (create, edit, archive, restore)
 */
export function canManageProjects(user: User | null): PermissionCheckResult {
  if (!user) {
    return { allowed: false, reason: 'Необходимо войти в систему' };
  }

  if (user.role === 'admin') {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: 'Управлять проектами может только Администратор'
  };
}

/**
 * Checks whether user can manage users list
 */
export function canManageUsers(user: User | null): PermissionCheckResult {
  if (!user) {
    return { allowed: false, reason: 'Необходимо войти в систему' };
  }

  if (user.role === 'admin') {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: 'Управление пользователями доступно только Администратору'
  };
}

/**
 * Checks whether user can be deleted safely
 */
export function canDeleteUser(
  currentUser: User | null,
  targetUser: User,
  allUsers: User[],
  activeProjects: Project[],
  allCards: Card[]
): PermissionCheckResult {
  const adminCheck = canManageUsers(currentUser);
  if (!adminCheck.allowed) {
    return adminCheck;
  }

  // Check 1: Cannot delete self
  if (currentUser?.id === targetUser.id) {
    return {
      allowed: false,
      reason: 'Вы не можете удалить свой собственный профиль'
    };
  }

  // Check 2: Cannot delete the last administrator
  if (targetUser.role === 'admin') {
    const adminCount = allUsers.filter(u => u.role === 'admin').length;
    if (adminCount <= 1) {
      return {
        allowed: false,
        reason: 'Нельзя удалить единственного Администратора в системе'
      };
    }
  }

  // Check 3: Cannot delete user assigned to any active (non-archived) project card
  const activeProjectIds = new Set(activeProjects.filter(p => !p.isArchived).map(p => p.id));
  const assignedActiveCards = allCards.filter(
    c => activeProjectIds.has(c.projectId) && c.assigneeId === targetUser.id
  );

  if (assignedActiveCards.length > 0) {
    const projectTitles = activeProjects
      .filter(p => assignedActiveCards.some(c => c.projectId === p.id))
      .map(p => `«${p.title}»`)
      .slice(0, 3)
      .join(', ');

    return {
      allowed: false,
      reason: `Нельзя удалить пользователя: он назначен ответственным в ${assignedActiveCards.length} задачах активных проектов (${projectTitles}). Сначала переназначьте ответственных.`
    };
  }

  return { allowed: true };
}

/**
 * Checks whether user's role can be changed
 */
export function canChangeUserRole(
  currentUser: User | null,
  targetUser: User,
  newRole: string,
  allUsers: User[]
): PermissionCheckResult {
  const adminCheck = canManageUsers(currentUser);
  if (!adminCheck.allowed) {
    return adminCheck;
  }

  // If demoting an admin, ensure they are not the last admin
  if (targetUser.role === 'admin' && newRole !== 'admin') {
    const adminCount = allUsers.filter(u => u.role === 'admin').length;
    if (adminCount <= 1) {
      return {
        allowed: false,
        reason: 'Нельзя понизить роль единственного Администратора в системе'
      };
    }
  }

  return { allowed: true };
}
