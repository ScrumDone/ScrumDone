import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Homepage from './pages/Homepage'
import ProjectsPage from './pages/ProjectsPage'
import Companiespage from './pages/Companiespage'
import CalendarPage from './pages/CalendarPage'

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/companies" element={<Companiespage />} />
      <Route path="/calendar" element={<CalendarPage />} />
    </Routes>
  )
}

export default App