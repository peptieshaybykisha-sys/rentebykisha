import { create } from 'zustand'
import { addressFromRow, fittingFromRow, rentalFromRow } from '@/lib/mappers'
import { supabase } from '@/lib/supabase'
import type { Address, FittingAppointment, Rental } from '@/types'
import { useAuthStore } from './auth'
import { useWishlistStore } from './wishlist'

interface AccountState {
  rentals: Rental[]
  fittings: FittingAppointment[]
  addresses: Address[]
  loaded: boolean
  error: boolean
  load: () => Promise<void>
  clear: () => void
}

/** The signed-in customer's own data. Row level security guarantees nothing else is ever returned. */
export const useAccount = create<AccountState>()((set) => ({
  rentals: [],
  fittings: [],
  addresses: [],
  loaded: false,
  error: false,
  load: async () => {
    if (!supabase) return set({ loaded: true })
    const [rentals, fittings, addresses] = await Promise.all([
      supabase.from('rentals').select('*, rental_items(*)').order('created_at', { ascending: false }),
      supabase.from('fittings').select('*').order('fit_date', { ascending: true }),
      supabase.from('addresses').select('*').order('created_at', { ascending: true }),
    ])
    if (rentals.error || fittings.error || addresses.error) return set({ error: true, loaded: true })
    set({
      error: false,
      loaded: true,
      rentals: rentals.data.map(rentalFromRow),
      fittings: fittings.data.map(fittingFromRow),
      addresses: addresses.data.map(addressFromRow),
    })
  },
  clear: () => set({ rentals: [], fittings: [], addresses: [], loaded: false, error: false }),
}))

let started = false

/** Loads the customer's data after login, clears it on logout, and refreshes rentals live when staff update them. */
export function startAccount() {
  if (started) return
  started = true
  let channel: ReturnType<NonNullable<typeof supabase>['channel']> | null = null

  useAuthStore.subscribe((state, prev) => {
    const uid = state.user?.id
    if (uid === prev.user?.id) return
    if (channel) void supabase?.removeChannel(channel)
    channel = null
    if (!uid || !supabase) {
      useAccount.getState().clear()
      useWishlistStore.getState().clear()
      return
    }
    void useAccount.getState().load()
    void useWishlistStore.getState().sync(uid)
    channel = supabase
      .channel(`rentals-${uid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rentals', filter: `user_id=eq.${uid}` }, () => void useAccount.getState().load())
      .subscribe()
  })
}
