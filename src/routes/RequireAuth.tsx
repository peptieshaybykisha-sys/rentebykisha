import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores'

/** Sends signed-out visitors to /login and brings them back afterwards. */
export default function RequireAuth() {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search, reason: 'auth' }} />
  return <Outlet />
}
