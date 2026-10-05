import { useMemo } from 'react'
import defaultShowroom from '@/assets/closets1.jpg'
import { DEFAULT_SHOWROOM } from '@/constants/home'
import { DEFAULT_HOW_IT_WORKS } from '@/constants/howItWorks'
import { DEFAULT_NAVIGATION } from '@/constants/navigation'
import { useCatalog } from '@/stores/catalog'

export const useHowItWorks = () => useCatalog((s) => s.howItWorks) ?? DEFAULT_HOW_IT_WORKS

export const useNavigation = () => useCatalog((s) => s.navigation) ?? DEFAULT_NAVIGATION

export const useTerms = () => useCatalog((s) => s.terms)

export interface ShowroomView {
  src: string
  focusX: number
  focusY: number
  zoom: number
  brightness: number
}

const num = (v: unknown, fallback: number) => (typeof v === 'number' && Number.isFinite(v) ? v : fallback)

/** The photo behind the boutique doors: the admin's upload and adjustments, else the built-in closet photo. */
export function useShowroom(): ShowroomView {
  const hero = useCatalog((s) => s.hero)
  return useMemo(
    () => ({
      src: hero?.image?.url || defaultShowroom,
      focusX: num(hero?.focusX, DEFAULT_SHOWROOM.focusX),
      focusY: num(hero?.focusY, DEFAULT_SHOWROOM.focusY),
      zoom: num(hero?.zoom, DEFAULT_SHOWROOM.zoom),
      brightness: num(hero?.brightness, DEFAULT_SHOWROOM.brightness),
    }),
    [hero],
  )
}
