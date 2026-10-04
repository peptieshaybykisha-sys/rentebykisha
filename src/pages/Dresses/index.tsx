import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import Container, { PageTitle } from '@/components/common/Container'
import { EmptyState } from '@/components/common/States'
import CategoryTabs, { type CategoryFilter } from '@/components/dresses/CategoryTabs'
import DressGrid from '@/components/dresses/DressGrid'
import { CATEGORIES } from '@/data/dresses'
import { useDressList, useDresses } from '@/hooks/useDresses'

export default function Dresses() {
  const [params, setParams] = useSearchParams()
  const SIZES = [...new Set(useDressList().flatMap((d) => d.sizes))]
  const rawCat = params.get('category') ?? 'All'
  const category = (CATEGORIES as string[]).includes(rawCat) ? (rawCat as CategoryFilter) : 'All'
  const q = params.get('q') ?? ''
  const size = (params.get('size') ?? '') 
  const availableOnly = params.get('available') === '1'

  const set = (key: string, value: string) =>
    setParams(
      (p) => {
        const n = new URLSearchParams(p)
        if (value && value !== 'All') n.set(key, value)
        else n.delete(key)
        return n
      },
      { replace: true },
    )

  const base = useDresses({ category, query: q, availableOnly })
  const list = size ? base.filter((d) => d.sizes.includes(size)) : base

  return (
    <Container className="pb-8">
      <PageTitle title="Dresses">Every gown in the boutique, ready for your dates.</PageTitle>
      <CategoryTabs value={category} onChange={(c) => set('category', c)} />

      <div className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-3">
        <div className="relative min-w-0 flex-1 basis-56">
          <label htmlFor="dress-search" className="sr-only">
            Search dresses
          </label>
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <input
            id="dress-search"
            type="search"
            value={q}
            onChange={(e) => set('q', e.target.value)}
            placeholder="Search by name or colour"
            className="min-h-11 w-full rounded-full border border-line bg-ivory pl-10 pr-4 focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="size-filter" className="text-sm text-muted">
            Size
          </label>
          <select
            id="size-filter"
            value={size}
            onChange={(e) => set('size', e.target.value)}
            className="min-h-11 rounded-full border border-line bg-ivory px-4 focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/20"
          >
            <option value="">Any</option>
            {SIZES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <label className="flex min-h-11 cursor-pointer items-center gap-2 text-[0.95rem]">
          <input
            type="checkbox"
            checked={availableOnly}
            onChange={(e) => set('available', e.target.checked ? '1' : '')}
            className="size-5 accent-[var(--color-burgundy)]"
          />
          Available only
        </label>
      </div>

      <p className="mt-8 text-center text-sm text-muted" aria-live="polite">
        {list.length} {list.length === 1 ? 'dress' : 'dresses'}
      </p>
      <div className="mt-6">
        {list.length ? (
          <DressGrid dresses={list} />
        ) : (
          <EmptyState title="No dresses match that" to="/dresses" cta="Clear filters">
            Try a different colour, size or occasion.
          </EmptyState>
        )}
      </div>
    </Container>
  )
}
