import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Address, CartItem, CustomerInfo, FittingAppointment, Fulfillment, Rental, User } from '@/types'

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

/* ---------- Wishlist ---------- */
interface WishlistState {
  ids: string[]
  toggle: (id: string) => void
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      ids: [],
      toggle: (id) => set((s) => ({ ids: s.ids.includes(id) ? s.ids.filter((x) => x !== id) : [...s.ids, id] })),
    }),
    { name: 'rente-wishlist' },
  ),
)

/* ---------- Session ---------- */
interface AuthState {
  user: User | null
  setUser: (u: User | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({ user: null, setUser: (user) => set({ user }) }),
    { name: 'rente-session' },
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

/* ---------- Mock database (stands in for the backend) ---------- */
export interface StoredUser extends User {
  password: string // demo only — a real backend stores a hash
}

interface MockDbState {
  users: StoredUser[]
  rentals: Rental[]
  fittings: FittingAppointment[]
  addresses: Record<string, Address[]>
}

export const useMockDb = create<MockDbState>()(
  persist(
    () => ({
      users: [] as StoredUser[],
      rentals: [] as Rental[],
      fittings: [] as FittingAppointment[],
      addresses: {} as Record<string, Address[]>,
    }),
    { name: 'rente-mockdb' },
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
