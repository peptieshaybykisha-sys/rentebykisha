import { ChevronLeft, ChevronRight } from 'lucide-react'

type Props = {
  page: number
  pageCount: number
  onChange: (page: number) => void
}

/** Returns page numbers with `null` marking an ellipsis gap. */
function pageItems(page: number, count: number): (number | null)[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1)
  const items: (number | null)[] = [1]
  const start = Math.max(2, page - 1)
  const end = Math.min(count - 1, page + 1)
  if (start > 2) items.push(null)
  for (let i = start; i <= end; i++) items.push(i)
  if (end < count - 1) items.push(null)
  items.push(count)
  return items
}

const btn =
  'inline-flex size-11 items-center justify-center rounded-full border border-line bg-ivory text-sm transition-colors hover:border-burgundy disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line'

export default function Pagination({ page, pageCount, onChange }: Props) {
  if (pageCount <= 1) return null
  return (
    <nav aria-label="Pagination" className="mt-12 flex flex-wrap items-center justify-center gap-2">
      <button type="button" className={btn} onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Previous page">
        <ChevronLeft className="size-4" aria-hidden />
      </button>
      {pageItems(page, pageCount).map((p, i) =>
        p === null ? (
          <span key={`gap-${i}`} className="px-1 text-muted" aria-hidden>
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-label={`Page ${p}`}
            aria-current={p === page ? 'page' : undefined}
            className={`${btn} ${p === page ? 'border-burgundy bg-burgundy text-ivory hover:border-burgundy' : ''}`}
          >
            {p}
          </button>
        ),
      )}
      <button type="button" className={btn} onClick={() => onChange(page + 1)} disabled={page >= pageCount} aria-label="Next page">
        <ChevronRight className="size-4" aria-hidden />
      </button>
    </nav>
  )
}
