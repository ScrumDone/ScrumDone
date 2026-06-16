import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient.ts'
import { SelectedUserProvider } from './hooks/useSelectedUser.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <SelectedUserProvider>
          <App />
        </SelectedUserProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)
