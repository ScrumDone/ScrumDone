import React, { useState } from 'react';
import SideBar from '../components/sideBar';
import TopBar from '../components/topBar';
import ProjectCard from '../components/ProjectCard';
import { PlusIcon } from '@heroicons/react/24/outline';
import { projects } from '../data/projects';
import ProjectCreateModal, { type EditProjectDraft, type TeamMemberOption } from '../components/ProjectCreateModal';

const formatDateForDisplay = (dateValue: string) => {
    if (!dateValue) {
        return '';
    }

    const [year, month, day] = dateValue.split('-');

    if (!year || !month || !day) {
        return dateValue;
    }

    return `${Number(day)}.${month}.${year}`;
};

const ProjectsPage: React.FC = () => {
    const [projectsList, setProjectsList] = useState(projects);
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const editableTeamMembers: TeamMemberOption[] = [
        { id: 'artur-nowak', fullName: 'Artur Nowak', initials: 'AN', email: 'artur.nowak@randlab.pl' },
        { id: 'eryk-baczynski', fullName: 'Eryk Baczyński', initials: 'EB', email: 'eryk.b@randlab.pl' },
        { id: 'maria-kowalska', fullName: 'Maria Kowalska', initials: 'MK', email: 'maria.k@randlab.pl' },
    ];

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
        const id = Date.now();
        const newProject = {
            id,
            slug: `project-${id}`,
            name: draft.name,
            clientName: draft.clientName || draft.name,
            description: draft.description,
            startDate: formatDateForDisplay(draft.startDate),
            endDate: formatDateForDisplay(draft.endDate),
            membersCount: draft.memberIds.length,
            progress: 0,
            status: 'Zaplanowany',
        };
        setProjectsList((prev) => [newProject, ...prev]);
        setIsNewModalOpen(false);
    };

    return (
        /* Główny kontener */
        <div className="min-h-screen w-full bg-[#F9FAFB]">
            {/* Side bars */}
            <SideBar />
            <TopBar />

            {/* Główny obszar roboczy */}
            <main className="ml-64 pt-(--app-header-h)">
                <div className="mx-auto flex min-h-[calc(100vh-4.5rem)] max-w-350 flex-col px-8 py-6">
                    
                    {/* Tytuł i dodawanie projektu */}
                    <div className="flex items-center justify-between mb-10">
                        <h1 className="font-segoe-ui text-black text-[1.5rem] leading-8 font-normal tracking-tight antialiased">
                            Projekty
                        </h1>
                        
                        <button onClick={openNewModal} className="h-9 px-4 bg-scrumdone-blue-main hover:bg-[#00A0DD] text-white rounded-lg inline-flex items-center justify-center gap-2 text-sm font-medium leading-2.5 transition-all active:scale-95 cursor-pointer whitespace-nowrap">
                            <PlusIcon className="w-4 h-4 stroke-2" />
                            Dodaj projekt
                        </button>
                    </div>

                    {/* Siatka projektów */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        {projectsList.map((project) => (
                            <ProjectCard key={project.id} {...project} />
                        ))}
                    </div>
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