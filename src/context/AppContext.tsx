import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  Card,
  Comment,
  Move,
  Project,
  StageType,
  TaskType,
  TASK_TYPES,
  User,
  UserRole
} from '../types';
import {
  INITIAL_CARDS,
  INITIAL_COMMENTS,
  INITIAL_MOVES,
  INITIAL_PROJECTS,
  INITIAL_USERS
} from '../data/initialData';
import {
  canAddComment,
  canChangeUserRole,
  canDeleteComment,
  canDeleteUser,
  canManageProjects,
  canManageUsers,
  canMoveCard
} from '../utils/permissions';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface StoredData {
  users: User[];
  projects: Project[];
  cards: Card[];
  moves: Move[];
  comments: Comment[];
  currentUserId: string | null;
  collapsedProjects: string[];
}

interface CreateProjectInput {
  title: string;
  client: string;
  startDate: string;
  targetEndDate: string;
  assignees: Record<TaskType, string>;
}

interface AppContextValue {
  users: User[];
  projects: Project[];
  cards: Card[];
  moves: Move[];
  comments: Comment[];
  currentUser: User | null;
  collapsedProjects: string[];
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;
  setCurrentUser: (userId: string | null) => void;
  moveCard: (cardId: string, targetStage: StageType) => boolean;
  addComment: (cardId: string, text: string) => boolean;
  deleteComment: (commentId: string) => boolean;
  createProject: (data: CreateProjectInput) => boolean;
  updateProject: (projectId: string, data: CreateProjectInput) => boolean;
  archiveProject: (projectId: string, archive: boolean) => boolean;
  toggleProjectCollapse: (projectId: string) => void;
  createUser: (name: string, role: UserRole, title?: string) => boolean;
  updateUserRole: (userId: string, newRole: UserRole) => boolean;
  deleteUser: (userId: string) => boolean;
  resetToDemo: () => void;
}

const STORAGE_KEY = 'etappro_v1';

const AppContext = createContext<AppContextValue | null>(null);

