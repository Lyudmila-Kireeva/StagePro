import React from 'react';
import { ShieldCheck, UserCheck, Eye, Sparkles, X, Trees } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { User, UserRole } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  isStandalone?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  isStandalone = false
}) => {
  const { users, currentUser, setCurrentUser } = useApp();

  if (!isOpen) return null;

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

  const handleSelectUser = (user: User) => {
    setCurrentUser(user.id);
    if (onClose) onClose();
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
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isStandalone ? 'bg-stone-900/80 backdrop-blur-sm' : 'bg-stone-900/60 backdrop-blur-xs'}`}>
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-emerald-950 text-white p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-800/80 border border-emerald-600/40 flex items-center justify-center shadow-inner">
                <Trees className="w-7 h-7 text-emerald-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight text-white">Вход в «ЭтапПро»</h2>
                  <span className="text-[11px] font-medium tracking-wide bg-emerald-800/80 text-emerald-200 px-2 py-0.5 rounded-full uppercase">
                    Дубрава
                  </span>
                </div>
                <p className="text-xs text-emerald-200/80 mt-0.5">
                  Мебельная мастерская • Выберите пользователя для входа без пароля
                </p>
              </div>
            </div>

            {onClose && !isStandalone && (
              <button
                onClick={onClose}
                className="text-emerald-200 hover:text-white p-1.5 rounded-xl hover:bg-emerald-900/50 transition"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* User list */}
        <div className="p-6 overflow-y-auto space-y-3 bg-stone-50/50">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
            Демо-пользователи мастерской:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {users.map(u => {
              const isSelected = currentUser?.id === u.id;
              return (
                <button
                  key={u.id}
                  onClick={() => handleSelectUser(u)}
                  className={`flex items-start gap-3.5 p-4 rounded-2xl border text-left transition-all group ${
                    isSelected
                      ? 'bg-emerald-50/80 border-emerald-600 ring-2 ring-emerald-600/20 shadow-sm'
                      : 'bg-white border-stone-200/90 hover:border-emerald-400 hover:shadow-md hover:translate-y-[-1px]'
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0 ${u.avatarColor}`}
                  >
                    {getInitials(u.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-stone-900 text-sm truncate group-hover:text-emerald-900">
                        {u.name}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                          Текущий
                        </span>
                      )}
                    </div>
                    {u.title && (
                      <div className="text-xs text-stone-500 truncate mt-0.5">
                        {u.title}
                      </div>
                    )}
                    <div className="mt-2">{getRoleBadge(u.role)}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick permissions hint */}
          <div className="mt-4 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Подсказка по правам:</span> Администратор может всё; Ответственный может двигать свои задачи и комментировать их; Наблюдатель имеет доступ только на чтение.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
