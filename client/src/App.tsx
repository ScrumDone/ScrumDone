import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Homepage from './pages/Homepage'
import CalendarPage from './pages/CalendarPage'

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/calendar" element={<CalendarPage />} />
    </Routes>
  )
}

export default App
