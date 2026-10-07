import React, { useState } from 'react';
import {
  Trees,
  LayoutGrid,
  FolderKanban,
  Users,
  RotateCcw,
  LogOut,
  UserCheck,
  ShieldCheck,
  Eye,
  Menu,
  X,
  Plus
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ConfirmModal } from './ConfirmModal';
import { LoginModal } from './LoginModal';

interface NavbarProps {
  currentTab: 'board' | 'projects' | 'users';
  onSelectTab: (tab: 'board' | 'projects' | 'users') => void;
  onOpenNewProject: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewProject
}) => {
  const { currentUser, setCurrentUser, resetToDemo } = useApp();
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isUserPickerOpen, setIsUserPickerOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getRoleBadge = () => {
    if (!currentUser) return null;
    switch (currentUser.role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <ShieldCheck className="w-3 h-3" />
            Администратор
          </span>
        );
      case 'assignee':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <UserCheck className="w-3 h-3" />
            Ответственный
          </span>
        );
      case 'viewer':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
            <Eye className="w-3 h-3" />
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
    <>
      <header className="sticky top-0 z-40 bg-emerald-950 text-white shadow-md border-b border-emerald-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Brand */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('board')}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-900 border border-emerald-600/40 flex items-center justify-center shadow-inner">
                  <Trees className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 leading-none">
                    <span className="text-lg font-black tracking-tight text-white">ЭтапПро</span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300/90 bg-emerald-900/90 px-1.5 py-0.5 rounded">
                      Канбан
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-200/70 font-medium tracking-wide">
                    Мебельная мастерская «Дубрава»
                  </span>
                </div>
              </div>

              {/* Navigation Tabs (Desktop) */}
              <nav className="hidden md:flex items-center gap-1 ml-6 pl-6 border-l border-emerald-900/80">
                <button
                  onClick={() => onSelectTab('board')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    currentTab === 'board'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-emerald-200/80 hover:bg-emerald-900 hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  Канбан-доска
                </button>

                <button
                  onClick={() => onSelectTab('projects')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    currentTab === 'projects'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-emerald-200/80 hover:bg-emerald-900 hover:text-white'
                  }`}
                >
                  <FolderKanban className="w-4 h-4" />
                  Проекты
                </button>

                {currentUser?.role === 'admin' && (
                  <button
                    onClick={() => onSelectTab('users')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      currentTab === 'users'
                        ? 'bg-emerald-800 text-white shadow-xs'
                        : 'text-emerald-200/80 hover:bg-emerald-900 hover:text-white'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Пользователи
                  </button>
                )}
              </nav>
            </div>

            {/* Right: Actions & User profile */}
            <div className="hidden md:flex items-center gap-3">
              {currentUser?.role === 'admin' && (
                <button
                  onClick={onOpenNewProject}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-xs transition active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  Новый проект
                </button>
              )}

              <button
                onClick={() => setIsResetConfirmOpen(true)}
                title="Сбросить все данные к исходному демо"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-emerald-200/80 hover:text-white hover:bg-emerald-900/80 rounded-lg transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Сбросить демо
              </button>

              <div className="h-6 w-px bg-emerald-900/90 mx-1" />

              {/* Current user pill */}
              {currentUser ? (
                <div className="flex items-center gap-2.5 bg-emerald-900/60 pl-2 pr-3 py-1 rounded-xl border border-emerald-800/80">
                  <div
                    className={`w-7 h-7 rounded-lg text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs ${currentUser.avatarColor}`}
                  >
                    {getInitials(currentUser.name)}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-stone-100 leading-tight">
                      {currentUser.name}
                    </span>
                    <div className="mt-0.5">{getRoleBadge()}</div>
                  </div>

                  <button
                    onClick={() => setIsUserPickerOpen(true)}
                    className="ml-1 text-[11px] font-medium text-emerald-300 hover:text-white underline underline-offset-2 transition"
                  >
                    Сменить
                  </button>

                  <button
                    onClick={() => setCurrentUser(null)}
                    title="Выйти"
                    className="ml-1 p-1 text-emerald-300/80 hover:text-rose-300 rounded hover:bg-emerald-950/40 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsUserPickerOpen(true)}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition"
                >
                  Войти
                </button>
              )}
            </div>

            {/* Mobile hamburger */}
            <div className="flex items-center gap-2 md:hidden">
              {currentUser?.role === 'admin' && (
                <button
                  onClick={onOpenNewProject}
                  className="p-1.5 bg-emerald-600 text-white rounded-lg"
                  title="Новый проект"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-900 transition"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-emerald-900/80 bg-emerald-950 px-4 pt-3 pb-4 space-y-3">
            {currentUser && (
              <div className="flex items-center justify-between pb-3 border-b border-emerald-900">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-lg text-white font-bold text-xs flex items-center justify-center shrink-0 ${currentUser.avatarColor}`}
                  >
                    {getInitials(currentUser.name)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{currentUser.name}</div>
                    <div className="mt-0.5">{getRoleBadge()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsUserPickerOpen(true);
                    }}
                    className="text-xs bg-emerald-900 hover:bg-emerald-800 text-emerald-200 px-2.5 py-1 rounded"
                  >
                    Сменить
                  </button>
                  <button
                    onClick={() => {
                      setCurrentUser(null);
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-xs text-rose-300 p-1"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <button
                onClick={() => {
                  onSelectTab('board');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
                  currentTab === 'board' ? 'bg-emerald-800 text-white' : 'text-emerald-200'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                Канбан-доска
              </button>
              <button
                onClick={() => {
                  onSelectTab('projects');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
                  currentTab === 'projects' ? 'bg-emerald-800 text-white' : 'text-emerald-200'
                }`}
              >
                <FolderKanban className="w-4 h-4" />
                Проекты
              </button>
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => {
                    onSelectTab('users');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
                    currentTab === 'users' ? 'bg-emerald-800 text-white' : 'text-emerald-200'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Пользователи
                </button>
              )}
            </div>

            <div className="pt-2 border-t border-emerald-900 flex justify-between">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsResetConfirmOpen(true);
                }}
                className="flex items-center gap-1.5 text-xs text-emerald-300 hover:text-white py-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Сбросить демо-данные
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Confirm Reset Demo Modal */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Сбросить все данные к демо-состоянию?"
        message="Все созданные проекты, перемещения задач и новые комментарии будут удалены. База вернется к исходным 3 демо-проектам и 6 пользователям."
        confirmLabel="Да, сбросить всё"
        cancelLabel="Отмена"
        isDestructive={true}
        onConfirm={resetToDemo}
        onClose={() => setIsResetConfirmOpen(false)}
      />

      {/* User Switcher Modal */}
      <LoginModal
        isOpen={isUserPickerOpen}
        onClose={() => setIsUserPickerOpen(false)}
      />
    </>
  );
};
