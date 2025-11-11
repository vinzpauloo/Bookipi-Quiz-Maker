// ** React Imports **
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// ** TanStack Query Imports **
import { QueryClientProvider } from '@tanstack/react-query'

// ** Query Client Configuration **
import { queryClient } from './lib/query-client'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
