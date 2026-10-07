import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Clock,
  CheckCircle,
  MoreVertical,
  Edit2,
  Archive,
  Calendar,
  Building
} from 'lucide-react';
import { Card, Project, STAGE_CONFIGS, STAGE_TYPES, StageType } from '../types';
import { useApp } from '../context/AppContext';
import { formatDate, getProjectDeadlineStatus } from '../utils/date';
import { TaskCard } from './TaskCard';

interface ProjectRowProps {
  project: Project;
  cards: Card[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenCardModal: (card: Card) => void;
  onEditProject: (project: Project) => void;
  onArchiveProject: (project: Project) => void;
}

export const ProjectRow: React.FC<ProjectRowProps> = ({
  project,
  cards,
  isCollapsed,
  onToggleCollapse,
  onOpenCardModal,
  onEditProject,
  onArchiveProject
}) => {
  const { currentUser, moveCard, showToast } = useApp();
  const [activeDropStage, setActiveDropStage] = useState<StageType | null>(null);
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  // Status calculation
  const deadlineInfo = getProjectDeadlineStatus(project, cards);
  const completedTasksCount = cards.filter(c => c.stage === 'Готово').length;
  const isOverdue = deadlineInfo.status === 'overdue';
  const isUrgent = deadlineInfo.status === 'urgent';
  const isCompleted = deadlineInfo.status === 'completed';

  // Drag and drop handlers for stage cells
  const handleDragOver = (e: React.DragEvent, stage: StageType) => {
    e.preventDefault();
    if (activeDropStage !== stage) {
      setActiveDropStage(stage);
    }
  };

  const handleDragLeave = (e: React.DragEvent, stage: StageType) => {
    e.preventDefault();
    if (activeDropStage === stage) {
      setActiveDropStage(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStage: StageType) => {
    e.preventDefault();
    setActiveDropStage(null);

    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (!dataStr) return;
      const data = JSON.parse(dataStr);

      if (data.projectId !== project.id) {
        showToast('Задачу можно перемещать только внутри своего проекта!', 'error');
        return;
      }

      moveCard(data.cardId, targetStage);
    } catch (err) {
      console.error('Ошибка обработки drop:', err);
    }
  };

  const getStatusBadge = () => {
    if (isCompleted) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle className="w-3 h-3 text-emerald-600" />
          Завершён
        </span>
      );
    }
    if (isOverdue) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
          <AlertTriangle className="w-3 h-3 text-rose-600" />
          Просрочен
        </span>
      );
    }
    if (isUrgent) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
          <Clock className="w-3 h-3 text-amber-700" />
          Срок близко
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
        В работе
      </span>
    );
  };

  return (
    <div
      className={`border-b transition-colors ${
        isOverdue
          ? 'border-rose-200 bg-rose-50/20'
          : 'border-stone-200 bg-white hover:bg-stone-50/40'
      }`}
    >
      <div className="flex flex-col lg:flex-row">
        {/* Left Column: Project Summary (Sticky or Fixed Width in Matrix) */}
        <div
          className={`w-full lg:w-[320px] lg:shrink-0 p-4 border-b lg:border-b-0 lg:border-r ${
            isOverdue
              ? 'border-l-4 border-l-rose-500 border-r-stone-200 bg-rose-50/30'
              : 'border-l-4 border-l-emerald-700 border-r-stone-200 bg-stone-50/60'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 min-w-0">
              <button
                type="button"
                onClick={onToggleCollapse}
                title={isCollapsed ? 'Развернуть проект' : 'Свернуть проект'}
                className="mt-0.5 p-1 rounded-md text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 transition shrink-0"
              >
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              <div className="min-w-0">
                <h3
                  onClick={onToggleCollapse}
                  className="font-bold text-sm text-stone-900 leading-snug cursor-pointer hover:text-emerald-900 break-words"
                >
                  {project.title}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-stone-600 mt-1">
                  <Building className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span className="truncate">{project.client}</span>
                </div>
              </div>
            </div>

            {/* Admin actions dropdown */}
            {currentUser?.role === 'admin' && (
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setIsActionsOpen(!isActionsOpen)}
                  className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {isActionsOpen && (
                  <div
                    className="absolute right-0 top-full mt-1 z-30 w-44 bg-white rounded-xl shadow-xl border border-stone-200 py-1 text-xs animate-in fade-in"
                    onClick={() => setIsActionsOpen(false)}
                  >
                    <button
                      onClick={() => onEditProject(project)}
                      className="w-full px-3 py-2 text-left flex items-center gap-2 text-stone-700 hover:bg-stone-100"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-stone-500" />
                      Редактировать
                    </button>
                    <button
                      onClick={() => onArchiveProject(project)}
                      className="w-full px-3 py-2 text-left flex items-center gap-2 text-rose-700 hover:bg-rose-50"
                    >
                      <Archive className="w-3.5 h-3.5 text-rose-500" />
                      В архив
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dates & Status */}
          <div className="mt-3 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-stone-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                Сроки:
              </span>
              <span className="font-medium text-stone-800">
                {formatDate(project.startDate)} — {formatDate(project.targetEndDate)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              {getStatusBadge()}

              {/* Progress counter: "Готово: X из 4 задач" */}
              <div className="flex items-center gap-1 text-[11px] font-semibold text-stone-600">
                <span>Готово:</span>
                <span className={completedTasksCount === 4 ? 'text-emerald-700 font-bold' : 'text-stone-800'}>
                  {completedTasksCount} из 4
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className={`h-full transition-all duration-300 ${
                  completedTasksCount === 4
                    ? 'bg-emerald-600'
                    : isOverdue
                    ? 'bg-rose-600'
                    : 'bg-emerald-700'
                }`}
                style={{ width: `${(completedTasksCount / 4) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right 5 Columns (Stage Matrix) */}
        {!isCollapsed ? (
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-stone-200/90">
            {STAGE_TYPES.map(stage => {
              const stageCards = cards.filter(c => c.stage === stage);
              const isHovered = activeDropStage === stage;
              const config = STAGE_CONFIGS[stage];

              return (
                <div
                  key={stage}
                  onDragOver={e => handleDragOver(e, stage)}
                  onDragLeave={e => handleDragLeave(e, stage)}
                  onDrop={e => handleDrop(e, stage)}
                  className={`p-2.5 min-h-[120px] flex flex-col gap-2 transition-all duration-150 ${
                    isHovered
                      ? `${config.dropZoneHover} ring-2 ring-inset bg-stone-100/70`
                      : 'hover:bg-stone-50/50'
                  }`}
                >
                  {/* Stage Label for Mobile (visible only on small screens) */}
                  <div className="flex lg:hidden items-center justify-between text-[11px] font-bold text-stone-500 pb-1 border-b border-stone-100">
                    <span>{stage}</span>
                    <span className="text-[10px] text-stone-400">
                      {stageCards.length > 0 ? `${stageCards.length} зад.` : 'пусто'}
                    </span>
                  </div>

                  {/* Cards inside this stage cell */}
                  {stageCards.length > 0 ? (
                    stageCards.map(card => (
                      <TaskCard
                        key={card.id}
                        card={card}
                        onOpenModal={onOpenCardModal}
                      />
                    ))
                  ) : (
                    <div className="flex-1 flex items-center justify-center border-2 border-dashed border-stone-200/60 rounded-xl min-h-[70px] text-[11px] text-stone-300 font-medium">
                      {isHovered ? 'Перенести сюда' : '—'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-between px-6 py-3 bg-stone-50/40 text-xs text-stone-500 italic">
            <span>Проект свёрнут ({completedTasksCount}/4 задач завершено)</span>
            <button
              onClick={onToggleCollapse}
              className="text-xs text-emerald-800 font-medium hover:underline not-italic"
            >
              Развернуть задачи
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
