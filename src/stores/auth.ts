import type { Session } from '@supabase/supabase-js'
import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  /** True when this account is listed in the admins table. */
  isAdmin: boolean
  /** False until the saved session has been checked, so guards do not redirect too early. */
  ready: boolean
}

export const useAuthStore = create<AuthState>()(() => ({ user: null, ready: false, isAdmin: false }))

export async function applySession(session: Session | null) {
  if (!session || !supabase) return useAuthStore.setState({ user: null, ready: true, isAdmin: false })
  const [{ data: profile }, { data: admin }] = await Promise.all([
    supabase.from('profiles').select('name, phone').eq('id', session.user.id).maybeSingle(),
    supabase.from('admins').select('user_id').eq('user_id', session.user.id).maybeSingle(),
  ])
  const meta = session.user.user_metadata as { name?: string; phone?: string }
  useAuthStore.setState({
    ready: true,
    isAdmin: !!admin,
    user: {
      id: session.user.id,
      email: session.user.email ?? '',
      name: profile?.name || meta.name || '',
      phone: profile?.phone || meta.phone || '',
    },
  })
}

let started = false

/** Restores the saved session and keeps the store in sync with sign-in, sign-out and token refresh. */
export function startAuth() {
  if (started) return
  started = true
  if (!supabase) return useAuthStore.setState({ ready: true })
  void supabase.auth.getSession().then(({ data }) => applySession(data.session))
  // Deferred: calling Supabase inside this callback synchronously can deadlock the auth client.
  supabase.auth.onAuthStateChange((_event, session) => {
    setTimeout(() => void applySession(session), 0)
  })
}
