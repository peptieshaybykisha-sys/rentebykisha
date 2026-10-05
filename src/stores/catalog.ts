import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Dress, HeroContent, HowItWorksContent, NavigationContent, SizeGuideContent, TermsContent } from '@/types'

interface CatalogState {
  dresses: Dress[]
  howItWorks: HowItWorksContent | null
  hero: HeroContent | null
  navigation: NavigationContent | null
  terms: TermsContent | null
  status: 'loading' | 'ready' | 'error'
  /** True once the settings rows have been read (even when none exist yet). */
  settingsReady: boolean
}

export const useCatalog = create<CatalogState>()(() => ({
  dresses: [],
  howItWorks: null,
  hero: null,
  navigation: null,
  terms: null,
  status: 'loading',
  settingsReady: false,
}))

const isVideo = (v: unknown): v is NonNullable<Dress['video']> =>
  typeof v === 'object' && v !== null && typeof (v as Record<string, unknown>).url === 'string' && typeof (v as Record<string, unknown>).path === 'string'

/** Maps a snake_case database row to the app's Dress shape. */
export function dressFromRow(r: Record<string, unknown>): Dress {
  const arr = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : [])
  return {
    id: String(r.id),
    name: String(r.name ?? 'Untitled dress'),
    category: (r.category as Dress['category']) ?? 'Long Dress',
    colorName: String(r.color_name ?? ''),
    price: Number(r.price ?? 0),
    deposit: Number(r.deposit ?? 0),
    sizes: arr<string>(r.sizes),
    description: String(r.description ?? ''),
    details: arr<string>(r.details),
    images: arr<Dress['images'][number]>(r.images),
    video: isVideo(r.video) ? r.video : null,
    sizeGuide: (r.size_guide as SizeGuideContent | null) ?? null,
    status: r.status === 'unavailable' ? 'unavailable' : 'available',
    bookedRanges: arr<Dress['bookedRanges'][number]>(r.booked_ranges),
    featured: Boolean(r.featured),
    createdAt: r.created_at ? Date.parse(String(r.created_at)) : 0,
  }
}

/** Re-reads the catalogue, e.g. after a checkout changes which dates are reserved. */
export async function refreshCatalog() {
  await load()
}

async function load() {
  if (!supabase) return
  const [dresses, settings, reserved] = await Promise.all([
    supabase.from('dresses').select('*').order('created_at', { ascending: true }),
    supabase.from('settings').select('key, value'),
    supabase.rpc('dress_reserved_ranges'),
  ])
  const byDress = new Map<string, Dress['bookedRanges']>()
  for (const r of (reserved.data ?? []) as { dress_id: string; start_date: string; end_date: string }[])
    byDress.set(r.dress_id, [...(byDress.get(r.dress_id) ?? []), { start: r.start_date, end: r.end_date }])
  if (dresses.error) {
    useCatalog.setState({ status: 'error', settingsReady: true })
    return
  }
  const next: Partial<CatalogState> = {
    dresses: dresses.data.map((r) => ({ ...dressFromRow(r), reservedRanges: byDress.get(String(r.id)) ?? [] })),
    status: 'ready',
    settingsReady: true,
    howItWorks: null,
    hero: null,
    navigation: null,
    terms: null,
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
  // Reserved dates change when other customers book, and customers cannot subscribe to rentals.
  document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && void load())
}
