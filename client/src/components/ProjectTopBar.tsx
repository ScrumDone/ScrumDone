import React, { useEffect, useState } from 'react';
import { ArrowLeftIcon, CalendarDaysIcon, PencilSquareIcon, UserGroupIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Link, NavLink } from 'react-router-dom';
import type { ProjectData } from '../data/projects';
import Avatar from './Avatar';

interface ProjectTopBarProps {
  project: ProjectData;
  viewMode?: 'kanban' | 'scrum';
  onViewModeChange?: (mode: 'kanban' | 'scrum') => void;
}

const projectTabs = ['Tablica Kanban', 'Kalendarz', 'Sprinty', 'Repozytorium plikow'];

type TeamMemberOption = {
  id: string;
  fullName: string;
  initials: string;
  email: string;
};

type EditProjectDraft = {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  memberIds: string[];
};

const editableTeamMembers: TeamMemberOption[] = [
  { id: 'artur-nowak', fullName: 'Artur Nowak', initials: 'AN', email: 'artur.nowak@randlab.pl' },
  { id: 'eryk-baczynski', fullName: 'Eryk Baczyński', initials: 'EB', email: 'eryk.b@randlab.pl' },
  { id: 'maria-kowalska', fullName: 'Maria Kowalska', initials: 'MK', email: 'maria.k@randlab.pl' },
];

const getDefaultMemberIds = (membersCount: number) => editableTeamMembers.slice(0, membersCount).map((member) => member.id);

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
    <section className=" bg-white border-b border-slate-200">
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="mb-4">
          <Link to="/projects" className="inline-flex items-center gap-2 leading-5 text-sm text-slate-600 hover:text-slate-900">
            <ArrowLeftIcon className="h-4 w-4" />
            Powrot do projektów
          </Link>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex min-w-88 flex-1 gap-4">
            {/* <div className="flex h-16 w-16 items-center justify-center rounded-[10px] border border-slate-200 bg-slate-50 text-lg font-semibold text-slate-700">
              {project.name.slice(0, 1)}
            </div> */}

            <div className="flex flex-col gap-2">
              <h1 className="text-2xl leading-8  text-slate-900 tracking-[0.07]">{displayedProject.name}</h1>
              <a className="w-fit text-sm leading-5 tracking-[-0.15] text-scrumdone-blue-main">
                {displayedProject.clientName}
              </a>
              <p className="text-[16px] tracking-[-0.31px] text-slate-600">{displayedProject.description}</p>

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
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${viewMode === 'kanban' ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:text-slate-900'}`}
              >
                Kanban
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange?.('scrum')}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${viewMode === 'scrum' ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:text-slate-900'}`}
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
        {projectTabs.map((tab) => (
          tab === 'Tablica Kanban' ? (
            <NavLink
              key={tab}
              to={`/projects/${displayedProject.slug}/tablica-kanban`}
              className={({ isActive }) =>
                `text-sm leading-5 tracking-[-0.15px] transition-colors ${isActive ? 'font-medium text-slate-950' : 'text-slate-800 hover:text-slate-950'}`
              }
            >
              {tab}
            </NavLink>
          ) : (
            <button
              key={tab}
              className={`text-sm leading-5 tracking-[-0.15px] text-slate-800 hover:text-slate-950 ${(tab === 'Sprinty' && viewMode === 'kanban') ? 'hidden' : ''}`}
            >
              {tab}
            </button>
          )
        ))}
      </div>

      {isEditModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-4"
          onClick={closeEditModal}
        >
          <div
            className="w-full max-w-190 rounded-2xl border border-slate-200 bg-white shadow-[0_12px_60px_rgba(15,23,42,0.2)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-100 px-6 pb-4 pt-5">
              <div>
                <h2 className="font-segoe-ui text-[34px] leading-10 font-semibold text-slate-900">Edycja projektu</h2>
                <p className="mt-1 font-segoe-ui text-sm text-slate-500">Zarządzaj ustawieniami i zespołem projektu</p>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                aria-label="Zamknij okno edycji projektu"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 px-6 py-5">
              <div>
                <label className="mb-2 block font-segoe-ui text-[15px] font-medium text-slate-800" htmlFor="project-name-input">
                  Nazwa projektu
                </label>
                <input
                  id="project-name-input"
                  type="text"
                  value={draft.name}
                  onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 font-segoe-ui text-[16px] text-slate-900 outline-none transition-colors focus:border-scrumdone-blue-main"
                />
              </div>

              <div>
                <label className="mb-2 block font-segoe-ui text-[15px] font-medium text-slate-800" htmlFor="project-description-input">
                  Opis projektu
                </label>
                <textarea
                  id="project-description-input"
                  value={draft.description}
                  onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 font-segoe-ui text-[16px] text-slate-900 outline-none transition-colors focus:border-scrumdone-blue-main"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block font-segoe-ui text-[15px] font-medium text-slate-800" htmlFor="project-start-date-input">
                    Data rozpoczęcia
                  </label>
                  <input
                    id="project-start-date-input"
                    type="text"
                    value={draft.startDate}
                    onChange={(event) => setDraft((prev) => ({ ...prev, startDate: event.target.value }))}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 font-segoe-ui text-[16px] text-slate-900 outline-none transition-colors focus:border-scrumdone-blue-main"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-segoe-ui text-[15px] font-medium text-slate-800" htmlFor="project-end-date-input">
                    Data zakończenia
                  </label>
                  <input
                    id="project-end-date-input"
                    type="text"
                    value={draft.endDate}
                    onChange={(event) => setDraft((prev) => ({ ...prev, endDate: event.target.value }))}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 font-segoe-ui text-[16px] text-slate-900 outline-none transition-colors focus:border-scrumdone-blue-main"
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-2 block font-segoe-ui text-[15px] font-medium text-slate-800">Członkowie zespołu</h3>
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  {editableTeamMembers.map((member) => {
                    const isChecked = draft.memberIds.includes(member.id);

                    return (
                      <label key={member.id} className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                          <Avatar initials={member.initials} size="md" />
                          <div>
                            <p className="font-segoe-ui text-[16px] font-medium text-slate-900">{member.fullName}</p>
                            <p className="font-segoe-ui text-sm text-slate-500">{member.email}</p>
                          </div>
                        </div>

                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleMember(member.id)}
                          className="h-4 w-4 rounded border-slate-300 accent-slate-900"
                          aria-label={`Wybierz ${member.fullName}`}
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button
                type="button"
                onClick={closeEditModal}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 font-segoe-ui text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Anuluj
              </button>
              <button
                type="button"
                onClick={saveProjectChanges}
                className="rounded-lg bg-scrumdone-blue-main px-4 py-2 font-segoe-ui text-sm font-medium text-white hover:bg-[#00A0DD]"
              >
                Zapisz zmiany
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default ProjectTopBar;
