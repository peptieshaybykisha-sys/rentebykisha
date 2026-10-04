import { useEffect, useState } from 'react'
import { NotConfigured } from '@/components/admin/AdminShell'
import { Notice } from '@/components/common/States'
import { Button } from '@/components/ui/Button'
import { ListSkeleton } from '@/components/ui/Skeleton'
import { useDressLookup } from '@/hooks/useDresses'
import { deleteFitting, listFittings } from '@/lib/adminApi'
import { isSupabaseConfigured } from '@/lib/supabase'
import { formatLong } from '@/lib/utils'
import type { FittingAppointment } from '@/types'

export default function AdminFittings() {
  const dress = useDressLookup()
  const [list, setList] = useState<FittingAppointment[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let cancelled = false
    listFittings()
      .then((r) => !cancelled && setList(r))
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : 'Could not load fittings.'))
    return () => {
      cancelled = true
    }
  }, [])

  if (!isSupabaseConfigured) return <NotConfigured />
  const today = new Date().toISOString().slice(0, 10)
  const upcoming = (list ?? []).filter((f) => f.date >= today)

  return (
    <div>
      <h1 className="text-4xl">Fittings</h1>
      <p className="mb-6 text-muted">Upcoming fitting appointments, soonest first.</p>
      {error && <Notice className="mb-4">{error}</Notice>}
      {!list && !error && <ListSkeleton rows={4} label="Loading fittings…" />}
      {list && upcoming.length === 0 && <p className="rounded-3xl border border-dashed border-blush p-10 text-center text-muted">No upcoming fittings.</p>}
      {upcoming.length > 0 && (
        <ul className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-ivory">
          {upcoming.map((f) => (
            <li key={f.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-serif text-2xl text-burgundy">
                  {formatLong(f.date)} · {f.time}
                </p>
                <p className="text-[0.95rem]">
                  {f.name} · {f.phone}
                </p>
                <p className="text-sm text-muted">{(f.dressId && dress(f.dressId)?.name) || 'Open fitting'}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  try {
                    await deleteFitting(f.id)
                    setList((cur) => cur?.filter((x) => x.id !== f.id) ?? null)
                  } catch (e) {
                    setError(e instanceof Error ? e.message : 'Could not remove that fitting.')
                  }
                }}
              >
                Cancel
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
