import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Homepage from './pages/Homepage'
import ProjectsPage from './pages/ProjectsPage'

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/projects" element={<ProjectsPage />} />
    </Routes>
  )
}

export default App
