import React, { useState } from 'react';
import {
  FolderKanban,
  Search,
  Archive,
  RotateCcw,
  Edit2,
  Calendar,
  Building,
  CheckCircle,
  AlertTriangle,
  Clock,
  Plus,
  Layers
} from 'lucide-react';
import { Project, STAGE_CONFIGS } from '../types';
import { useApp } from '../context/AppContext';
import { formatDate, getProjectDeadlineStatus } from '../utils/date';
import { ConfirmModal } from './ConfirmModal';

interface ProjectsListProps {
  onEditProject: (project: Project) => void;
  onOpenNewProject: () => void;
}

export const ProjectsList: React.FC<ProjectsListProps> = ({
  onEditProject,
  onOpenNewProject
}) => {
  const {
    projects,
    cards,
    currentUser,
    archiveProject
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [projectToArchive, setProjectToArchive] = useState<Project | null>(null);

  // Filter projects
  const filteredProjects = projects.filter(p => {
    // Archive filter
    if (showArchived) {
      if (!p.isArchived) return false;
    } else {
      if (p.isArchived) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchClient = p.client.toLowerCase().includes(q);
      if (!matchTitle && !matchClient) return false;
    }

    return true;
  });

  const getStatusBadge = (project: Project) => {
    const info = getProjectDeadlineStatus(project, cards);
    if (project.isArchived) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-200 text-stone-700">
          <Archive className="w-3 h-3 text-stone-500" />
          В архиве
        </span>
      );
    }
    if (info.status === 'completed') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle className="w-3 h-3 text-emerald-600" />
          Завершён
        </span>
      );
    }
    if (info.status === 'overdue') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
          <AlertTriangle className="w-3 h-3 text-rose-600" />
          Просрочен
        </span>
      );
    }
    if (info.status === 'urgent') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
          <Clock className="w-3 h-3 text-amber-700" />
          Срок близко
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
        В работе
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top action & filter bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Поиск по названию или клиенту..."
            className="w-full text-xs sm:text-sm pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 transition"
          />
        </div>

        {/* Right toggles & actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200/80 px-3 py-2 rounded-xl border border-stone-200/80 transition">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={e => setShowArchived(e.target.checked)}
              className="rounded text-emerald-700 focus:ring-emerald-600 w-4 h-4"
            />
            <span>Показать архив ({projects.filter(p => p.isArchived).length})</span>
          </label>

          {currentUser?.role === 'admin' && (
            <button
              onClick={onOpenNewProject}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              Новый проект
            </button>
          )}
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 sm:px-6">Проект</th>
                <th className="py-3.5 px-4">Клиент</th>
                <th className="py-3.5 px-4">Сроки</th>
                <th className="py-3.5 px-4">Задачи по этапам</th>
                <th className="py-3.5 px-4">Статус</th>
                <th className="py-3.5 px-4 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400 italic">
                    {showArchived
                      ? 'В архиве нет проектов'
                      : searchQuery
                      ? 'Ничего не найдено по вашему запросу'
                      : 'Проекты отсутствуют'}
                  </td>
                </tr>
              ) : (
                filteredProjects.map(project => {
                  const pCards = cards.filter(c => c.projectId === project.id);
                  const completedCount = pCards.filter(c => c.stage === 'Готово').length;

                  return (
                    <tr
                      key={project.id}
                      className="hover:bg-stone-50/80 transition-colors"
                    >
                      {/* Title */}
                      <td className="py-4 px-4 sm:px-6 font-bold text-stone-900 text-sm">
                        <div className="flex items-center gap-2">
                          <FolderKanban className="w-4 h-4 text-emerald-800 shrink-0" />
                          <span>{project.title}</span>
                        </div>
                      </td>

                      {/* Client */}
                      <td className="py-4 px-4 text-stone-700 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-stone-400" />
                          <span>{project.client}</span>
                        </div>
                      </td>

                      {/* Dates */}
                      <td className="py-4 px-4 text-stone-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-stone-400" />
                          <span>
                            {formatDate(project.startDate)} — {formatDate(project.targetEndDate)}
                          </span>
                        </div>
                      </td>

                      {/* Tasks breakdown pill */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {pCards.map(c => {
                              const cfg = STAGE_CONFIGS[c.stage];
                              const isMyCard = c.assigneeId === currentUser?.id;
                              return (
                                <span
                                  key={c.id}
                                  title={`${c.taskType}: ${c.stage}${isMyCard ? ' (Ваша задача)' : ''}`}
                                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold border ${
                                    isMyCard ? 'ring-2 ring-emerald-600 scale-110 shadow-xs' : 'opacity-85'
                                  }`}
                                  style={{
                                    backgroundColor: cfg.accentColor,
                                    color: '#ffffff'
                                  }}
                                >
                                  {c.taskType[0]}
                                </span>
                              );
                            })}
                          </div>
                          <span className="text-[11px] font-semibold text-stone-600">
                            {completedCount}/4 готово
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">{getStatusBadge(project)}</td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        {currentUser?.role === 'admin' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => onEditProject(project)}
                              title="Редактировать проект"
                              className="p-1.5 rounded-lg text-stone-500 hover:text-emerald-800 hover:bg-stone-100 transition"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {project.isArchived ? (
                              <button
                                type="button"
                                onClick={() => archiveProject(project.id, false)}
                                title="Восстановить из архива"
                                className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 transition"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setProjectToArchive(project)}
                                title="Архивировать проект"
                                className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
                              >
                                <Archive className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ) : currentUser?.role === 'assignee' ? (
                          <span className="text-[11px] text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md font-semibold">
                            Управление на доске
                          </span>
                        ) : (
                          <span className="text-stone-400 text-xs">Только просмотр</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Archive confirmation dialog */}
      <ConfirmModal
        isOpen={Boolean(projectToArchive)}
        title="Архивировать проект?"
        message={`Проект «${projectToArchive?.title}» будет перемещен в архив. Вы сможете просмотреть и восстановить его в любой момент через переключатель «Показать архив».`}
        confirmLabel="Архивировать"
        cancelLabel="Отмена"
        isDestructive={false}
        onConfirm={() => {
          if (projectToArchive) {
            archiveProject(projectToArchive.id, true);
            setProjectToArchive(null);
          }
        }}
        onClose={() => setProjectToArchive(null)}
      />
    </div>
  );
};
