import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { seedDemo } from '@/lib/api'
import { startCatalog, useCatalog } from '@/stores/catalog'

seedDemo()
startCatalog()

// Dev-only handle so the catalogue can be stubbed in browser tests without Firebase.
if (import.meta.env.DEV) (window as unknown as { __catalog: typeof useCatalog }).__catalog = useCatalog

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
