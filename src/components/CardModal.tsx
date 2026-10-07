import React, { useState } from 'react';
import {
  X,
  Compass,
  ShoppingCart,
  Hammer,
  Wrench,
  Calendar,
  Clock,
  User as UserIcon,
  Send,
  Trash2,
  Lock,
  ArrowRight,
  History,
  MessageSquare
} from 'lucide-react';
import { Card, STAGE_CONFIGS, STAGE_TYPES, StageType, TaskType } from '../types';
import { useApp } from '../context/AppContext';
import { formatDate, formatDateTime } from '../utils/date';
import { canAddComment, canDeleteComment, canMoveCard, canViewComments } from '../utils/permissions';
import { ConfirmModal } from './ConfirmModal';

interface CardModalProps {
  card: Card | null;
  onClose: () => void;
}

export const CardModal: React.FC<CardModalProps> = ({ card, onClose }) => {
  const {
    projects,
    users,
    moves,
    comments,
    currentUser,
    moveCard,
    addComment,
    deleteComment
  } = useApp();

  const [newCommentText, setNewCommentText] = useState('');
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  if (!card) return null;

  const project = projects.find(p => p.id === card.projectId);
  const assignee = users.find(u => u.id === card.assigneeId);

  // Moves history for this specific card sorted newest first
  const cardMoves = moves
    .filter(m => m.cardId === card.id)
    .sort((a, b) => new Date(b.movedAt).getTime() - new Date(a.movedAt).getTime());

  // Comments for this card sorted newest first
  const cardComments = comments
    .filter(c => c.cardId === card.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Permissions checks
  const moveCheck = canMoveCard(currentUser, card);
  const addCommentCheck = canAddComment(currentUser, card);
  const viewCommentsCheck = canViewComments(currentUser, card);

  const getTaskIcon = (type: TaskType) => {
    switch (type) {
      case 'Проектирование':
        return <Compass className="w-5 h-5 text-blue-600" />;
      case 'Закупка материалов':
        return <ShoppingCart className="w-5 h-5 text-indigo-600" />;
      case 'Изготовление':
        return <Hammer className="w-5 h-5 text-amber-700" />;
      case 'Монтаж':
        return <Wrench className="w-5 h-5 text-teal-700" />;
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

  const handleStageSelect = (stage: StageType) => {
    if (stage === card.stage) return;
    moveCard(card.id, stage);
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    const ok = addComment(card.id, newCommentText);
    if (ok) {
      setNewCommentText('');
    }
  };

  const stageConfig = STAGE_CONFIGS[card.stage];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
        <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
          {/* Header */}
          <div className="bg-stone-50 border-b border-stone-200 p-5 sm:p-6 relative">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center justify-center shrink-0">
                  {getTaskIcon(card.taskType)}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Задача проекта
                    </span>
                    <span className="text-xs text-stone-500">
                      Проект: <strong className="text-stone-800">{project?.title || '—'}</strong>
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-stone-900 mt-1">
                    {card.taskType}
                  </h2>
                  <div className="text-xs text-stone-500 mt-0.5">
                    Клиент: {project?.client || '—'}
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="text-stone-400 hover:text-stone-700 p-1.5 rounded-xl hover:bg-stone-200/60 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick meta bar: Stage & Assignee */}
            <div className="mt-4 pt-4 border-t border-stone-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-stone-200">
                <div className="p-1.5 rounded-lg bg-stone-100 text-stone-500">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] text-stone-400 uppercase font-semibold">Ответственный</div>
                  <div className="font-bold text-stone-900 truncate">
                    {assignee?.name || 'Не назначен'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-stone-200">
                <div className="p-1.5 rounded-lg bg-stone-100 text-stone-500">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] text-stone-400 uppercase font-semibold">
                    Текущий этап (с {formatDate(card.stageSince)})
                  </div>
                  <div className="flex items-center gap-1.5 font-bold">
                    <span
                      className={`inline-block w-2 h-2 rounded-full`}
                      style={{ backgroundColor: stageConfig.accentColor }}
                    />
                    <span className="text-stone-900">{card.stage}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-white">
            {/* Stage Transition Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Этап задачи:
                </label>
                {!moveCheck.allowed && (
                  <span className="text-xs text-stone-500 flex items-center gap-1 font-medium">
                    <Lock className="w-3 h-3 text-stone-400" />
                    Только просмотр
                  </span>
                )}
              </div>

              {moveCheck.allowed ? (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {STAGE_TYPES.map(stage => {
                    const isCurrent = card.stage === stage;
                    const cfg = STAGE_CONFIGS[stage];

                    return (
                      <button
                        key={stage}
                        type="button"
                        disabled={isCurrent}
                        onClick={() => handleStageSelect(stage)}
                        className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all text-center flex flex-col items-center justify-center gap-1 ${
                          isCurrent
                            ? `${cfg.badgeBg} ${cfg.badgeText} ${cfg.badgeBorder} ring-2 ring-emerald-600/30 font-bold shadow-xs cursor-default`
                            : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-700 hover:border-emerald-500 active:scale-95'
                        }`}
                      >
                        <span>{stage}</span>
                        {isCurrent && (
                          <span className="text-[10px] text-emerald-800 font-bold">Текущий</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-stone-400 shrink-0" />
                    <span className="text-stone-600">
                      {currentUser?.role === 'viewer'
                        ? 'В режиме Наблюдателя перемещение задач отключено.'
                        : `Перемещение закреплено за ответственным: ${assignee?.name || 'не назначен'}.`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-stone-400 text-[11px]">Текущий статус:</span>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${stageConfig.badgeBg} ${stageConfig.badgeText} border ${stageConfig.badgeBorder}`}>
                      {card.stage}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Move History Section */}
            <div className="space-y-3 pt-2 border-t border-stone-100">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-800" />
                <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  История переносов ({cardMoves.length})
                </h3>
              </div>

              {cardMoves.length === 0 ? (
                <div className="text-xs text-stone-400 py-2 italic">История переносов пуста</div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {cardMoves.map(move => {
                    const author = users.find(u => u.id === move.movedById);
                    return (
                      <div
                        key={move.id}
                        className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={`w-6 h-6 rounded-md text-white font-bold text-[10px] flex items-center justify-center shrink-0 ${
                              author?.avatarColor || 'bg-stone-500'
                            }`}
                          >
                            {getInitials(author?.name)}
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-stone-800 truncate">
                              {author?.name || 'Пользователь'}
                            </span>
                            <div className="flex items-center gap-1.5 text-stone-600 font-medium mt-0.5">
                              <span className="text-stone-500">{move.fromStage}</span>
                              <ArrowRight className="w-3 h-3 text-stone-400" />
                              <span className="text-emerald-800 font-bold">{move.toStage}</span>
                            </div>
                          </div>
                        </div>

                        <span className="text-[11px] text-stone-400 shrink-0 font-medium">
                          {formatDateTime(move.movedAt)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Comments Section */}
            <div className="space-y-3 pt-2 border-t border-stone-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-800" />
                <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Комментарии {viewCommentsCheck.allowed && `(${cardComments.length})`}
                </h3>
              </div>

              {viewCommentsCheck.allowed ? (
                <>
                  {/* Add comment form */}
                  {addCommentCheck.allowed && (
                    <form onSubmit={handleSendComment} className="space-y-2">
                      <div className="relative">
                        <textarea
                          value={newCommentText}
                          onChange={e => setNewCommentText(e.target.value)}
                          placeholder="Напишите комментарий по задаче..."
                          rows={2}
                          className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 resize-none transition"
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={!newCommentText.trim()}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white text-xs font-semibold rounded-xl shadow-xs transition"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Отправить
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Comments list */}
                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {cardComments.length === 0 ? (
                      <div className="text-xs text-stone-400 py-2 italic">Комментариев пока нет</div>
                    ) : (
                      cardComments.map(comment => {
                        const author = users.find(u => u.id === comment.authorId);
                        const delCheck = canDeleteComment(currentUser, comment);

                        return (
                          <div
                            key={comment.id}
                            className="p-3 rounded-xl bg-stone-50 border border-stone-200/90 text-xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-5 h-5 rounded-md text-white font-bold text-[9px] flex items-center justify-center shrink-0 ${
                                    author?.avatarColor || 'bg-stone-500'
                                  }`}
                                >
                                  {getInitials(author?.name)}
                                </div>
                                <span className="font-bold text-stone-900">{author?.name}</span>
                                <span className="text-[10px] text-stone-400">
                                  {formatDateTime(comment.createdAt)}
                                </span>
                              </div>

                              {delCheck.allowed && (
                                <button
                                  type="button"
                                  onClick={() => setCommentToDelete(comment.id)}
                                  title="Удалить комментарий"
                                  className="text-stone-400 hover:text-rose-600 p-1 rounded transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            <p className="text-stone-700 leading-relaxed pl-7">
                              {comment.text}
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              ) : (
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-600 flex items-start gap-3">
                  <div className="p-2 bg-stone-200/70 rounded-xl text-stone-500 shrink-0">
                    <Lock className="w-4 h-4 text-stone-500" />
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-stone-800">
                      Разграничение ролей: рабочие комментарии скрыты
                    </div>
                    <p className="text-stone-500 leading-relaxed">
                      Внутренние рабочие комментарии и обсуждение этой задачи доступны исключительно назначенному ответственному (<strong className="text-stone-700">{assignee?.name}</strong>) и Администратору мастерской.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-stone-50 px-6 py-3.5 border-t border-stone-200 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-200 hover:bg-stone-300 text-stone-800 transition"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>

      {/* Delete Comment Confirm Dialog */}
      <ConfirmModal
        isOpen={Boolean(commentToDelete)}
        title="Удалить комментарий?"
        message="Вы действительно хотите удалить этот комментарий? Действие необратимо."
        confirmLabel="Удалить"
        cancelLabel="Отмена"
        isDestructive={true}
        onConfirm={() => {
          if (commentToDelete) {
            deleteComment(commentToDelete);
            setCommentToDelete(null);
          }
        }}
        onClose={() => setCommentToDelete(null)}
      />
    </>
  );
};
