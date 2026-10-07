import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  UserCheck,
  Eye,
  Trash2,
  AlertTriangle,
  Briefcase,
  X
} from 'lucide-react';
import { User, UserRole } from '../types';
import { useApp } from '../context/AppContext';
import { ConfirmModal } from './ConfirmModal';

export const UsersList: React.FC = () => {
  const {
    users,
    projects,
    cards,
    currentUser,
    createUser,
    updateUserRole,
    deleteUser
  } = useApp();

  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('assignee');
  const [newUserTitle, setNewUserTitle] = useState('');

  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  if (currentUser?.role !== 'admin') {
    return (
      <div className="bg-white rounded-2xl p-8 border border-stone-200 text-center space-y-3">
        <ShieldCheck className="w-10 h-10 text-stone-300 mx-auto" />
        <h3 className="text-base font-bold text-stone-800">Доступ ограничен</h3>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          Раздел управления сотрудниками доступен только пользователям с ролью Администратор.
        </p>
      </div>
    );
  }

  // Calculate active assigned tasks count for each user
  const activeProjectIds = new Set(projects.filter(p => !p.isArchived).map(p => p.id));
  const getUserActiveTasksCount = (userId: string) => {
    return cards.filter(c => activeProjectIds.has(c.projectId) && c.assigneeId === userId).length;
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;

    const ok = createUser(newUserName.trim(), newUserRole, newUserTitle.trim());
    if (ok) {
      setNewUserName('');
      setNewUserTitle('');
      setNewUserRole('assignee');
      setIsAddUserOpen(false);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            Администратор
          </span>
        );
      case 'assignee':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <UserCheck className="w-3.5 h-3.5" />
            Ответственный
          </span>
        );
      case 'viewer':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200">
            <Eye className="w-3.5 h-3.5" />
            Наблюдатель
          </span>
        );
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-800" />
            Сотрудники мастерской ({users.length})
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Управление ролями и доступом к производственной канбан-доске
          </p>
        </div>

        <button
          onClick={() => setIsAddUserOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-xs transition"
        >
          <UserPlus className="w-4 h-4" />
          Добавить сотрудника
        </button>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 sm:px-6">Сотрудник</th>
                <th className="py-3.5 px-4">Должность / Специализация</th>
                <th className="py-3.5 px-4">Текущая роль</th>
                <th className="py-3.5 px-4">Задач в активных проектах</th>
                <th className="py-3.5 px-4">Смена роли</th>
                <th className="py-3.5 px-4 text-right">Удаление</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {users.map(u => {
                const activeTasksCount = getUserActiveTasksCount(u.id);
                const isCurrentUser = currentUser?.id === u.id;

                return (
                  <tr key={u.id} className="hover:bg-stone-50/70 transition-colors">
                    {/* User name & avatar */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs ${u.avatarColor}`}
                        >
                          {getInitials(u.name)}
                        </div>
                        <div>
                          <div className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {isCurrentUser && (
                              <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded font-semibold">
                                Вы
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Title */}
                    <td className="py-4 px-4 text-stone-600">
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-stone-400" />
                        <span>{u.title || 'Специалист мастерской'}</span>
                      </div>
                    </td>

                    {/* Current role badge */}
                    <td className="py-4 px-4">{getRoleBadge(u.role)}</td>

                    {/* Active tasks count */}
                    <td className="py-4 px-4">
                      <span
                        className={`font-semibold px-2 py-0.5 rounded-md text-xs ${
                          activeTasksCount > 0
                            ? 'bg-stone-100 text-stone-800'
                            : 'text-stone-400'
                        }`}
                      >
                        {activeTasksCount} {activeTasksCount === 1 ? 'задача' : 'задач'}
                      </span>
                    </td>

                    {/* Role changer dropdown */}
                    <td className="py-4 px-4">
                      <select
                        value={u.role}
                        onChange={e => updateUserRole(u.id, e.target.value as UserRole)}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-700/30"
                      >
                        <option value="admin">Администратор</option>
                        <option value="assignee">Ответственный</option>
                        <option value="viewer">Наблюдатель</option>
                      </select>
                    </td>

                    {/* Delete button */}
                    <td className="py-4 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setUserToDelete(u)}
                        disabled={isCurrentUser}
                        title={
                          isCurrentUser
                            ? 'Нельзя удалить собственный профиль'
                            : 'Удалить сотрудника'
                        }
                        className={`p-1.5 rounded-lg transition ${
                          isCurrentUser
                            ? 'text-stone-300 cursor-not-allowed'
                            : 'text-stone-400 hover:text-rose-600 hover:bg-rose-50'
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden">
            <div className="bg-stone-50 border-b border-stone-200 p-5 flex items-center justify-between">
              <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-800" />
                Новый сотрудник
              </h3>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  ФИО сотрудника <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  placeholder="Например: Роман Васильев"
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-700/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Должность / Специализация
                </label>
                <input
                  type="text"
                  value={newUserTitle}
                  onChange={e => setNewUserTitle(e.target.value)}
                  placeholder="Например: Столяр-краснодеревщик"
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-700/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Роль в системе <span className="text-rose-600">*</span>
                </label>
                <select
                  value={newUserRole}
                  onChange={e => setNewUserRole(e.target.value as UserRole)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-700/30"
                >
                  <option value="assignee">Ответственный (двигает свои задачи)</option>
                  <option value="viewer">Наблюдатель (только просмотр)</option>
                  <option value="admin">Администратор (полные права)</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition"
                >
                  Добавить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirm */}
      <ConfirmModal
        isOpen={Boolean(userToDelete)}
        title="Удалить пользователя?"
        message={`Вы действительно хотите удалить сотрудника «${userToDelete?.name}»? Проверка прав убедится, что за ним не закреплены активные задачи мастерской.`}
        confirmLabel="Удалить"
        cancelLabel="Отмена"
        isDestructive={true}
        onConfirm={() => {
          if (userToDelete) {
            deleteUser(userToDelete.id);
            setUserToDelete(null);
          }
        }}
        onClose={() => setUserToDelete(null)}
      />
    </div>
  );
};
