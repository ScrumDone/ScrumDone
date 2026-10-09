import React from 'react';
import { useParams } from 'react-router-dom';
import SideBar from '../components/layout/SideBar';
import TopBar from '../components/layout/TopBar';
import ProjectTopBar from '../components/projects/ProjectTopBar';

const ProjectDetailsPage: React.FC = () => {
  const { projectId = '' } = useParams();

  return (
    <div className="min-h-screen w-full bg-[#F9FAFB]">
      <SideBar />
      <TopBar />

      <main className="ml-64 pt-(--app-header-h)">
        <div className="flex w-full flex-col">
          <ProjectTopBar projectId={projectId} />
        </div>
      </main>
    </div>
  );
};

export default ProjectDetailsPage;
