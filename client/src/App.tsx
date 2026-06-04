import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Homepage from './pages/Homepage'
import ProjectsPage from './pages/ProjectsPage'
import Companiespage from './pages/Companiespage'
import CompanyDetailsPage from './pages/CompanyDetailsPage'
import CalendarPage from './pages/CalendarPage'
import ReportsPage from './pages/ReportsPage'
import TaskPage from './pages/TaskPage'
import FilesPage from './pages/FilesPage'
import ProjectDetailsPage from './pages/ProjectDetailsPage'
import ProjectFilesPage from './pages/ProjectFilesPage'
import ProjectKanbanPage from './pages/ProjectKanbanPage'
import ProjectCalendarPage from './pages/ProjectCalendarPage'
import SprintsPage from './pages/SprintsPage'
import  { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const App: React.FC = () => {
  return (
    <>
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/projects/:projectSlug" element={<ProjectDetailsPage />} />
      <Route path="/projects/:projectSlug/tablica-kanban" element={<ProjectKanbanPage />} />
      <Route path="/projects/:projectSlug/kalendarz" element={<ProjectCalendarPage />} />
      <Route path="/projects/:projectSlug/sprinty" element={<SprintsPage />} />
      <Route path="/projects/:projectSlug/repozytorium-plikow" element={<ProjectFilesPage />} />
      <Route path="/companies" element={<Companiespage />} />
      <Route path="/companies/:companySlug" element={<CompanyDetailsPage />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/task" element={<TaskPage />} />
      <Route path="/files" element={<FilesPage />} />
    </Routes>
    <ReactQueryDevtools initialIsOpen={false} />
    </>
  )
}

export default App