import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import { startAccount } from '@/stores/account'
import { startAuth } from '@/stores/auth'
import { startCatalog, useCatalog } from '@/stores/catalog'

startCatalog()
startAccount()
startAuth()

// Dev-only handle so the catalogue can be stubbed in browser tests without Supabase.
if (import.meta.env.DEV) (window as unknown as { __catalog: typeof useCatalog }).__catalog = useCatalog

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
