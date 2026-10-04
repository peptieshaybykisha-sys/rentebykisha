import { useMemo } from 'react'
import { dresses } from '@/data/dresses'
import type { Category, Dress } from '@/types'

/** Data-access seam: swap these for API calls (e.g. React Query) when a backend exists. */
export const getDress = (id: string): Dress | undefined => dresses.find((d) => d.id === id)

export function useDresses(opts: { category?: Category | 'All'; query?: string; availableOnly?: boolean } = {}) {
  const { category = 'All', query = '', availableOnly = false } = opts
  return useMemo(() => {
    const q = query.trim().toLowerCase()
    return dresses.filter(
      (d) =>
        (category === 'All' || d.category === category) &&
        (!availableOnly || d.status === 'available') &&
        (!q || `${d.name} ${d.category} ${d.colorName}`.toLowerCase().includes(q)),
    )
  }, [category, query, availableOnly])
}
