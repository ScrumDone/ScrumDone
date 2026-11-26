import React, { useEffect, useMemo, useState } from 'react';
import { formatCount, PLURALS } from '../../utils/plural';
import { ArrowLeftIcon, CalendarDaysIcon, PencilSquareIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useProject } from '../../hooks/projects/useProject';
import { useUpdateProject } from '../../hooks/projects/useUpdateProject';
import { useUpdateProjectMembers } from '../../hooks/projects/useUpdateProjectMembers';
import { useDeleteProject } from '../../hooks/projects/useDeleteProject';
import { useCompanies } from '../../hooks/companies/useCompanies';
import { useUsers } from '../../hooks/users/useUsers';
import {
  haveSameMemberIds,
  mapProjectDetailToEditDraft,
  mapProjectDetailToTopBar,
  mapUsersToTeamMemberOptions,
  toProjectUpdateDto,
} from '../../utils/projectDisplay';
import ProjectEditModal, { type EditProjectDraft } from './ProjectEditModal';
import ProjectChangeClientModal from './ProjectChangeClientModal';
import ProjectMethodologyChangeDialog, {
  type ProjectMethodology,
} from './ProjectMethodologyChangeDialog';

interface ProjectTopBarProps {
  projectId: string;
}

const projectTabs = [
  { label: 'Tablica Kanban', path: (id: string) => `/projects/${id}/tablica-kanban` },
  { label: 'Kalendarz', path: (id: string) => `/projects/${id}/kalendarz` },
  { label: 'Sprinty', path: (id: string) => `/projects/${id}/sprinty` },
  { label: 'Repozytorium plików', path: (id: string) => `/projects/${id}/repozytorium-plikow` },
];

const emptyDraft = (): EditProjectDraft => ({
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  memberIds: [],
  hexColor: null,
});

type TopBarDensity = 'compact' | 'full';

const TOPBAR_DENSITY_STORAGE_KEY = 'scrumdone.projectTopBar.density';

const readStoredDensity = (): TopBarDensity => {
  try {
    const stored = localStorage.getItem(TOPBAR_DENSITY_STORAGE_KEY);
    if (stored === 'compact' || stored === 'full') return stored;
  } catch {
    // ignore storage access errors
  }
  return 'full';
};

const segmentButtonClass = (isActive: boolean) =>
  `flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:text-slate-900'
  }`;

