import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Board } from './components/Board';
import { ProjectsList } from './components/ProjectsList';
import { UsersList } from './components/UsersList';
import { CardModal } from './components/CardModal';
import { ProjectModal } from './components/ProjectModal';
import { LoginModal } from './components/LoginModal';
import { ToastContainer } from './components/ToastContainer';
import { Card, Project } from './types';
import { ConfirmModal } from './components/ConfirmModal';

const AppContent: React.FC = () => {
  const { currentUser, archiveProject } = useApp();
  const [currentTab, setCurrentTab] = useState<'board' | 'projects' | 'users'>('board');

  // Modals state
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [projectToArchive, setProjectToArchive] = useState<Project | null>(null);

  const handleOpenNewProject = () => {
    setProjectToEdit(null);
    setIsProjectModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setProjectToEdit(project);
    setIsProjectModalOpen(true);
  };

  const handleArchiveProject = (project: Project) => {
    setProjectToArchive(project);
  };

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenNewProject={handleOpenNewProject}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6">
        {currentTab === 'board' && (
          <Board
            onOpenCardModal={setSelectedCard}
            onOpenNewProject={handleOpenNewProject}
            onEditProject={handleEditProject}
            onArchiveProject={handleArchiveProject}
          />
        )}

        {currentTab === 'projects' && (
          <ProjectsList
            onEditProject={handleEditProject}
            onOpenNewProject={handleOpenNewProject}
          />
        )}

        {currentTab === 'users' && <UsersList />}
      </main>

      {/* Global Card Inspection & Interaction Modal */}
      <CardModal
        card={selectedCard}
        onClose={() => setSelectedCard(null)}
      />

      {/* Create / Edit Project Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        projectToEdit={projectToEdit}
        onClose={() => {
          setIsProjectModalOpen(false);
          setProjectToEdit(null);
        }}
      />

      {/* Archive Project Confirmation */}
      <ConfirmModal
        isOpen={Boolean(projectToArchive)}
        title="Архивировать проект?"
        message={`Проект «${projectToArchive?.title}» будет отправлен в архив. Его всегда можно будет вернуть на вкладке «Проекты».`}
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

      {/* Login Screen if user is logged out */}
      <LoginModal
        isOpen={currentUser === null}
        isStandalone={true}
      />

      {/* Notification Toasts */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
