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

/* ---------- Toasts ---------- */
export interface Toast {
  id: number
  message: string
  to?: { label: string; href: string }
}
interface ToastState {
  toasts: Toast[]
  push: (message: string, to?: Toast['to']) => void
  dismiss: (id: number) => void
}
let toastId = 0
export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],
  push: (message, to) => {
    const id = ++toastId
    set((s) => ({ toasts: [...s.toasts.slice(-2), { id, message, to }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 4500)
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
