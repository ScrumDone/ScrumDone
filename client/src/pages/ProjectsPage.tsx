import React, { useMemo, useState } from 'react';
import SideBar from '../components/sideBar';
import TopBar from '../components/topBar';
import ProjectCard from '../components/ProjectCard';
import { PlusIcon } from '@heroicons/react/24/outline';
import ProjectCreateModal, { type EditProjectDraft } from '../components/ProjectCreateModal';
import { useCompanies } from '../hooks/useCompanies';
import { useCreateProject } from '../hooks/useCreateProject';
import { getInitialsFromName } from '../hooks/useCurrentUser';
import { useProjects } from '../hooks/useProjects';
import { useUsers } from '../hooks/useUsers';
import { mapProjectListItemToCard, toProjectCreateDto } from '../utils/projectDisplay';

const emptyDraft = (): EditProjectDraft => ({
  name: '',
  clientId: '',
  clientName: '',
  description: '',
  startDate: '',
  endDate: '',
  memberIds: [],
  workMode: 'kanban',
});

const ProjectsPage: React.FC = () => {
  const { data, isLoading, isError, error } = useProjects();
  const { data: usersData } = useUsers();
  const { data: companiesData } = useCompanies(1, 100);
  const {
    mutate: createProject,
    isPending: isCreatingProject,
    isError: isCreateProjectError,
    error: createProjectError,
    reset: resetCreateProject,
  } = useCreateProject();

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [draft, setDraft] = useState<EditProjectDraft>(emptyDraft);

  const projectCards = useMemo(
    () => (data?.items ?? []).map(mapProjectListItemToCard),
    [data?.items],
  );

  const teamMembers = useMemo(
    () =>
      (usersData?.items ?? []).map((user) => ({
        id: user.id,
        fullName: user.name,
        initials: getInitialsFromName(user.name),
        email: '',
      })),
    [usersData?.items],
  );

  const companies = useMemo(() => companiesData?.items ?? [], [companiesData?.items]);

  const openNewModal = () => {
    resetCreateProject();
    setDraft(emptyDraft());
    setIsNewModalOpen(true);
  };

  const closeNewModal = () => {
    setIsNewModalOpen(false);
    resetCreateProject();
    setDraft(emptyDraft());
  };

  const handleCreateProject = () => {
    const dto = toProjectCreateDto(draft);
    if (!dto) {
      return;
    }

    createProject(
      { data: dto },
      {
        onSuccess: () => {
          closeNewModal();
        },
      },
    );
  };

  const renderProjectsGrid = () => {
    if (isLoading) {
      return (
        <p className="text-sm text-slate-500 animate-pulse py-8">
          Ładowanie projektów...
        </p>
      );
    }

    if (isError) {
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-700">
          Nie udało się załadować projektów{error?.message ? `: ${error.message}` : '.'}
        </div>
      );
    }

    if (projectCards.length === 0) {
      return (
        <div className="rounded-lg border border-slate-200 bg-white px-6 py-10 text-center">
          <h2 className="font-segoe-ui text-lg font-medium text-slate-800">Brak projektów</h2>
          <p className="mt-2 text-sm text-slate-500">Dodaj pierwszy projekt przyciskiem powyżej.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {projectCards.map((project) => (
          <ProjectCard key={project.id} {...project} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#F9FAFB]">
      <SideBar />
      <TopBar />

      <main className="ml-64 pt-(--app-header-h)">
        <div className="mx-auto flex min-h-[calc(100vh-4.5rem)] max-w-350 flex-col px-8 py-6">
          <div className="flex items-center justify-between mb-10">
            <h1 className="font-segoe-ui text-black text-[1.5rem] leading-8 font-normal tracking-tight antialiased">
              Projekty
            </h1>

            <button onClick={openNewModal} className="h-9 px-4 bg-scrumdone-blue-main hover:bg-[#00A0DD] text-white rounded-lg inline-flex items-center justify-center gap-2 text-sm font-medium leading-2.5 transition-all active:scale-95 cursor-pointer whitespace-nowrap">
              <PlusIcon className="w-4 h-4 stroke-2" />
              Dodaj projekt
            </button>
          </div>

          {renderProjectsGrid()}
        </div>
      </main>
      <ProjectCreateModal
        isOpen={isNewModalOpen}
        draft={draft}
        members={teamMembers}
        companies={companies}
        onClose={closeNewModal}
        onSave={handleCreateProject}
        onDraftChange={setDraft}
        onToggleMember={(memberId: string) => {
          setDraft((prev) => {
            const already = prev.memberIds.includes(memberId);
            return {
              ...prev,
              memberIds: already ? prev.memberIds.filter((m) => m !== memberId) : [...prev.memberIds, memberId],
            };
          });
        }}
        isSaving={isCreatingProject}
        errorMessage={isCreateProjectError ? createProjectError?.message : null}
      />
    </div>
  );
};

export default ProjectsPage;
