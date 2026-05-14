import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useParams } from 'react-router-dom';
import SideBar from '../components/sideBar';
import TopBar from '../components/topBar';
import ProjectTopBar from '../components/ProjectTopBar';
import ProjectFileRow, { type FileItem } from '../components/ProjectFileCard';
import { projects } from '../data/projects';

const FILES: FileItem[] = [
  { id: 1, name: 'Umowa_Adoddle_2026.pdf', size: '2.3 MB', author: 'Artur Nowak', date: '15.01.2026', type: 'PDF' },
  { id: 2, name: 'Mockupy_Dashboard.png', size: '1.0 MB', author: 'Eryk Baczyński', date: '21.03.2026', type: 'PNG', isPublic: true },
  { id: 3, name: 'Harmonogram_Projektu.xlsx', size: '200.0 KB', author: 'Artur Nowak', date: '20.01.2026', type: 'Excel' },
];

const ProjectFilesPage: React.FC = () => {
  const { projectSlug } = useParams();
  const project = projects.find((p) => p.slug === projectSlug);

  return (
    <div className="min-h-screen w-full bg-[#F9FAFB]">
      <SideBar />
      <TopBar />

      <main className="ml-64 pt-(--app-header-h)">
        {project ? (
          <>
            <ProjectTopBar project={project} viewMode="scrum" />

            <div className="mx-auto w-full px-6 py-6">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="font-segoe-ui text-2xl tracking-[-0.44px] text-black">Pliki projektu</h2>
                <button type="button" className="inline-flex items-center justify-center gap-2 rounded-lg bg-scrumdone-blue-main px-4 py-2 text-sm font-medium text-white transition hover:bg-[#00A0DD] active:scale-95">
                  <PlusIcon className="h-4 w-4" />
                  Dodaj plik
                </button>
              </div>

              <section className="overflow-hidden rounded-[10px] border border-slate-200 bg-white">
                <div className="hidden grid-cols-[5rem_2fr_1fr_1fr_16rem] gap-30 border-b border-slate-200 px-6 py-4 text-sm font-medium text-slate-500 md:grid">
                  <span>Podgląd</span>
                  <span>Nazwa</span>
                  <span>Dodane przez</span>
                  <span>Data dodania</span>
                  <span>Akcje</span>
                </div>

                <ul className="divide-y divide-slate-200">
                  {FILES.map((file) => (
                    <ProjectFileRow key={file.id} file={file} />
                  ))}
                </ul>
              </section>
            </div>
          </>
        ) : (
          <div className="p-8 text-red-600">Nie znaleziono projektu.</div>
        )}
      </main>
    </div>
  );
};

export default ProjectFilesPage;