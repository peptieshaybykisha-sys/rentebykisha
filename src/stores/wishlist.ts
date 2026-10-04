import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './auth'
import { useCatalog } from './catalog'

interface WishlistState {
  ids: string[]
  toggle: (id: string) => void
  /** Merges the guest list with the saved one after login. */
  sync: (userId: string) => Promise<void>
  clear: () => void
}

/** Saved dresses live in the browser for guests and in the database for signed-in customers. */
export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => {
        const saved = get().ids.includes(id)
        set({ ids: saved ? get().ids.filter((x) => x !== id) : [...get().ids, id] })
        const uid = useAuthStore.getState().user?.id
        if (!uid || !supabase) return
        const op = saved
          ? supabase.from('wishlist').delete().eq('user_id', uid).eq('dress_id', id)
          : supabase.from('wishlist').upsert({ user_id: uid, dress_id: id })
        void op.then(({ error }) => {
          if (error) set({ ids: saved ? [...get().ids, id] : get().ids.filter((x) => x !== id) }) // roll back
        })
      },
      sync: async (userId) => {
        if (!supabase) return
        const { data } = await supabase.from('wishlist').select('dress_id').eq('user_id', userId)
        const remote = (data ?? []).map((r) => r.dress_id as string)
        const known = new Set(useCatalog.getState().dresses.map((d) => d.id))
        const local = get().ids.filter((id) => known.has(id))
        const extra = local.filter((id) => !remote.includes(id))
        if (extra.length) await supabase.from('wishlist').upsert(extra.map((dress_id) => ({ user_id: userId, dress_id })))
        set({ ids: [...new Set([...remote, ...local])] })
      },
      clear: () => set({ ids: [] }),
    }),
    { name: 'rente-wishlist', partialize: (s) => ({ ids: s.ids }) },
  ),
)
