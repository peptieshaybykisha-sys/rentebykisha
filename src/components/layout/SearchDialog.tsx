import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import Dialog from '@/components/ui/Dialog'
import DressPhoto from '@/components/dresses/DressPhoto'
import { useDresses } from '@/hooks/useDresses'
import { formatPeso } from '@/lib/utils'

export default function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('')
  const navigate = useNavigate()
  const results = useDresses({ query: q })

  return (
    <Dialog open={open} onClose={onClose} title="Search dresses">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault()
          onClose()
          navigate(`/dresses${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`)
        }}
      >
        <label htmlFor="site-search" className="sr-only">
          Search by name, colour or occasion
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden />
          <input
            id="site-search"
            type="search"
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Try “burgundy” or “bridal”"
            className="min-h-12 w-full rounded-full border border-line bg-ivory pl-12 pr-4 text-base focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/20"
          />
        </div>
      </form>
      <ul className="mt-4 space-y-1" aria-live="polite">
        {results.slice(0, 5).map((d) => (
          <li key={d.id}>
            <Link to={`/dresses/${d.id}`} onClick={onClose} className="flex items-center gap-4 rounded-2xl p-2 hover:bg-blush-soft">
              <span className="block h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-blush-soft">
                <DressPhoto dress={d} className="size-full object-cover" />
              </span>
              <span className="flex-1">
                <span className="block font-serif text-xl leading-tight text-burgundy">{d.name}</span>
                <span className="text-sm text-muted">{d.category} · {formatPeso(d.price)}</span>
              </span>
            </Link>
          </li>
        ))}
        {results.length === 0 && <li className="px-2 py-6 text-center text-muted">No dresses match “{q}”.</li>}
      </ul>
    </Dialog>
  )
}
