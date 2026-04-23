import React from 'react';
import SideBar from '../components/sideBar';
import TopBar from '../components/topBar';
import ProjectCard from '../components/ProjectCard';
import { PlusIcon } from '@heroicons/react/24/outline';
import { projects } from '../data/projects';

const ProjectsPage: React.FC = () => {
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
                        
                        <button className="h-9 px-4 bg-scrumdone-blue-main hover:bg-[#00A0DD] text-white rounded-lg inline-flex items-center justify-center gap-2 text-sm font-medium leading-2.5 transition-all active:scale-95 cursor-pointer whitespace-nowrap">
                            <PlusIcon className="w-4 h-4 stroke-2" />
                            Dodaj projekt
                        </button>
                    </div>

                    {/* Siatka projektów */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        {projects.map((project) => (
                            <ProjectCard key={project.id} {...project} />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProjectsPage;