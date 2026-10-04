import { memo } from 'react'
import { Link } from 'react-router-dom'
import { formatPeso } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Dress } from '@/types'
import DressPhoto from './DressPhoto'
import WishlistButton from './WishlistButton'

export function AvailabilityDot({ available, className }: { available: boolean; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-sm', available ? 'text-sage' : 'text-muted', className)}>
      <span aria-hidden className={cn('size-2 rounded-full', available ? 'bg-sage' : 'bg-stone-400')} />
      {available ? 'Available' : 'Unavailable'}
    </span>
  )
}

function DressCard({ dress }: { dress: Dress }) {
  const available = dress.status === 'available'
  return (
    <article className="group relative">
      <div className="relative aspect-[3/4] overflow-hidden rounded-[1.75rem] bg-blush-soft">
        <DressPhoto
          dress={dress}
          className={cn('size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]', !available && 'opacity-60 saturate-50')}
        />
        <WishlistButton dressId={dress.id} name={dress.name} className="absolute right-3 top-3 z-10" />
      </div>
      <div className="px-1 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[1.65rem] leading-tight">
              <Link
                to={`/dresses/${dress.id}`}
                className="after:absolute after:inset-0 after:z-0 after:content-[''] focus-visible:outline-offset-8"
              >
                {dress.name}
              </Link>
            </h3>
            <p className="mt-0.5 text-[0.95rem] text-muted">{dress.category} Collection</p>
          </div>
          <AvailabilityDot available={available} className="mt-1.5 shrink-0" />
        </div>
        <p className="mt-3 text-lg text-ink">
          {formatPeso(dress.price)} <span className="text-[0.95rem] text-muted">/ rental</span>
        </p>
        <p className="link-underline mt-2 inline-block text-[0.95rem] font-medium text-burgundy transition-transform duration-300 group-hover:translate-x-1">
          View Dress →
        </p>
      </div>
    </article>
  )
}

export default memo(DressCard)
