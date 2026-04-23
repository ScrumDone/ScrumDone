import React from 'react';
import { useParams } from 'react-router-dom';
import SideBar from '../components/sideBar';
import TopBar from '../components/topBar';
import ProjectTopBar from '../components/ProjectTopBar';
import { projects } from '../data/projects';

const ProjectDetailsPage: React.FC = () => {
  const { projectSlug } = useParams();
  const project = projects.find((item) => item.slug === projectSlug);

  return (
    <div className="min-h-screen w-full bg-[#F9FAFB]">
      <SideBar />
      <TopBar />

      <main className="ml-64 pt-(--app-header-h)">
        <div className="mx-auto flex min-h-[calc(100vh-4.5rem)] max-w-350 flex-col gap-6 px-8 py-6">
          {project ? (
            <>
              <ProjectTopBar project={project} />
              <section className="rounded-[14px] border border-slate-200 bg-white p-6 text-slate-600">
                Miejsce na zawartosc podstrony projektu.
              </section>
            </>
          ) : (
            <section className="rounded-[14px] border border-red-200 bg-white p-6 text-red-700">
              Nie znaleziono projektu o podanym adresie.
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProjectDetailsPage;
