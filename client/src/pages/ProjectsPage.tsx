import React, { useMemo, useState } from 'react';
import SideBar from '../components/sideBar';
import TopBar from '../components/topBar';
import ProjectCard from '../components/ProjectCard';
import { PlusIcon } from '@heroicons/react/24/outline';
import ProjectCreateModal, { type EditProjectDraft, type TeamMemberOption } from '../components/ProjectCreateModal';
import { useProjects } from '../hooks/useProjects';
import { mapProjectListItemToCard } from '../utils/projectDisplay';

const ProjectsPage: React.FC = () => {
    const { data, isLoading, isError, error } = useProjects();
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const editableTeamMembers: TeamMemberOption[] = [
        { id: 'artur-nowak', fullName: 'Artur Nowak', initials: 'AN', email: 'artur.nowak@randlab.pl' },
        { id: 'eryk-baczynski', fullName: 'Eryk Baczyński', initials: 'EB', email: 'eryk.b@randlab.pl' },
        { id: 'maria-kowalska', fullName: 'Maria Kowalska', initials: 'MK', email: 'maria.k@randlab.pl' },
    ];

    const projectCards = useMemo(
        () => (data?.items ?? []).map(mapProjectListItemToCard),
        [data?.items],
    );

    const [draft, setDraft] = useState<EditProjectDraft>({
        name: '',
        clientId: '',
        clientName: '',
        description: '',
        startDate: '',
        endDate: '',
        memberIds: [],
    });

    const openNewModal = () => {
        setDraft({ name: '', clientId: '', clientName: '', description: '', startDate: '', endDate: '', memberIds: [] });
        setIsNewModalOpen(true);
    };

    const closeNewModal = () => setIsNewModalOpen(false);

    const saveNewProject = () => {
        setIsNewModalOpen(false);
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
                members={editableTeamMembers}
                onClose={closeNewModal}
                onSave={saveNewProject}
                onDraftChange={setDraft}
                onToggleMember={(memberId: string) => {
                    setDraft((prev) => {
                        const already = prev.memberIds.includes(memberId);
                        return { ...prev, memberIds: already ? prev.memberIds.filter((m) => m !== memberId) : [...prev.memberIds, memberId] };
                    });
                }}
            />
        </div>
    );
};

export default ProjectsPage;
