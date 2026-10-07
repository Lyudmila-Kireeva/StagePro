import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  User,
  Plus,
  Layers,
  AlertTriangle,
  Clock,
  CheckCircle,
  FolderKanban,
  Check,
  RotateCcw
} from 'lucide-react';
import {
  Card,
  Project,
  STAGE_CONFIGS,
  STAGE_TYPES,
  StageType
} from '../types';
import { useApp } from '../context/AppContext';
import { getProjectDeadlineStatus } from '../utils/date';
import { ProjectRow } from './ProjectRow';

interface BoardProps {
  onOpenCardModal: (card: Card) => void;
  onOpenNewProject: () => void;
  onEditProject: (project: Project) => void;
  onArchiveProject: (project: Project) => void;
}

export const Board: React.FC<BoardProps> = ({
  onOpenCardModal,
  onOpenNewProject,
  onEditProject,
  onArchiveProject
}) => {
  const {
    projects,
    cards,
    users,
    currentUser,
    collapsedProjects,
    toggleProjectCollapse
  } = useApp();

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [onlyMyTasks, setOnlyMyTasks] = useState(false);

  // Active non-archived projects
  const activeProjects = useMemo(() => {
    return projects.filter(p => !p.isArchived);
  }, [projects]);

  // Overall Workshop Stats
  const stats = useMemo(() => {
    let overdueCount = 0;
    let urgentCount = 0;
    let completedCount = 0;
    let inProgressCount = 0;

    for (const p of activeProjects) {
      const pCards = cards.filter(c => c.projectId === p.id);
      const st = getProjectDeadlineStatus(p, pCards).status;
      if (st === 'overdue') overdueCount++;
      else if (st === 'urgent') urgentCount++;
      else if (st === 'completed') completedCount++;
      else inProgressCount++;
    }

    return {
      total: activeProjects.length,
      overdueCount,
      urgentCount,
      completedCount,
      inProgressCount
    };
  }, [activeProjects, cards]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return activeProjects.filter(p => {
      // 1. Search Query filter (title or client)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchClient = p.client.toLowerCase().includes(q);
        if (!matchTitle && !matchClient) return false;
      }

      const pCards = cards.filter(c => c.projectId === p.id);

      // 2. "Only my tasks" filter
      if (onlyMyTasks && currentUser) {
        const hasMyTask = pCards.some(c => c.assigneeId === currentUser.id);
        if (!hasMyTask) return false;
      }

      // 3. Assignee filter
      if (selectedAssigneeId !== 'all') {
        const hasSelectedAssignee = pCards.some(c => c.assigneeId === selectedAssigneeId);
        if (!hasSelectedAssignee) return false;
      }

      // 4. Stage filter
      if (selectedStage !== 'all') {
        const hasCardInStage = pCards.some(c => c.stage === selectedStage);
        if (!hasCardInStage) return false;
      }

      return true;
    });
  }, [activeProjects, cards, searchQuery, onlyMyTasks, currentUser, selectedAssigneeId, selectedStage]);

  // Count workshop cards in each stage
  const stageTaskCounts = useMemo(() => {
    const counts: Record<StageType, number> = {
      'Ожидает': 0,
      'В работе': 0,
      'На проверке': 0,
      'Доработка': 0,
      'Готово': 0
    };
    const activeProjectIds = new Set(activeProjects.map(p => p.id));
    for (const c of cards) {
      if (activeProjectIds.has(c.projectId)) {
        counts[c.stage] = (counts[c.stage] || 0) + 1;
      }
    }
    return counts;
  }, [activeProjects, cards]);

  const myTasksCount = useMemo(() => {
    if (!currentUser) return 0;
    const activeIds = new Set(activeProjects.map(p => p.id));
    return cards.filter(c => activeIds.has(c.projectId) && c.assigneeId === currentUser.id).length;
  }, [activeProjects, cards, currentUser]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedAssigneeId !== 'all' ||
    selectedStage !== 'all' ||
    onlyMyTasks;

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedAssigneeId('all');
    setSelectedStage('all');
    setOnlyMyTasks(false);
  };

  return (
    <div className="space-y-5">
      {/* Role Scope & Boundary Banner */}
      {currentUser && (
        <div
          className={`p-4 rounded-2xl border transition-all ${
            currentUser.role === 'admin'
              ? 'bg-emerald-950/5 border-emerald-800/20 text-emerald-950'
              : currentUser.role === 'assignee'
              ? 'bg-blue-50/70 border-blue-200 text-blue-950'
              : 'bg-stone-100 border-stone-200 text-stone-800'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs ${currentUser.avatarColor}`}
              >
                {currentUser.name
                  .split(' ')
                  .map(p => p[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-stone-900">
                    {currentUser.name}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                      currentUser.role === 'admin'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : currentUser.role === 'assignee'
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : 'bg-stone-200 text-stone-700 border-stone-300'
                    }`}
                  >
                    {currentUser.role === 'admin'
                      ? 'Администратор'
                      : currentUser.role === 'assignee'
                      ? 'Ответственный сотрудник'
                      : 'Наблюдатель (Только чтение)'}
                  </span>
                  {currentUser.title && (
                    <span className="text-xs text-stone-500 font-medium">
                      • {currentUser.title}
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  {currentUser.role === 'admin' && (
                    <>
                      <strong>Полные права доступа:</strong> создание и редактирование проектов, свободное перемещение любых задач, назначение сотрудников, удаление и чтение всех комментариев.
                    </>
                  )}
                  {currentUser.role === 'assignee' && (
                    <>
                      <strong>Разграничение ролей:</strong> вы можете перемещать и оставлять рабочие комментарии только по закреплённым за вами задачам (<span className="font-bold text-blue-900">{myTasksCount} активных задач</span>). В остальных задачах чужих этапов вам доступен только просмотр статуса.
                    </>
                  )}
                  {currentUser.role === 'viewer' && (
                    <>
                      <strong>Режим наблюдения:</strong> доступен только общий мониторинг этапов и сроков. Перемещение карточек, изменение этапов и внутренние комментарии ответственных скрыты и отключены.
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Quick Scope switch for assignee */}
            {currentUser.role === 'assignee' && (
              <div className="flex items-center gap-1.5 shrink-0 bg-white p-1 rounded-xl border border-blue-200 shadow-2xs self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setOnlyMyTasks(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    onlyMyTasks
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  Мои задачи ({myTasksCount})
                </button>
                <button
                  type="button"
                  onClick={() => setOnlyMyTasks(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    !onlyMyTasks
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  Все проекты
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Workshop Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Active */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center shrink-0">
            <FolderKanban className="w-5 h-5 text-stone-600" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              Всего проектов
            </div>
            <div className="text-xl font-black text-stone-900">{stats.total}</div>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              В производстве
            </div>
            <div className="text-xl font-black text-blue-900">{stats.inProgressCount}</div>
          </div>
        </div>

        {/* Overdue / Urgent */}
        <div
          className={`bg-white rounded-2xl p-4 border shadow-xs flex items-center gap-3 ${
            stats.overdueCount > 0 ? 'border-rose-300 bg-rose-50/20' : 'border-stone-200'
          }`}
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              stats.overdueCount > 0
                ? 'bg-rose-100 text-rose-700'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              {stats.overdueCount > 0 ? 'Просрочено' : 'Срок близко'}
            </div>
            <div
              className={`text-xl font-black ${
                stats.overdueCount > 0 ? 'text-rose-700' : 'text-stone-900'
              }`}
            >
              {stats.overdueCount > 0 ? stats.overdueCount : stats.urgentCount}
            </div>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              Завершено
            </div>
            <div className="text-xl font-black text-emerald-900">{stats.completedCount}</div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search by project title / client */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Поиск по названию проекта или клиенту..."
              className="w-full text-xs sm:text-sm pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 transition"
            />
          </div>

          {/* "+ Новый проект" button (Admin only) */}
          {currentUser?.role === 'admin' && (
            <button
              onClick={onOpenNewProject}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition shrink-0"
            >
              <Plus className="w-4 h-4" />
              Новый проект
            </button>
          )}
        </div>

        {/* Filter selects & "Only my tasks" toggle */}
        <div className="flex items-center flex-wrap gap-2.5 pt-2 border-t border-stone-100 text-xs">
          {/* Assignee select */}
          <div className="flex items-center gap-1.5 bg-stone-50 px-2.5 py-1.5 rounded-xl border border-stone-200">
            <User className="w-3.5 h-3.5 text-stone-500 shrink-0" />
            <select
              value={selectedAssigneeId}
              onChange={e => setSelectedAssigneeId(e.target.value)}
              className="bg-transparent text-stone-700 font-medium focus:outline-hidden cursor-pointer"
            >
              <option value="all">Все ответственные</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stage select */}
          <div className="flex items-center gap-1.5 bg-stone-50 px-2.5 py-1.5 rounded-xl border border-stone-200">
            <Filter className="w-3.5 h-3.5 text-stone-500 shrink-0" />
            <select
              value={selectedStage}
              onChange={e => setSelectedStage(e.target.value)}
              className="bg-transparent text-stone-700 font-medium focus:outline-hidden cursor-pointer"
            >
              <option value="all">Все этапы</option>
              {STAGE_TYPES.map(stage => (
                <option key={stage} value={stage}>
                  Этап: {stage}
                </option>
              ))}
            </select>
          </div>

          {/* "Только мои задачи" Toggle */}
          {currentUser && (
            <button
              type="button"
              onClick={() => setOnlyMyTasks(!onlyMyTasks)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-semibold transition select-none ${
                onlyMyTasks
                  ? 'bg-emerald-100/80 border-emerald-300 text-emerald-900 shadow-xs'
                  : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                  onlyMyTasks
                    ? 'bg-emerald-700 border-emerald-700 text-white'
                    : 'border-stone-400 bg-white'
                }`}
              >
                {onlyMyTasks && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <span>Только мои задачи</span>
            </button>
          )}

          {/* Reset Filters button if any active */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Сбросить фильтры
            </button>
          )}

          <div className="ml-auto text-[11px] text-stone-400 font-medium">
            Показано проектов: {filteredProjects.length} из {activeProjects.length}
          </div>
        </div>
      </div>

      {/* Matrix Board */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {/* Matrix Header */}
        <div className="hidden lg:flex border-b border-stone-300 bg-stone-100/80">
          {/* Project column title */}
          <div className="w-[320px] shrink-0 p-3.5 border-r border-stone-200/90 text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center justify-between">
            <span>Проект и сроки</span>
            <span className="text-[10px] font-semibold text-stone-400 lowercase">
              (строка = проект)
            </span>
          </div>

          {/* 5 Stage Column Titles */}
          <div className="flex-1 grid grid-cols-5 divide-x divide-stone-200/90">
            {STAGE_TYPES.map(stage => {
              const cfg = STAGE_CONFIGS[stage];
              const count = stageTaskCounts[stage] || 0;

              return (
                <div
                  key={stage}
                  className={`p-3 text-xs font-bold flex items-center justify-between ${cfg.columnHeaderBg}`}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: cfg.accentColor }}
                    />
                    <span className="text-stone-800">{stage}</span>
                  </div>

                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${cfg.badgeBg} ${cfg.badgeText} border ${cfg.badgeBorder}`}
                  >
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Project Rows */}
        {filteredProjects.length === 0 ? (
          <div className="p-12 text-center text-stone-400 italic space-y-2">
            <p className="text-sm">Нет проектов, соответствующих заданным фильтрам</p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs font-semibold text-emerald-800 hover:underline not-italic"
              >
                Сбросить фильтры
              </button>
            )}
          </div>
        ) : (
          filteredProjects.map(project => {
            const projectCards = cards.filter(c => c.projectId === project.id);
            const isCollapsed = collapsedProjects.includes(project.id);

            return (
              <ProjectRow
                key={project.id}
                project={project}
                cards={projectCards}
                isCollapsed={isCollapsed}
                onToggleCollapse={() => toggleProjectCollapse(project.id)}
                onOpenCardModal={onOpenCardModal}
                onEditProject={onEditProject}
                onArchiveProject={onArchiveProject}
              />
            );
          })
        )}
      </div>

      {/* Footer hint */}
      <div className="text-xs text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-2 px-2">
        <span>
          💡 <strong>Подсказка:</strong> Перетаскивайте карточки между колонками внутри строки проекта мышью или нажимайте на задачу для детального просмотра и комментирования.
        </span>
        <span className="text-[11px] text-stone-400 shrink-0">
          Данные сохраняются автоматически в браузере
        </span>
      </div>
    </div>
  );
};
