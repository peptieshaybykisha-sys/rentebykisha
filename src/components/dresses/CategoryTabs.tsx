import { motion } from 'motion/react'
import { useId } from 'react'
import { CATEGORY_FILTERS } from '@/constants/catalog'
import { cn } from '@/lib/utils'
import type { CategoryFilter } from '@/types'

export type { CategoryFilter }

/** Quiet text navigation — no filter panels. */
export default function CategoryTabs({ value, onChange, className }: { value: CategoryFilter; onChange: (c: CategoryFilter) => void; className?: string }) {
  const uid = useId()
  return (
    <nav aria-label="Dress categories" className={cn('-mx-5 overflow-x-auto px-5 no-scrollbar sm:mx-0 sm:px-0', className)}>
      <ul className="flex min-w-max gap-1 sm:min-w-0 sm:flex-wrap sm:justify-center sm:gap-3">
        {CATEGORY_FILTERS.map((c) => {
          const active = c === value
          return (
            <li key={c}>
              <button
                type="button"
                onClick={() => onChange(c)}
                aria-pressed={active}
                className={cn(
                  'relative min-h-11 px-3 font-serif text-[1.35rem] transition-colors sm:px-4',
                  active ? 'text-burgundy' : 'text-muted hover:text-burgundy',
                )}
              >
                {c}
                {active && (
                  <motion.span
                    layoutId={`cat-${uid}`}
                    className="absolute inset-x-3 bottom-1 h-px bg-gold sm:inset-x-4"
                    transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                  />
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