const ProjectTopBar: React.FC<ProjectTopBarProps> = ({ projectId }) => {
  const navigate = useNavigate();
  const { data: projectData, isLoading, isError, error } = useProject(projectId);
  const { data: usersData } = useUsers(1, 100);
  const { data: companiesData } = useCompanies(1, 100);
  const {
    mutate: updateProject,
    isPending: isSavingProject,
    isError: isUpdateProjectError,
    error: updateProjectError,
    reset: resetUpdateProject,
  } = useUpdateProject();
  const {
    mutate: updateProjectMembers,
    isPending: isSavingMembers,
    isError: isUpdateMembersError,
    error: updateMembersError,
    reset: resetUpdateMembers,
  } = useUpdateProjectMembers();
  const {
    mutate: deleteProject,
    isPending: isDeleting,
    isError: isDeleteError,
    error: deleteError,
    reset: resetDeleteProject,
  } = useDeleteProject();

  const displayedProject = useMemo(
    () => (projectData ? mapProjectDetailToTopBar(projectData) : null),
    [projectData],
  );

  const teamMembers = useMemo(
    () => mapUsersToTeamMemberOptions(usersData?.items ?? []),
    [usersData?.items],
  );

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isChangeClientModalOpen, setIsChangeClientModalOpen] = useState(false);
  const [draft, setDraft] = useState<EditProjectDraft>(emptyDraft);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isChangingClient, setIsChangingClient] = useState(false);
  const [isChangingMethodology, setIsChangingMethodology] = useState(false);
  const [pendingMethodology, setPendingMethodology] = useState<ProjectMethodology | null>(null);
  const [density, setDensity] = useState<TopBarDensity>(readStoredDensity);
  const isCompact = density === 'compact';

  const handleDensityChange = (next: TopBarDensity) => {
    setDensity(next);
    try {
      localStorage.setItem(TOPBAR_DENSITY_STORAGE_KEY, next);
    } catch {
      // ignore storage access errors
    }
  };

  const isSaving = isSavingProject || isSavingMembers;
  const saveErrorMessage = isUpdateProjectError && !isChangingClient && !isArchiving && !isChangingMethodology
    ? updateProjectError?.message
    : isUpdateMembersError
      ? updateMembersError?.message
      : null;
  const deleteErrorMessage = isDeleteError ? deleteError?.message : null;
  const changeClientErrorMessage = isUpdateProjectError && isChangingClient
    ? updateProjectError?.message
    : null;
  const methodologyErrorMessage = isUpdateProjectError && isChangingMethodology
    ? updateProjectError?.message
    : null;
  const errorMessage = saveErrorMessage ?? deleteErrorMessage ?? changeClientErrorMessage;

  useEffect(() => {
    if (!projectData) {
      setDraft(emptyDraft());
      return;
    }

    setDraft(mapProjectDetailToEditDraft(projectData));
  }, [projectData]);

  const resetSaveMutations = () => {
    resetUpdateProject();
    resetUpdateMembers();
  };

  const resetMutations = () => {
    resetSaveMutations();
    resetDeleteProject();
    setIsArchiving(false);
    setIsChangingClient(false);
  };

  const viewMode: ProjectMethodology = projectData?.isSetToScrum ? 'scrum' : 'kanban';

  const requestViewModeChange = (mode: ProjectMethodology) => {
    if (!projectData || isSavingProject) return;
    if (projectData.isSetToScrum === (mode === 'scrum')) return;
    resetUpdateProject();
    setIsChangingMethodology(false);
    setPendingMethodology(mode);
  };

  const closeMethodologyDialog = () => {
    if (isSavingProject && isChangingMethodology) return;
    resetUpdateProject();
    setIsChangingMethodology(false);
    setPendingMethodology(null);
  };

  const confirmViewModeChange = () => {
    if (!projectData || !pendingMethodology || isSavingProject) return;
    const nextIsScrum = pendingMethodology === 'scrum';
    resetUpdateProject();
    setIsChangingMethodology(true);
    updateProject(
      { id: projectId, data: { isSetToScrum: nextIsScrum } },
      {
        onSuccess: () => {
          setIsChangingMethodology(false);
          setPendingMethodology(null);
          if (nextIsScrum) {
            navigate(`/projects/${projectId}/sprinty`);
          }
        },
      },
    );
  };

  const openEditModal = () => {
    if (!projectData) {
      return;
    }

    resetMutations();
    setDraft(mapProjectDetailToEditDraft(projectData));
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    resetMutations();
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

  const saveMembersIfChanged = (currentMemberIds: string[]) => {
    if (haveSameMemberIds(currentMemberIds, draft.memberIds)) {
      closeEditModal();
      return;
    }

    updateProjectMembers(
      { id: projectId, userIds: draft.memberIds, currentUserIds: currentMemberIds },
      {
        onSuccess: () => {
          closeEditModal();
        },
      },
    );
  };

  const saveProjectChanges = () => {
    const dto = toProjectUpdateDto(draft);
    if (!dto || !projectData) {
      return;
    }

    const currentMemberIds = mapProjectDetailToEditDraft(projectData).memberIds;

    updateProject(
      { id: projectId, data: dto },
      {
        onSuccess: () => {
          saveMembersIfChanged(currentMemberIds);
        },
      },
    );
  };

  const handleDeleteProject = () => {
    resetDeleteProject();
    deleteProject(projectId, {
      onSuccess: () => {
        navigate('/projects');
      },
    });
  };

  const handleChangeClient = () => {
    resetSaveMutations();
    setIsChangeClientModalOpen(true);
  };

  const closeChangeClientModal = () => {
    resetSaveMutations();
    setIsChangeClientModalOpen(false);
    setIsChangingClient(false);
  };

  const handleSaveClient = (companyId: string) => {
    resetSaveMutations();
    setIsChangingClient(true);

    updateProject(
      { id: projectId, data: { companyId } },
      {
        onSuccess: () => {
          setIsChangingClient(false);
          setIsChangeClientModalOpen(false);
        },
        onError: () => {
          setIsChangingClient(false);
        },
      },
    );
  };

  const handleArchiveProject = () => {
    if (!projectData) {
      return;
    }

    resetSaveMutations();
    setIsArchiving(true);

    const nextIsActive = !projectData.isActive;

    updateProject(
      { id: projectId, data: { isActive: nextIsActive } },
      {
        onSuccess: () => {
          setIsArchiving(false);
          closeEditModal();
          if (!nextIsActive) {
            navigate('/projects');
          }
        },
        onError: () => {
          setIsArchiving(false);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <section className="border-b border-slate-200 bg-white px-6 py-8">
        <p className="text-sm text-slate-500 animate-pulse">Ładowanie projektu...</p>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="border-b border-red-200 bg-white px-6 py-8">
        <p className="text-sm text-red-700">
          Nie udało się załadować projektu{error?.message ? `: ${error.message}` : '.'}
        </p>
      </section>
    );
  }

  if (!displayedProject) {
    return (
      <section className="border-b border-red-200 bg-white px-6 py-8">
        <p className="text-sm text-red-700">Nie znaleziono projektu o podanym adresie.</p>
      </section>
    );
  }

  return (
    <section className="bg-white border-b border-slate-200">
      <div className={`border-b border-slate-200 px-4 sm:px-6 transition-[padding] duration-200 ${isCompact ? 'py-3' : 'py-5'}`}>
        <div className={isCompact ? 'mb-2' : 'mb-4'}>
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 leading-5 text-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Powrót do projektów
          </Link>
        </div>

        <div className={`flex flex-wrap items-start justify-between ${isCompact ? 'gap-4' : 'gap-6'}`}>
          <div className="flex min-w-0 flex-1 gap-4 sm:min-w-88">
            <div className={`flex min-w-0 flex-col ${isCompact ? 'gap-1' : 'gap-2'}`}>
              <h1 className={`text-slate-900 tracking-[0.07] ${isCompact ? 'text-xl leading-7' : 'text-2xl leading-8'}`}>
                {displayedProject.name}
              </h1>

              {isCompact ? (
                <div className="flex min-w-0 flex-wrap items-center gap-x-6 gap-y-1">
                  <a className="w-fit shrink-0 text-sm leading-5 tracking-[-0.15] text-scrumdone-blue-main">
                    {displayedProject.clientName}
                  </a>
                  <div className="flex flex-wrap items-center gap-4 text-slate-600 sm:gap-6">
                    <div className="inline-flex items-center gap-2 text-sm leading-5 tracking-[-0.15]">
                      <CalendarDaysIcon className="h-4 w-4" />
                      {displayedProject.startDate} - {displayedProject.endDate}
                    </div>
                    <div className="inline-flex items-center gap-2 text-sm leading-5 tracking-[-0.15]">
                      <UserGroupIcon className="h-4 w-4" />
                      {formatCount(displayedProject.membersCount, PLURALS.teamMembers)}
                    </div>
                  </div>
                </div>
              ) : (
                <>
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
                      {formatCount(displayedProject.membersCount, PLURALS.teamMembers)}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className={`flex w-full items-stretch sm:w-auto ${isCompact ? 'flex-col gap-2 sm:flex-row sm:items-center' : 'flex-col gap-3'}`}>
            {isCompact ? (
              <button
                type="button"
                onClick={openEditModal}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 sm:w-auto"
              >
                <PencilSquareIcon className="h-4 w-4" />
                Edytuj projekt
              </button>
            ) : null}

            <div className="inline-flex w-full gap-2 rounded-[10px] bg-slate-50 p-1 sm:w-auto sm:min-w-52">
              <button
                type="button"
                onClick={() => handleDensityChange('compact')}
                className={segmentButtonClass(isCompact)}
              >
                Kompaktowy
              </button>
              <button
                type="button"
                onClick={() => handleDensityChange('full')}
                className={segmentButtonClass(!isCompact)}
              >
                Pełny
              </button>
            </div>

            <div className="inline-flex w-full gap-2 rounded-[10px] bg-slate-50 p-1 sm:w-auto sm:min-w-48">
              <button
                type="button"
                onClick={() => requestViewModeChange('kanban')}
                className={segmentButtonClass(viewMode === 'kanban')}
              >
                Kanban
              </button>
              <button
                type="button"
                onClick={() => requestViewModeChange('scrum')}
                className={segmentButtonClass(viewMode === 'scrum')}
              >
                Scrum
              </button>
            </div>

            {!isCompact ? (
              <button
                type="button"
                onClick={openEditModal}
                className="inline-flex w-full items-center justify-center gap-4 rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-900 hover:bg-slate-50 sm:self-end sm:w-auto"
              >
                <PencilSquareIcon className="h-4 w-4" />
                Edytuj projekt
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-8 gap-y-2 px-4 py-3 sm:px-6">
        {projectTabs.map((tab) => (
          <NavLink
            key={tab.label}
            to={tab.path(displayedProject.id)}
            className={({ isActive }) =>
              `text-sm leading-5 tracking-[-0.15px] transition-colors ${
                isActive ? 'font-medium text-slate-950' : 'text-slate-800 hover:text-slate-950'
              } ${tab.label === 'Sprinty' && !projectData?.isSetToScrum ? 'hidden' : ''}`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>

      <ProjectEditModal
        isOpen={isEditModalOpen}
        projectId={projectId}
        draft={draft}
        members={teamMembers}
        isActive={projectData?.isActive ?? true}
        onClose={closeEditModal}
        onSave={saveProjectChanges}
        onChangeClient={handleChangeClient}
        onArchive={handleArchiveProject}
        onDelete={handleDeleteProject}
        onDraftChange={setDraft}
        onToggleMember={toggleMember}
        isSaving={isSaving}
        isArchiving={isArchiving}
        isDeleting={isDeleting}
        errorMessage={errorMessage}
      />

      <ProjectMethodologyChangeDialog
        isOpen={pendingMethodology !== null}
        nextMode={pendingMethodology}
        isSaving={isSavingProject && isChangingMethodology}
        errorMessage={methodologyErrorMessage}
        onClose={closeMethodologyDialog}
        onConfirm={confirmViewModeChange}
      />

      <ProjectChangeClientModal
        isOpen={isChangeClientModalOpen}
        companies={companiesData?.items ?? []}
        currentCompanyId={projectData?.companyId ?? null}
        onClose={closeChangeClientModal}
        onSave={handleSaveClient}
        isSaving={isChangingClient && isSavingProject}
        errorMessage={changeClientErrorMessage}
      />
    </section>
  );
};

export default ProjectTopBar;
