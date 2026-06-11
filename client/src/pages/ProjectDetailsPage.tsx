import React from 'react';
import { useParams } from 'react-router-dom';
import SideBar from '../components/sideBar';
import TopBar from '../components/topBar';
import ProjectTopBar from '../components/ProjectTopBar';
import { useProjectViewMode } from '../hooks/useProjectViewMode';

const ProjectDetailsPage: React.FC = () => {
  const { projectId = '' } = useParams();
  const { viewMode, setProjectViewMode } = useProjectViewMode(projectId);

  return (
    <div className="min-h-screen w-full bg-[#F9FAFB]">
      <SideBar />
      <TopBar />

      <main className="ml-64 pt-(--app-header-h)">
        <div className="flex w-full flex-col">
          <ProjectTopBar
            projectId={projectId}
            viewMode={viewMode}
            onViewModeChange={setProjectViewMode}
          />
        </div>
      </main>
    </div>
  );
};

export default ProjectDetailsPage;
