import { useEffect } from 'react'
import { Navigate, NavLink, Outlet } from 'react-router-dom'
import { ArrowDown, ArrowUp, LogOut, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Notice } from '@/components/common/States'
import { ADMIN_NAV } from '@/constants/navigation'
import { isSupabaseConfigured } from '@/lib/supabase'
import { adminSignOut, startAdminAuth, useAdmin } from '@/stores/admin'
import { cn } from '@/lib/utils'
import Toaster from '@/components/layout/Toaster'

/** Gate: only signed-in users whose profile role is 'admin' may enter. */
export function RequireAdmin() {
  const { ready, uid, isAdmin, email } = useAdmin()
  useEffect(() => {
    void startAdminAuth()
  }, [])

  if (!isSupabaseConfigured) return <Navigate to="/admin/login" replace />
  if (!ready) return <p className="grid min-h-svh place-items-center text-muted">Checking your access…</p>
  if (!uid) return <Navigate to="/admin/login" replace />
  if (!isAdmin)
    return (
      <div className="mx-auto grid min-h-svh max-w-lg content-center gap-4 px-5 text-center">
        <h1 className="text-4xl">This account is not an admin</h1>
        <p className="text-muted">
          {email} is signed in, but does not have the admin role. Ask an existing admin to change your role under Users, or run <code>npm run seed:admin</code>. Your user ID is:
        </p>
        <code className="break-all rounded-xl bg-blush-soft px-3 py-2 text-sm">{uid}</code>
        <Button variant="secondary" onClick={() => void adminSignOut()}>
          Sign out
        </Button>
      </div>
    )
  return <Outlet />
}

export function AdminLayout() {
  const email = useAdmin((s) => s.email)
  return (
    <div className="min-h-svh bg-cream">
      <header className="border-b border-line bg-ivory">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-3 sm:px-8">
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-3xl italic text-burgundy">Renté</span>
            <span className="text-sm font-medium uppercase tracking-[0.25em] text-muted">Admin</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <button
              type="button"
              onClick={() => void adminSignOut()}
              className="flex min-h-11 items-center gap-1.5 rounded-full px-3 text-burgundy hover:bg-blush-soft"
              title={email ?? undefined}
            >
              Sign out <LogOut className="size-4" aria-hidden />
            </button>
          </div>
        </div>
        <nav aria-label="Admin sections" className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-5 no-scrollbar sm:px-8">
          {ADMIN_NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                cn('whitespace-nowrap border-b-2 px-4 py-3 font-medium transition-colors', isActive ? 'border-burgundy text-burgundy' : 'border-transparent text-muted hover:text-burgundy')
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <Outlet />
      </main>
      <Toaster />
    </div>
  )
}

export function NotConfigured() {
  return (
    <Notice tone="info">
      Supabase is not configured yet. Copy <code>.env.example</code> to <code>.env</code>, add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>, and restart the dev server.
    </Notice>
  )
}

export function MoveButtons({ index, count, onMove, onRemove, label }: { index: number; count: number; onMove: (to: number) => void; onRemove?: () => void; label: string }) {
  const b = 'grid size-10 place-items-center rounded-full text-burgundy hover:bg-blush-soft disabled:opacity-30 disabled:hover:bg-transparent'
  return (
    <div className="flex shrink-0 items-center">
      <button type="button" className={b} disabled={index === 0} onClick={() => onMove(index - 1)} aria-label={`Move ${label} up`}>
        <ArrowUp className="size-4" />
      </button>
      <button type="button" className={b} disabled={index === count - 1} onClick={() => onMove(index + 1)} aria-label={`Move ${label} down`}>
        <ArrowDown className="size-4" />
      </button>
      {onRemove && (
        <button type="button" className={b} onClick={onRemove} aria-label={`Remove ${label}`}>
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}

