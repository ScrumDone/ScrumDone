import React from 'react';
import { ArrowDownTrayIcon, DocumentTextIcon, LockClosedIcon, PhotoIcon, PlusIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { useParams } from 'react-router-dom';
import SideBar from '../components/sideBar';
import TopBar from '../components/topBar';
import ProjectTopBar from '../components/ProjectTopBar';
import { projects } from '../data/projects';

const FILES = [
  {
    id: 1,
    name: 'Umowa_Adoddle_2026.pdf',
    size: '2.3 MB',
    author: 'Artur Nowak',
    date: '15.01.2026',
    type: 'PDF',
  },
  {
    id: 2,
    name: 'Mockupy_Dashboard.png',
    size: '1.0 MB',
    author: 'Eryk Baczyński',
    date: '21.03.2026',
    type: 'PNG',
    isPublic: true, // Zmiana tylko ikony dla tego pliku
  },
  {
    id: 3,
    name: 'Harmonogram_Projektu.xlsx',
    size: '200.0 KB',
    author: 'Artur Nowak',
    date: '20.01.2026',
    type: 'Excel',
  },
];

const renderFilePreviewIcon = (type: string) => {
  if (type === 'PNG') {
    return <PhotoIcon className="h-7 w-7 text-slate-500" />;
  }

  return <DocumentTextIcon className="h-7 w-7 text-slate-500" />;
};

const ProjectFilesPage: React.FC = () => {
  const { projectSlug } = useParams();
  const project = projects.find((item) => item.slug === projectSlug);

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

              <section className="overflow-hidden rounded-[18px] border border-slate-300 bg-white px-6">
                <div className="hidden grid-cols-[5rem_2fr_1fr_1fr_16rem] gap-4 border-b border-slate-300 px-6 py-4 text-sm font-medium text-black md:grid">
                  <span>Podgląd</span>
                  <span>Nazwa</span>
                  <span>Dodane przez</span>
                  <span>Data dodania</span>
                  <span className="text-left">Akcje</span>
                </div>

                <ul className="divide-y divide-slate-300">
                  {FILES.map((file) => (
                    <li key={file.id} className="flex flex-col gap-4 px-6 py-5 md:grid md:grid-cols-[5rem_2fr_1fr_1fr_16rem] md:items-center md:gap-0">
                      <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-slate-300 bg-slate-50">
                          {renderFilePreviewIcon(file.type)}
                        </div>
                      </div>

                      <div className="flex flex-col justify-center">
                        <p className="font-segoe-ui text-sm text-black">{file.name}</p>
                        <p className="mt-1 text-xs text-black">{file.size}</p>
                      </div>

                      <div className="flex items-center text-sm text-black">{file.author}</div>
                      <div className="text-sm text-black">{file.date}</div>
                      <div className="flex flex-wrap items-center justify-start gap-2">
                        <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-black transition hover:bg-slate-50">
                          {file.isPublic ? <GlobeAltIcon className="h-4 w-4" /> : <LockClosedIcon className="h-4 w-4" />}
                          Dostęp
                        </button>
                        <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-black transition hover:bg-slate-50">
                          <ArrowDownTrayIcon className="h-4 w-4" />
                          Pobierz
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </>
        ) : (
          <section className="mx-8 mt-6 rounded-[14px] border border-red-200 bg-white p-6 text-red-700">
            Nie znaleziono projektu o podanym adresie.
          </section>
        )}
      </main>
    </div>
  );
};

export default ProjectFilesPage;