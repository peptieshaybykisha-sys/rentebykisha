import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { NotConfigured } from '@/components/admin/AdminShell'
import { Notice } from '@/components/common/States'
import StatusBadge from '@/components/ui/StatusBadge'
import { ALL_STATUSES } from '@/constants/rental'
import { listRentals } from '@/lib/adminApi'
import { isSupabaseConfigured } from '@/lib/supabase'
import { formatPeso, formatRange } from '@/lib/utils'
import type { Rental, RentalStatus } from '@/types'

const ATTENTION: RentalStatus[] = ['Payment Verification', 'Return Due', 'Returned', 'Under Inspection']

export default function AdminRentals() {
  const [rentals, setRentals] = useState<Rental[] | null>(null)
  const [error, setError] = useState('')
  const [status, setStatus] = useState<RentalStatus | 'All' | 'Attention'>('Attention')
  const [q, setQ] = useState('')

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let cancelled = false
    listRentals()
      .then((r) => !cancelled && setRentals(r))
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : 'Could not load rentals.'))
    return () => {
      cancelled = true
    }
  }, [])

  if (!isSupabaseConfigured) return <NotConfigured />

  const term = q.trim().toLowerCase()
  const list = (rentals ?? []).filter(
    (r) =>
      (status === 'All' || (status === 'Attention' ? ATTENTION.includes(r.status) : r.status === status)) &&
      (!term || `${r.id} ${r.customer.name} ${r.customer.phone} ${r.customer.email}`.toLowerCase().includes(term)),
  )
  const toVerify = (rentals ?? []).filter((r) => r.status === 'Payment Verification').length

  return (
    <div>
      <h1 className="text-4xl">Rentals</h1>
      <p className="mb-6 text-muted">
        {toVerify ? `${toVerify} ${toVerify === 1 ? 'payment is' : 'payments are'} waiting to be verified.` : 'Verify payments and move rentals through each stage.'}
      </p>

      <div className="mb-5 flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="mb-1 block font-medium">Show</span>
          <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="min-h-11 rounded-xl border border-line bg-ivory px-3">
            <option value="Attention">Needs attention</option>
            <option value="All">All rentals</option>
            {ALL_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="min-w-0 flex-1 basis-56 text-sm">
          <span className="mb-1 block font-medium">Search</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rental number, name or phone" className="min-h-11 w-full rounded-xl border border-line bg-ivory px-3" />
        </label>
      </div>

      {error && <Notice className="mb-4">{error}</Notice>}
      {!rentals && !error && <p className="text-muted" aria-busy="true">Loading…</p>}
      {rentals && list.length === 0 && <p className="rounded-3xl border border-dashed border-blush p-10 text-center text-muted">No rentals match.</p>}
      {list.length > 0 && (
        <ul className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-ivory">
          {list.map((r) => {
            const start = r.items.map((i) => i.startDate).sort()[0]
            const end = r.items.map((i) => i.endDate).sort().at(-1)!
            return (
              <li key={r.id}>
                <Link to={`/admin/rentals/${r.id}`} className="flex flex-wrap items-center gap-x-6 gap-y-2 p-4 hover:bg-blush-soft/50">
                  <span className="min-w-0 flex-1 basis-56">
                    <span className="block font-serif text-2xl text-burgundy">#{r.id}</span>
                    <span className="block truncate text-[0.95rem]">
                      {r.customer.name} · {r.items.map((i) => i.name).join(', ')}
                    </span>
                    <span className="text-sm text-muted">{formatRange(start, end)}</span>
                  </span>
                  <span className="tabular-nums">{formatPeso(r.totals.total)}</span>
                  <StatusBadge status={r.status} />
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
