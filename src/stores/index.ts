import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CartItem, CustomerInfo, Fulfillment } from '@/types'

export { useAuthStore } from './auth'
export { useWishlistStore } from './wishlist'

/* ---------- Cart ---------- */
interface CartState {
  items: CartItem[]
  add: (item: Omit<CartItem, 'addedAt'>) => void
  update: (dressId: string, patch: Partial<Pick<CartItem, 'size' | 'startDate' | 'endDate'>>) => void
  remove: (dressId: string) => void
  clear: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item) =>
        set((s) => ({
          items: [...s.items.filter((i) => i.dressId !== item.dressId), { ...item, addedAt: Date.now() }],
        })),
      update: (dressId, patch) =>
        set((s) => ({ items: s.items.map((i) => (i.dressId === dressId ? { ...i, ...patch } : i)) })),
      remove: (dressId) => set((s) => ({ items: s.items.filter((i) => i.dressId !== dressId) })),
      clear: () => set({ items: [] }),
    }),
    { name: 'rente-cart', storage: createJSONStorage(() => localStorage) },
  ),
)

/* ---------- Checkout draft (rental selections) ---------- */
interface CheckoutState {
  customer: CustomerInfo
  fulfillment: Fulfillment
  address: string
  notes: string
  setDraft: (patch: Partial<Omit<CheckoutState, 'setDraft' | 'reset'>>) => void
  reset: () => void
}

const emptyDraft = { customer: { name: '', email: '', phone: '' }, fulfillment: 'delivery' as Fulfillment, address: '', notes: '' }

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      ...emptyDraft,
      setDraft: (patch) => set(patch),
      reset: () => set(emptyDraft),
    }),
    { name: 'rente-checkout' },
  ),
)
