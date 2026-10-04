import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Dress, HeroContent, HowItWorksContent, SizeGuideContent } from '@/types'

interface CatalogState {
  dresses: Dress[]
  sizeGuide: SizeGuideContent | null
  howItWorks: HowItWorksContent | null
  hero: HeroContent | null
  status: 'loading' | 'ready' | 'error'
  /** True once the settings rows have been read (even when none exist yet). */
  settingsReady: boolean
}

export const useCatalog = create<CatalogState>()(() => ({
  dresses: [],
  sizeGuide: null,
  howItWorks: null,
  hero: null,
  status: 'loading',
  settingsReady: false,
}))

/** Maps a snake_case database row to the app's Dress shape. */
export function dressFromRow(r: Record<string, unknown>): Dress {
  const arr = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : [])
  return {
    id: String(r.id),
    name: String(r.name ?? 'Untitled dress'),
    category: (r.category as Dress['category']) ?? 'Evening',
    colorName: String(r.color_name ?? ''),
    price: Number(r.price ?? 0),
    deposit: Number(r.deposit ?? 0),
    sizes: arr<string>(r.sizes),
    description: String(r.description ?? ''),
    details: arr<string>(r.details),
    images: arr<Dress['images'][number]>(r.images),
    status: r.status === 'unavailable' ? 'unavailable' : 'available',
    bookedRanges: arr<Dress['bookedRanges'][number]>(r.booked_ranges),
    featured: Boolean(r.featured),
    createdAt: r.created_at ? Date.parse(String(r.created_at)) : 0,
  }
}

async function load() {
  if (!supabase) return
  const [dresses, settings] = await Promise.all([
    supabase.from('dresses').select('*').order('created_at', { ascending: true }),
    supabase.from('settings').select('key, value'),
  ])
  if (dresses.error) {
    useCatalog.setState({ status: 'error', settingsReady: true })
    return
  }
  const next: Partial<CatalogState> = {
    dresses: dresses.data.map(dressFromRow),
    status: 'ready',
    settingsReady: true,
    sizeGuide: null,
    howItWorks: null,
    hero: null,
  }
  for (const row of settings.data ?? []) (next as Record<string, unknown>)[row.key] = row.value
  useCatalog.setState(next)
}

let started = false

/** Loads the catalogue and site content once, then refreshes whenever an admin saves a change. */
export function startCatalog() {
  if (started) return
  started = true
  if (!supabase) {
    useCatalog.setState({ status: 'ready', settingsReady: true })
    return
  }
  void load()
  supabase
    .channel('catalog')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'dresses' }, () => void load())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, () => void load())
    .subscribe()
}
