import { useMemo } from 'react'
import { useCatalog } from '@/stores/catalog'
import type { Category, Dress } from '@/types'

/** Non-reactive lookup for code outside React (API layer). Components should use the hooks below. */
export const getDress = (id: string): Dress | undefined => useCatalog.getState().dresses.find((d) => d.id === id)

export const useDressList = () => useCatalog((s) => s.dresses)
export const useCatalogStatus = () => useCatalog((s) => s.status)

export function useDress(id?: string) {
  const dresses = useDressList()
  const status = useCatalogStatus()
  return { dress: dresses.find((d) => d.id === id), loading: status === 'loading' }
}

export function useDressLookup() {
  const dresses = useDressList()
  return useMemo(() => {
    const map = new Map(dresses.map((d) => [d.id, d]))
    return (id: string) => map.get(id)
  }, [dresses])
}

export function useDresses(opts: { category?: Category | 'All'; query?: string; availableOnly?: boolean } = {}) {
  const { category = 'All', query = '', availableOnly = false } = opts
  const all = useDressList()
  return useMemo(() => {
    const q = query.trim().toLowerCase()
    return all.filter(
      (d) =>
        (category === 'All' || d.category === category) &&
        (!availableOnly || d.status === 'available') &&
        (!q || `${d.name} ${d.category} ${d.colorName}`.toLowerCase().includes(q)),
    )
  }, [all, category, query, availableOnly])
}
