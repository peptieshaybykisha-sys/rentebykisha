import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores'

/** Sends signed-out visitors to /login and brings them back afterwards. */
export default function RequireAuth() {
  const user = useAuthStore((s) => s.user)
  const ready = useAuthStore((s) => s.ready)
  const location = useLocation()
  if (!ready) return <div className="min-h-[60svh]" aria-busy="true" aria-label="Checking your session" />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search, reason: 'auth' }} />
  return <Outlet />
}
