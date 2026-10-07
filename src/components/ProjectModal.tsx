import React, { useState, useEffect } from 'react';
import { X, Calendar, User as UserIcon, Building, FileText, AlertCircle } from 'lucide-react';
import { Project, TASK_TYPES, TaskType } from '../types';
import { useApp } from '../context/AppContext';

interface ProjectModalProps {
  isOpen: boolean;
  projectToEdit?: Project | null;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  projectToEdit,
  onClose
}) => {
  const { users, cards, createProject, updateProject, showToast } = useApp();

  const [title, setTitle] = useState('');
  const [client, setClient] = useState('');
  const [startDate, setStartDate] = useState('');
  const [targetEndDate, setTargetEndDate] = useState('');
  const [assignees, setAssignees] = useState<Record<TaskType, string>>({
    'Проектирование': '',
    'Закупка материалов': '',
    'Изготовление': '',
    'Монтаж': ''
  });
  const [error, setError] = useState<string | null>(null);

  // Eligible users: admin and assignee
  const eligibleAssignees = users.filter(u => u.role === 'admin' || u.role === 'assignee');

  useEffect(() => {
    if (projectToEdit) {
      setTitle(projectToEdit.title);
      setClient(projectToEdit.client);
      setStartDate(projectToEdit.startDate);
      setTargetEndDate(projectToEdit.targetEndDate);

      const projectCards = cards.filter(c => c.projectId === projectToEdit.id);
      const initialMap: Record<TaskType, string> = {
        'Проектирование': '',
        'Закупка материалов': '',
        'Изготовление': '',
        'Монтаж': ''
      };

      for (const t of TASK_TYPES) {
        const found = projectCards.find(c => c.taskType === t);
        if (found) {
          initialMap[t] = found.assigneeId;
        } else if (eligibleAssignees.length > 0) {
          initialMap[t] = eligibleAssignees[0].id;
        }
      }
      setAssignees(initialMap);
    } else {
      // Default to today and 30 days from today
      const today = new Date();
      const in30Days = new Date();
      in30Days.setDate(today.getDate() + 30);

      const todayStr = today.toISOString().split('T')[0];
      const in30DaysStr = in30Days.toISOString().split('T')[0];

      setTitle('');
      setClient('');
      setStartDate(todayStr);
      setTargetEndDate(in30DaysStr);

      // Smart default assignment matching known demo users
      const igor = users.find(u => u.name.includes('Игорь'))?.id || eligibleAssignees[0]?.id || '';
      const maria = users.find(u => u.name.includes('Мария'))?.id || eligibleAssignees[0]?.id || '';
      const dmitriy = users.find(u => u.name.includes('Дмитрий'))?.id || eligibleAssignees[0]?.id || '';
      const sergey = users.find(u => u.name.includes('Сергей'))?.id || eligibleAssignees[0]?.id || '';

      setAssignees({
        'Проектирование': igor,
        'Закупка материалов': maria,
        'Изготовление': dmitriy,
        'Монтаж': sergey
      });
    }
    setError(null);
  }, [isOpen, projectToEdit, users]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Укажите название проекта');
      return;
    }
    if (!client.trim()) {
      setError('Укажите клиента или заказчика');
      return;
    }
    if (!startDate) {
      setError('Укажите дату старта');
      return;
    }
    if (!targetEndDate) {
      setError('Укажите дату завершения');
      return;
    }
    if (new Date(targetEndDate) < new Date(startDate)) {
      setError('Желаемая дата завершения не может быть раньше даты старта');
      return;
    }

    for (const t of TASK_TYPES) {
      if (!assignees[t]) {
        setError(`Выберите ответственного для задачи «${t}»`);
        return;
      }
    }

    if (projectToEdit) {
      const ok = updateProject(projectToEdit.id, {
        title: title.trim(),
        client: client.trim(),
        startDate,
        targetEndDate,
        assignees
      });
      if (ok) onClose();
    } else {
      const ok = createProject({
        title: title.trim(),
        client: client.trim(),
        startDate,
        targetEndDate,
        assignees
      });
      if (ok) onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-stone-50 border-b border-stone-200 p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                {projectToEdit ? 'Редактирование проекта' : 'Новый проект мастерской'}
              </h2>
              <p className="text-xs text-stone-500">
                {projectToEdit
                  ? 'Изменение параметров проекта и назначенных ответственных'
                  : 'Будут созданы 4 задачи в начальном этапе «Ожидает»'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Project Title */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Название проекта <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Например: Гардеробная комната на Ленина"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 transition"
            />
          </div>

          {/* Client */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Клиент / Заказчик <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={client}
                onChange={e => setClient(e.target.value)}
                placeholder="Например: Семья Петровых / ООО «Крона»"
                className="w-full text-sm pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 transition"
              />
            </div>
          </div>

          {/* Dates grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Дата старта <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-stone-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full text-sm pl-10 pr-3 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Желаемое завершение <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-stone-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="date"
                  required
                  value={targetEndDate}
                  onChange={e => setTargetEndDate(e.target.value)}
                  className="w-full text-sm pl-10 pr-3 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 transition"
                />
              </div>
            </div>
          </div>

          {/* Assignees for the 4 tasks */}
          <div className="pt-3 border-t border-stone-200">
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
              Ответственные за этапы проекта (все 4 обязательны):
            </label>

            <div className="space-y-2.5 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
              {TASK_TYPES.map(task => (
                <div key={task} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-3">
                  <span className="text-xs font-semibold text-stone-800 min-w-[170px]">
                    {task}:
                  </span>
                  <div className="relative flex-1">
                    <UserIcon className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
                    <select
                      value={assignees[task]}
                      onChange={e =>
                        setAssignees(prev => ({ ...prev, [task]: e.target.value }))
                      }
                      className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700"
                    >
                      <option value="">-- Выберите ответственного --</option>
                      {eligibleAssignees.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role === 'admin' ? 'Администратор' : 'Ответственный'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit buttons */}
          <div className="pt-4 flex justify-end gap-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition"
            >
              {projectToEdit ? 'Сохранить изменения' : 'Создать проект'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
