import { useEffect, useState } from 'react'
import { NotConfigured } from '@/components/admin/AdminShell'
import { Notice } from '@/components/common/States'
import { listUsers, setUserRole, type UserRow } from '@/lib/adminApi'
import { isSupabaseConfigured } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { useToastStore } from '@/stores'
import { useAuthStore } from '@/stores'

export default function AdminUsers() {
  const me = useAuthStore((s) => s.user?.id)
  const push = useToastStore((s) => s.push)
  const [users, setUsers] = useState<UserRow[] | null>(null)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let cancelled = false
    listUsers()
      .then((r) => !cancelled && setUsers(r))
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : 'Could not load users.'))
    return () => {
      cancelled = true
    }
  }, [version])

  if (!isSupabaseConfigured) return <NotConfigured />

  const term = q.trim().toLowerCase()
  const list = (users ?? []).filter((u) => !term || `${u.name} ${u.email} ${u.phone}`.toLowerCase().includes(term))
  const admins = (users ?? []).filter((u) => u.role === 'admin').length

  const change = async (u: UserRow, role: UserRow['role']) => {
    setBusy(u.id)
    setError('')
    try {
      await setUserRole(u.id, role)
      push(role === 'admin' ? `${u.name || u.email} is now an admin.` : `${u.name || u.email} is now a customer.`)
      setVersion((v) => v + 1)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'We could not change that role.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div>
      <h1 className="text-4xl">Users</h1>
      <p className="mb-6 text-muted">
        Customers can rent and manage their own account. Admins can also manage rentals, dresses and site content. {users && `${admins} admin${admins === 1 ? '' : 's'}, ${users.length - admins} customer${users.length - admins === 1 ? '' : 's'}.`}
      </p>

      <label className="mb-5 block max-w-md text-sm">
        <span className="mb-1 block font-medium">Search</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, email or phone" className="min-h-11 w-full rounded-xl border border-line bg-ivory px-3" />
      </label>

      {error && <Notice className="mb-4">{error}</Notice>}
      {!users && !error && <p className="text-muted" aria-busy="true">Loading…</p>}
      {users && list.length === 0 && <p className="rounded-3xl border border-dashed border-blush p-10 text-center text-muted">No users match.</p>}
      {list.length > 0 && (
        <ul className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-ivory">
          {list.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0 flex-1 basis-56">
                <p className="truncate font-medium">
                  {u.name || 'No name'} {u.id === me && <span className="text-sm text-muted">(you)</span>}
                </p>
                <p className="truncate text-sm text-muted">
                  {u.email}
                  {u.phone && ` · ${u.phone}`}
                </p>
              </div>
              <label className="text-sm">
                <span className="sr-only">Role for {u.name || u.email}</span>
                <select
                  value={u.role}
                  disabled={busy === u.id || u.id === me}
                  title={u.id === me ? 'You cannot change your own role' : undefined}
                  onChange={(e) => change(u, e.target.value as UserRow['role'])}
                  className={cn('min-h-11 rounded-full border px-4 font-medium', u.role === 'admin' ? 'border-burgundy bg-burgundy text-ivory' : 'border-line bg-ivory')}
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
