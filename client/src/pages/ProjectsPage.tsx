import React from 'react';
import SideBar from '../components/sideBar';
import TopBar from '../components/topBar';
import ProjectCard from '../components/ProjectCard';
import { PlusIcon } from '@heroicons/react/24/outline';

// Dane testowe
const mockProjects = [
  { id: 1, name: 'Adoddle', clientName: 'Adoddle', description: 'Development of mobile application for project management', startDate: '15.01.2026', endDate: '5.04.2026', membersCount: 3, progress: 65, status: 'Aktywny' },
  { id: 2, name: 'Nexus', clientName: 'Nexus Tech', description: 'E-commerce platform development', startDate: '1.02.2026', endDate: '6.04.2026', membersCount: 3, progress: 45, status: 'Aktywny' },
  { id: 3, name: 'Hadar', clientName: 'Hadar Solutions', description: 'Custom CRM system implementation', startDate: '20.01.2026', endDate: '5.04.2026', membersCount: 3, progress: 72, status: 'Aktywny' },
];

const ProjectsPage: React.FC = () => {
    return (
        /* Główny kontener */
        <div className="min-h-screen w-full bg-[#F9FAFB]">
            {/* Side bars */}
            <SideBar />
            <TopBar />

            {/* Główny obszar roboczy */}
            <main className="ml-64 pt-(--app-header-h)">
                <div className="max-w-7xl mx-auto px-8 py-10">
                    
                    {/* Tytuł i dodawanie projektu */}
                    <div className="flex items-center justify-between mb-10">
                        <h1 className="font-segoe-ui text-black text-[1.5rem] leading-[32px] font-normal tracking-tight antialiased">
                            Projekty
                        </h1>
                        
                        <button className="h-9 px-4 bg-scrumdone-blue-main hover:bg-[#00A0DD] text-white rounded-[8px] inline-flex items-center justify-center gap-2 text-sm font-medium leading-[10px] transition-all active:scale-95 cursor-pointer whitespace-nowrap">
                            <PlusIcon className="w-4 h-4 stroke-[2]" />
                            Dodaj projekt
                        </button>
                    </div>

                    {/* Siatka projektów */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        {mockProjects.map((project) => (
                            <ProjectCard key={project.id} {...project} />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProjectsPage;