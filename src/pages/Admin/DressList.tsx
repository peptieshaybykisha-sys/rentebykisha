import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import DressPhoto from '@/components/dresses/DressPhoto'
import { ButtonLink } from '@/components/ui/Button'
import { ListSkeleton } from '@/components/ui/Skeleton'
import { useCatalogStatus, useDressList } from '@/hooks/useDresses'
import { formatPeso } from '@/lib/utils'

export default function DressList() {
  const dresses = useDressList()
  const status = useCatalogStatus()
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-4xl">Dresses</h1>
          <p className="text-muted">Add dresses, upload photos and choose the sizes each one comes in.</p>
        </div>
        <ButtonLink to="/admin/dresses/new">
          <Plus className="size-4" aria-hidden /> Add a dress
        </ButtonLink>
      </div>

      {status === 'error' && <p role="alert" className="mb-4 rounded-2xl bg-red-50 p-4 text-red-900">We could not load the dresses. Check that the database migration was run and your connection.</p>}

      {status === 'loading' ? (
        <ListSkeleton rows={5} label="Loading dresses…" />
      ) : dresses.length === 0 && status === 'ready' ? (
        <div className="rounded-3xl border border-dashed border-blush p-10 text-center">
          <p className="font-serif text-3xl text-burgundy">No dresses yet</p>
          <p className="mt-2 text-muted">Add your first dress with real photos. It appears on the site right away.</p>
        </div>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-ivory">
          {dresses.map((d) => (
            <li key={d.id}>
              <Link to={`/admin/dresses/${d.id}`} className="flex items-center gap-4 p-3 hover:bg-blush-soft/50 sm:p-4">
                <span className="block h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-blush-soft">
                  <DressPhoto dress={d} className="size-full object-cover" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-serif text-2xl text-burgundy">{d.name}</span>
                  <span className="block text-sm text-muted">
                    {d.category} · {formatPeso(d.price)} · Sizes: {d.sizes.join(', ') || 'none yet'}
                  </span>
                </span>
                <span className="hidden gap-2 text-sm sm:flex">
                  {d.featured && <span className="rounded-full bg-blush-soft px-3 py-1 text-burgundy">Featured</span>}
                  <span className={d.status === 'available' ? 'rounded-full bg-emerald-50 px-3 py-1 text-sage' : 'rounded-full bg-stone-100 px-3 py-1 text-muted'}>
                    {d.status === 'available' ? 'Available' : 'Unavailable'}
                  </span>
                  {d.images.length === 0 && <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-900">No photo</span>}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
