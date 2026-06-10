import React, { useEffect, useState } from 'react';
import { ArrowLeftIcon, CalendarDaysIcon, PencilSquareIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { Link, NavLink } from 'react-router-dom';
import type { ProjectData } from '../data/projects';
import ProjectEditModal, { type EditProjectDraft, type TeamMemberOption } from './ProjectEditModal';

interface ProjectTopBarProps {
  project: ProjectData;
  viewMode?: 'kanban' | 'scrum';
  onViewModeChange?: (mode: 'kanban' | 'scrum') => void;
}

const projectTabs = [
  { label: 'Tablica Kanban', path: (projectId: string) => `/projects/${projectId}/tablica-kanban` },
  { label: 'Kalendarz', path: (projectId: string) => `/projects/${projectId}/kalendarz` },
  { label: 'Sprinty', path: (projectId: string) => `/projects/${projectId}/sprinty` },
  { label: 'Repozytorium plików', path: (projectId: string) => `/projects/${projectId}/repozytorium-plikow` },
];

const editableTeamMembers: TeamMemberOption[] = [
  { id: 'artur-nowak', fullName: 'Artur Nowak', initials: 'AN', email: 'artur.nowak@randlab.pl' },
  { id: 'eryk-baczynski', fullName: 'Eryk Baczyński', initials: 'EB', email: 'eryk.b@randlab.pl' },
  { id: 'maria-kowalska', fullName: 'Maria Kowalska', initials: 'MK', email: 'maria.k@randlab.pl' },
];

const getDefaultMemberIds = (membersCount: number) =>
  editableTeamMembers.slice(0, membersCount).map((member) => member.id);

const ProjectTopBar: React.FC<ProjectTopBarProps> = ({
  project,
  viewMode = 'kanban',
  onViewModeChange,
}) => {
  const [displayedProject, setDisplayedProject] = useState<ProjectData>(project);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [draft, setDraft] = useState<EditProjectDraft>({
    name: project.name,
    description: project.description,
    startDate: project.startDate,
    endDate: project.endDate,
    memberIds: getDefaultMemberIds(project.membersCount),
  });

  useEffect(() => {
    setDisplayedProject(project);
    setDraft({
      name: project.name,
      description: project.description,
      startDate: project.startDate,
      endDate: project.endDate,
      memberIds: getDefaultMemberIds(project.membersCount),
    });
  }, [project]);

  const openEditModal = () => {
    setDraft({
      name: displayedProject.name,
      description: displayedProject.description,
      startDate: displayedProject.startDate,
      endDate: displayedProject.endDate,
      memberIds: getDefaultMemberIds(displayedProject.membersCount),
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  const toggleMember = (memberId: string) => {
    setDraft((prev) => {
      const alreadySelected = prev.memberIds.includes(memberId);
      return {
        ...prev,
        memberIds: alreadySelected
          ? prev.memberIds.filter((id) => id !== memberId)
          : [...prev.memberIds, memberId],
      };
    });
  };

  const saveProjectChanges = () => {
    setDisplayedProject((prev) => ({
      ...prev,
      name: draft.name,
      description: draft.description,
      startDate: draft.startDate,
      endDate: draft.endDate,
      membersCount: draft.memberIds.length,
    }));
    setIsEditModalOpen(false);
  };

  return (
    <section className="bg-white border-b border-slate-200">
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="mb-4">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 leading-5 text-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Powrót do projektów
          </Link>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex min-w-88 flex-1 gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl leading-8 text-slate-900 tracking-[0.07]">
                {displayedProject.name}
              </h1>
              <a className="w-fit text-sm leading-5 tracking-[-0.15] text-scrumdone-blue-main">
                {displayedProject.clientName}
              </a>
              <p className="text-[16px] tracking-[-0.31px] text-slate-600">
                {displayedProject.description}
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-6 text-slate-600">
                <div className="inline-flex items-center gap-2 text-sm leading-5 tracking-[-0.15]">
                  <CalendarDaysIcon className="h-4 w-4" />
                  {displayedProject.startDate} - {displayedProject.endDate}
                </div>
                <div className="inline-flex items-center gap-2 text-sm leading-5 tracking-[-0.15]">
                  <UserGroupIcon className="h-4 w-4" />
                  {displayedProject.membersCount} członków zespołu
                </div>
              </div>
            </div>
          </div>

          <div className="flex min-w-56 flex-col items-stretch gap-3">
            <div className="inline-flex w-full gap-2 rounded-[10px] bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => onViewModeChange?.('kanban')}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'kanban' ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Kanban
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange?.('scrum')}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'scrum' ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Scrum
              </button>
            </div>

            <button
              type="button"
              onClick={openEditModal}
              className="inline-flex w-full items-center justify-center gap-4 rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-900 hover:bg-slate-50"
            >
              <PencilSquareIcon className="h-4 w-4" />
              Edytuj projekt
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-8 px-6 py-3">
        {projectTabs.map((tab) =>
          tab.path ? (
            <NavLink
              key={tab.label}
              to={tab.path(String(displayedProject.id))}
              className={({ isActive }) =>
                `text-sm leading-5 tracking-[-0.15px] transition-colors ${
                  isActive ? 'font-medium text-slate-950' : 'text-slate-800 hover:text-slate-950'
                } ${tab.label === 'Sprinty' && viewMode === 'kanban' ? 'hidden' : ''}`
              }
            >
              {tab.label}
            </NavLink>
          ) : (
            <span
              key={tab.label}
              className={`text-sm leading-5 tracking-[-0.15px] text-slate-800 ${
                tab.label === 'Sprinty' && viewMode === 'kanban' ? 'hidden' : ''
              }`}
            >
              {tab.label}
            </span>
          )
        )}
      </div>

      <ProjectEditModal
        isOpen={isEditModalOpen}
        draft={draft}
        members={editableTeamMembers}
        onClose={closeEditModal}
        onSave={saveProjectChanges}
        onDraftChange={setDraft}
        onToggleMember={toggleMember}
      />
    </section>
  );
};

export default ProjectTopBar;