import { collection, doc, onSnapshot } from 'firebase/firestore'
import { create } from 'zustand'
import { db } from '@/lib/firebase'
import type { Dress, HeroContent, HowItWorksContent, SizeGuideContent } from '@/types'

interface CatalogState {
  dresses: Dress[]
  sizeGuide: SizeGuideContent | null
  howItWorks: HowItWorksContent | null
  hero: HeroContent | null
  status: 'loading' | 'ready' | 'error'
  /** True once each settings document has been read (even when it does not exist yet). */
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

export function normalizeDress(id: string, d: Record<string, unknown>): Dress {
  const arr = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : [])
  return {
    id,
    name: String(d.name ?? 'Untitled dress'),
    category: (d.category as Dress['category']) ?? 'Evening',
    colorName: String(d.colorName ?? ''),
    price: Number(d.price ?? 0),
    deposit: Number(d.deposit ?? 0),
    sizes: arr<string>(d.sizes),
    description: String(d.description ?? ''),
    details: arr<string>(d.details),
    images: arr<Dress['images'][number]>(d.images),
    status: d.status === 'unavailable' ? 'unavailable' : 'available',
    bookedRanges: arr<Dress['bookedRanges'][number]>(d.bookedRanges),
    featured: Boolean(d.featured),
    createdAt: typeof d.createdAt === 'number' ? d.createdAt : 0,
  }
}

let started = false

/** Subscribes once to the dress collection and the editable site settings. */
export function startCatalog() {
  if (started) return
  started = true
  if (!db) {
    useCatalog.setState({ status: 'ready', settingsReady: true })
    return
  }
  const fail = () => useCatalog.setState({ status: 'error' })
  onSnapshot(
    collection(db, 'dresses'),
    (snap) => {
      const dresses = snap.docs
        .map((x) => normalizeDress(x.id, x.data()))
        .sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0) || a.name.localeCompare(b.name))
      useCatalog.setState({ dresses, status: 'ready' })
    },
    fail,
  )
  const seen = new Set<string>()
  const setting = (key: 'sizeGuide' | 'howItWorks' | 'hero') =>
    onSnapshot(
      doc(db!, 'settings', key),
      (s) => {
        seen.add(key)
        useCatalog.setState({ [key]: s.exists() ? s.data() : null, settingsReady: seen.size === 3 } as unknown as Partial<CatalogState>)
      },
      () => useCatalog.setState({ settingsReady: true }),
    )
  setting('sizeGuide')
  setting('howItWorks')
  setting('hero')
}
