import { useMemo } from 'react'
import { DEFAULT_HOW_IT_WORKS, DEFAULT_SIZE_GUIDE } from '@/data/defaults'
import { useCatalog } from '@/stores/catalog'
import type { Dress } from '@/types'

export const useSizeGuide = () => useCatalog((s) => s.sizeGuide) ?? DEFAULT_SIZE_GUIDE
export const useHowItWorks = () => useCatalog((s) => s.howItWorks) ?? DEFAULT_HOW_IT_WORKS

export const hasPhoto = (d: Dress) => d.images.length > 0

/** Dresses shown behind the boutique doors: the admin's picks, else featured, else any with photos. */
export function useHeroDresses(): Dress[] {
  const dresses = useCatalog((s) => s.dresses)
  const hero = useCatalog((s) => s.hero)
  return useMemo(() => {
    const picked = (hero?.dressIds ?? [])
      .map((id) => dresses.find((d) => d.id === id))
      .filter((d): d is Dress => !!d && hasPhoto(d))
    if (picked.length) return picked.slice(0, 5)
    const withPhoto = dresses.filter(hasPhoto)
    return [...withPhoto.filter((d) => d.featured), ...withPhoto.filter((d) => !d.featured)].slice(0, 5)
  }, [dresses, hero])
}
