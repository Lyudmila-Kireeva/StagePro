import React, { useState } from 'react';
import {
  Compass,
  ShoppingCart,
  Hammer,
  Wrench,
  MessageSquare,
  ArrowRightLeft,
  Check,
  Calendar,
  Lock,
  UserCheck
} from 'lucide-react';
import { Card, STAGE_TYPES, StageType, TaskType } from '../types';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/date';
import { canMoveCard, canViewComments } from '../utils/permissions';

interface TaskCardProps {
  card: Card;
  onOpenModal: (card: Card) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ card, onOpenModal }) => {
  const { users, comments, currentUser, moveCard } = useApp();
  const [isQuickMoveOpen, setIsQuickMoveOpen] = useState(false);

  const assignee = users.find(u => u.id === card.assigneeId);
  const cardComments = comments.filter(c => c.cardId === card.id);
  const isMyTask = currentUser?.id === card.assigneeId;
  const moveCheck = canMoveCard(currentUser, card);
  const viewCommentsCheck = canViewComments(currentUser, card);

  const getTaskIcon = (type: TaskType) => {
    switch (type) {
      case 'Проектирование':
        return <Compass className="w-3.5 h-3.5 text-blue-600" />;
      case 'Закупка материалов':
        return <ShoppingCart className="w-3.5 h-3.5 text-indigo-600" />;
      case 'Изготовление':
        return <Hammer className="w-3.5 h-3.5 text-amber-700" />;
      case 'Монтаж':
        return <Wrench className="w-3.5 h-3.5 text-teal-700" />;
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Drag handlers - only active if user has permissions
  const handleDragStart = (e: React.DragEvent) => {
    if (!moveCheck.allowed) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('application/json', JSON.stringify({
      cardId: card.id,
      projectId: card.projectId,
      assigneeId: card.assigneeId
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleQuickMove = (e: React.MouseEvent, targetStage: StageType) => {
    e.stopPropagation();
    setIsQuickMoveOpen(false);
    moveCard(card.id, targetStage);
  };

  return (
    <div className="relative group/card">
      {/* Date arrived at stage - shown small grey text over card title */}
      <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium mb-1 px-1">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-stone-400" />
          {formatDate(card.stageSince)}
        </span>

        {isMyTask ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200">
            <UserCheck className="w-3 h-3" />
            Моя задача
          </span>
        ) : (
          !moveCheck.allowed && (
            <span className="text-[10px] text-stone-400 font-medium">
              Только просмотр
            </span>
          )
        )}
      </div>

      {/* Card container: draggable only if user has move permission */}
      <div
        draggable={moveCheck.allowed}
        onDragStart={handleDragStart}
        onClick={() => onOpenModal(card)}
        className={`bg-white rounded-xl p-3 border shadow-xs transition-all duration-150 select-none hover:shadow-md ${
          isMyTask
            ? 'border-emerald-400 ring-2 ring-emerald-500/20 bg-emerald-50/20'
            : 'border-stone-200/90 hover:border-stone-400'
        } ${
          moveCheck.allowed
            ? 'cursor-grab active:cursor-grabbing hover:border-emerald-600/60'
            : 'cursor-pointer opacity-95'
        }`}
      >
        {/* Task Title & Icon */}
        <div className="flex items-start justify-between gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="p-1 rounded-md bg-stone-100 shrink-0">
              {getTaskIcon(card.taskType)}
            </span>
            <span className={`font-semibold text-xs leading-snug truncate ${isMyTask ? 'text-emerald-950 font-bold' : 'text-stone-900'}`}>
              {card.taskType}
            </span>
          </div>

          {!moveCheck.allowed && (
            <span
              title={moveCheck.reason || 'Перемещение доступно только ответственному'}
              className="text-stone-400 bg-stone-100 px-1 py-0.5 rounded text-[10px] flex items-center gap-0.5 shrink-0"
            >
              <Lock className="w-2.5 h-2.5" />
            </span>
          )}
        </div>

        {/* Card Footer: Assignee & Meta */}
        <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
          {/* Assignee */}
          <div className="flex items-center gap-1.5 min-w-0">
            <div
              className={`w-5 h-5 rounded-md text-white font-bold text-[10px] flex items-center justify-center shrink-0 ${
                assignee?.avatarColor || 'bg-stone-500'
              }`}
              title={`Ответственный: ${assignee?.name}`}
            >
              {getInitials(assignee?.name)}
            </div>
            <span className={`text-[11px] truncate font-medium max-w-[95px] ${isMyTask ? 'text-emerald-900 font-bold' : 'text-stone-600'}`}>
              {assignee?.name.split(' ')[0] || 'Не назначен'}
            </span>
          </div>

          {/* Right badges & quick actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Comments count: shown ONLY if user has permission to view internal comments */}
            {viewCommentsCheck.allowed ? (
              cardComments.length > 0 && (
                <span
                  title={`Комментариев по задаче: ${cardComments.length}`}
                  className="flex items-center gap-0.5 text-[11px] text-stone-600 font-semibold bg-stone-100 px-1.5 py-0.5 rounded-md"
                >
                  <MessageSquare className="w-3 h-3 text-stone-400" />
                  {cardComments.length}
                </span>
              )
            ) : (
              <span
                title="Рабочие комментарии скрыты согласно роли"
                className="text-stone-300 p-0.5"
              >
                <Lock className="w-3 h-3" />
              </span>
            )}

            {/* Quick move toggle: ONLY if allowed */}
            {moveCheck.allowed && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  setIsQuickMoveOpen(!isQuickMoveOpen);
                }}
                title="Быстро перенести на этап"
                className="p-1 rounded-md text-stone-400 hover:text-emerald-700 hover:bg-emerald-50 transition"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Move Popover Menu */}
      {isQuickMoveOpen && moveCheck.allowed && (
        <div
          className="absolute z-30 top-full left-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-stone-200 py-1.5 text-xs animate-in fade-in"
          onClick={e => e.stopPropagation()}
        >
          <div className="px-3 py-1 font-bold text-[10px] text-stone-400 uppercase tracking-wider border-b border-stone-100">
            Переместить на этап:
          </div>
          {STAGE_TYPES.map(stage => {
            const isCurrent = card.stage === stage;
            return (
              <button
                key={stage}
                onClick={e => handleQuickMove(e, stage)}
                disabled={isCurrent}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between transition ${
                  isCurrent
                    ? 'text-stone-400 bg-stone-50 cursor-default font-semibold'
                    : 'text-stone-700 hover:bg-emerald-50 hover:text-emerald-900 font-medium'
                }`}
              >
                <span>{stage}</span>
                {isCurrent && <Check className="w-3.5 h-3.5 text-emerald-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
