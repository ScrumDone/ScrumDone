import React from 'react'
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/home/HomePage'
import ProjectsPage from './pages/projects/ProjectsPage'
import CompaniesPage from './pages/companies/CompaniesPage'
import CompanyDetailsPage from './pages/companies/CompanyDetailsPage'
import CalendarPage from './pages/calendar/CalendarPage'
import ReportsPage from './pages/reports/ReportsPage'
import TaskPage from './pages/tasks/TaskPage'
import FilesPage from './pages/files/FilesPage'
import ProjectDetailsPage from './pages/projects/ProjectDetailsPage'
import ProjectFilesPage from './pages/projects/ProjectFilesPage'
import ProjectKanbanPage from './pages/projects/ProjectKanbanPage'
import ProjectCalendarPage from './pages/projects/ProjectCalendarPage'
import ProjectSprintsPage from './pages/projects/ProjectSprintsPage'
import ManagerHomePage from './pages/home/ManagerHomePage'

const App: React.FC = () => {
  return (
    <>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/homepage-manager" element={<ManagerHomePage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/projects/:projectId" element={<ProjectDetailsPage />} />
      <Route path="/projects/:projectId/tablica-kanban" element={<ProjectKanbanPage />} />
      <Route path="/projects/:projectId/kalendarz" element={<ProjectCalendarPage />} />
      <Route path="/projects/:projectId/sprinty" element={<ProjectSprintsPage />} />
      <Route path="/projects/:projectId/repozytorium-plikow" element={<ProjectFilesPage />} />
      <Route path="/companies" element={<CompaniesPage />} />
      <Route path="/companies/:companyId" element={<CompanyDetailsPage />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/task/:assignmentId" element={<TaskPage />} />
      <Route path="/files" element={<FilesPage />} />
    </Routes>
    {/* <ReactQueryDevtools initialIsOpen={true} /> */}
    </>
  )
}

export default App