const DEFAULT_AVATARS = [
  'bg-emerald-700',
  'bg-blue-600',
  'bg-amber-700',
  'bg-teal-700',
  'bg-indigo-600',
  'bg-rose-700',
  'bg-stone-700',
  'bg-cyan-700'
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state safely from localStorage
  const [data, setData] = useState<StoredData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as StoredData;
        if (
          Array.isArray(parsed.users) &&
          Array.isArray(parsed.projects) &&
          Array.isArray(parsed.cards) &&
          Array.isArray(parsed.moves) &&
          Array.isArray(parsed.comments)
        ) {
          return {
            users: parsed.users,
            projects: parsed.projects,
            cards: parsed.cards,
            moves: parsed.moves,
            comments: parsed.comments,
            currentUserId: parsed.currentUserId || 'user-1',
            collapsedProjects: Array.isArray(parsed.collapsedProjects) ? parsed.collapsedProjects : []
          };
        }
      }
    } catch (e) {
      console.error('Ошибка чтения из localStorage, загрузка демо данных:', e);
    }

    return {
      users: INITIAL_USERS,
      projects: INITIAL_PROJECTS,
      cards: INITIAL_CARDS,
      moves: INITIAL_MOVES,
      comments: INITIAL_COMMENTS,
      currentUserId: 'user-1',
      collapsedProjects: []
    };
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Ошибка записи в localStorage:', e);
      showToast('Не удалось сохранить изменения в локальном хранилище', 'error');
    }
  }, [data]);

  const currentUser = useMemo(() => {
    if (!data.currentUserId) return null;
    return data.users.find(u => u.id === data.currentUserId) || null;
  }, [data.users, data.currentUserId]);

  const setCurrentUser = (userId: string | null) => {
    setData(prev => ({
      ...prev,
      currentUserId: userId
    }));
    if (userId) {
      const u = data.users.find(user => user.id === userId);
      if (u) {
        showToast(`Вы вошли как ${u.name} (${u.role === 'admin' ? 'Администратор' : u.role === 'assignee' ? 'Ответственный' : 'Наблюдатель'})`, 'info');
      }
    }
  };

  // Card move with strict permission check
  const moveCard = (cardId: string, targetStage: StageType): boolean => {
    const card = data.cards.find(c => c.id === cardId);
    if (!card) {
      showToast('Карточка не найдена', 'error');
      return false;
    }

    if (card.stage === targetStage) {
      return true;
    }

    const check = canMoveCard(currentUser, card);
    if (!check.allowed) {
      showToast(check.reason || 'Запрещено перемещать карточку', 'error');
      return false;
    }

    const now = new Date().toISOString();
    const newMove: Move = {
      id: `move-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      cardId: card.id,
      projectId: card.projectId,
      fromStage: card.stage,
      toStage: targetStage,
      movedAt: now,
      movedById: currentUser!.id
    };

    setData(prev => ({
      ...prev,
      cards: prev.cards.map(c =>
        c.id === cardId
          ? { ...c, stage: targetStage, stageSince: now }
          : c
      ),
      moves: [newMove, ...prev.moves]
    }));

    showToast(`Этап задачи «${card.taskType}» изменен на «${targetStage}»`, 'success');
    return true;
  };

  // Add comment with strict permission check
  const addComment = (cardId: string, text: string): boolean => {
    const card = data.cards.find(c => c.id === cardId);
    if (!card) {
      showToast('Карточка не найдена', 'error');
      return false;
    }

    const trimmed = text.trim();
    if (!trimmed) {
      showToast('Текст комментария не может быть пустым', 'error');
      return false;
    }

    const check = canAddComment(currentUser, card);
    if (!check.allowed) {
      showToast(check.reason || 'Запрещено добавлять комментарий', 'error');
      return false;
    }

    const newComment: Comment = {
      id: `com-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      cardId: card.id,
      authorId: currentUser!.id,
      text: trimmed,
      createdAt: new Date().toISOString()
    };

    setData(prev => ({
      ...prev,
      comments: [...prev.comments, newComment]
    }));

    showToast('Комментарий добавлен', 'success');
    return true;
  };

  // Delete comment with strict permission check
  const deleteComment = (commentId: string): boolean => {
    const comment = data.comments.find(c => c.id === commentId);
    if (!comment) {
      showToast('Комментарий не найден', 'error');
      return false;
    }

    const check = canDeleteComment(currentUser, comment);
    if (!check.allowed) {
      showToast(check.reason || 'Запрещено удалять комментарий', 'error');
      return false;
    }

    setData(prev => ({
      ...prev,
      comments: prev.comments.filter(c => c.id !== commentId)
    }));

    showToast('Комментарий удален', 'info');
    return true;
  };

  // Project management with strict permission check
  const createProject = (input: CreateProjectInput): boolean => {
    const check = canManageProjects(currentUser);
    if (!check.allowed) {
      showToast(check.reason || 'Только администратор может создавать проекты', 'error');
      return false;
    }

    if (!input.title.trim() || !input.client.trim() || !input.startDate || !input.targetEndDate) {
      showToast('Все поля проекта обязательны для заполнения', 'error');
      return false;
    }

    if (new Date(input.targetEndDate) < new Date(input.startDate)) {
      showToast('Желаемая дата завершения не может быть раньше даты старта', 'error');
      return false;
    }

    for (const task of TASK_TYPES) {
      if (!input.assignees[task]) {
        showToast(`Назначьте ответственного для этапа «${task}»`, 'error');
        return false;
      }
    }

    const now = new Date().toISOString();
    const projectId = `proj-${Date.now()}`;
    const newProject: Project = {
      id: projectId,
      title: input.title.trim(),
      client: input.client.trim(),
      startDate: input.startDate,
      targetEndDate: input.targetEndDate,
      isArchived: false,
      createdAt: now
    };

    const newCards: Card[] = TASK_TYPES.map((taskType, idx) => ({
      id: `card-${projectId}-${idx + 1}`,
      projectId,
      taskType,
      assigneeId: input.assignees[taskType],
      stage: 'Ожидает',
      stageSince: now
    }));

    const newMoves: Move[] = newCards.map((c, idx) => ({
      id: `move-${projectId}-${idx + 1}`,
      cardId: c.id,
      projectId,
      fromStage: 'Ожидает',
      toStage: 'Ожидает',
      movedAt: now,
      movedById: currentUser!.id
    }));

    setData(prev => ({
      ...prev,
      projects: [newProject, ...prev.projects],
      cards: [...prev.cards, ...newCards],
      moves: [...prev.moves, ...newMoves]
    }));

    showToast(`Проект «${newProject.title}» создан с 4 задачами в этапе «Ожидает»`, 'success');
    return true;
  };

  const updateProject = (projectId: string, input: CreateProjectInput): boolean => {
    const check = canManageProjects(currentUser);
    if (!check.allowed) {
      showToast(check.reason || 'Только администратор может изменять проекты', 'error');
      return false;
    }

    if (!input.title.trim() || !input.client.trim() || !input.startDate || !input.targetEndDate) {
      showToast('Все поля обязательны для заполнения', 'error');
      return false;
    }

    if (new Date(input.targetEndDate) < new Date(input.startDate)) {
      showToast('Дата завершения не может быть раньше даты старта', 'error');
      return false;
    }

    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p =>
        p.id === projectId
          ? {
              ...p,
              title: input.title.trim(),
              client: input.client.trim(),
              startDate: input.startDate,
              targetEndDate: input.targetEndDate
            }
          : p
      ),
      cards: prev.cards.map(c => {
        if (c.projectId === projectId && input.assignees[c.taskType]) {
          return {
            ...c,
            assigneeId: input.assignees[c.taskType]
          };
        }
        return c;
      })
    }));

    showToast(`Проект «${input.title}» обновлен`, 'success');
    return true;
  };

  const archiveProject = (projectId: string, archive: boolean): boolean => {
    const check = canManageProjects(currentUser);
    if (!check.allowed) {
      showToast(check.reason || 'Только администратор может архивировать проекты', 'error');
      return false;
    }

    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p =>
        p.id === projectId ? { ...p, isArchived: archive } : p
      )
    }));

    showToast(archive ? 'Проект отправлен в архив' : 'Проект восстановлен из архива', 'info');
    return true;
  };

  const toggleProjectCollapse = (projectId: string) => {
    setData(prev => {
      const exists = prev.collapsedProjects.includes(projectId);
      return {
        ...prev,
        collapsedProjects: exists
          ? prev.collapsedProjects.filter(id => id !== projectId)
          : [...prev.collapsedProjects, projectId]
      };
    });
  };

  // User management
  const createUser = (name: string, role: UserRole, title?: string): boolean => {
    const check = canManageUsers(currentUser);
    if (!check.allowed) {
      showToast(check.reason || 'Только администратор может добавлять пользователей', 'error');
      return false;
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      showToast('Имя пользователя обязательно', 'error');
      return false;
    }

    const color = DEFAULT_AVATARS[data.users.length % DEFAULT_AVATARS.length];
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: trimmedName,
      role,
      title: title?.trim() || undefined,
      avatarColor: color
    };

    setData(prev => ({
      ...prev,
      users: [...prev.users, newUser]
    }));

    showToast(`Пользователь «${trimmedName}» добавлен`, 'success');
    return true;
  };

  const updateUserRole = (userId: string, newRole: UserRole): boolean => {
    const target = data.users.find(u => u.id === userId);
    if (!target) return false;

    const check = canChangeUserRole(currentUser, target, newRole, data.users);
    if (!check.allowed) {
      showToast(check.reason || 'Запрещено изменять роль', 'error');
      return false;
    }

    setData(prev => ({
      ...prev,
      users: prev.users.map(u => (u.id === userId ? { ...u, role: newRole } : u))
    }));

    showToast(`Роль пользователя «${target.name}» изменена`, 'success');
    return true;
  };

  const deleteUser = (userId: string): boolean => {
    const target = data.users.find(u => u.id === userId);
    if (!target) return false;

    const check = canDeleteUser(currentUser, target, data.users, data.projects, data.cards);
    if (!check.allowed) {
      showToast(check.reason || 'Невозможно удалить пользователя', 'error');
      return false;
    }

    setData(prev => ({
      ...prev,
      users: prev.users.filter(u => u.id !== userId),
      currentUserId: prev.currentUserId === userId ? null : prev.currentUserId
    }));

    showToast(`Пользователь «${target.name}» удален`, 'info');
    return true;
  };

  const resetToDemo = () => {
    const fresh: StoredData = {
      users: INITIAL_USERS,
      projects: INITIAL_PROJECTS,
      cards: INITIAL_CARDS,
      moves: INITIAL_MOVES,
      comments: INITIAL_COMMENTS,
      currentUserId: 'user-1',
      collapsedProjects: []
    };
    setData(fresh);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    } catch (e) {
      console.error(e);
    }
    showToast('Демо-данные успешно сброшены к начальному состоянию', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        users: data.users,
        projects: data.projects,
        cards: data.cards,
        moves: data.moves,
        comments: data.comments,
        currentUser,
        collapsedProjects: data.collapsedProjects,
        toasts,
        showToast,
        dismissToast,
        setCurrentUser,
        moveCard,
        addComment,
        deleteComment,
        createProject,
        updateProject,
        archiveProject,
        toggleProjectCollapse,
        createUser,
        updateUserRole,
        deleteUser,
        resetToDemo
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
