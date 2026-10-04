import type { Session } from '@supabase/supabase-js'
import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

interface AdminState {
  email: string | null
  uid: string | null
  isAdmin: boolean
  ready: boolean
}

export const useAdmin = create<AdminState>()(() => ({ email: null, uid: null, isAdmin: false, ready: false }))

async function apply(session: Session | null) {
  if (!session || !supabase) return useAdmin.setState({ email: null, uid: null, isAdmin: false, ready: true })
  const { data } = await supabase.from('admins').select('user_id').eq('user_id', session.user.id).maybeSingle()
  useAdmin.setState({ email: session.user.email ?? null, uid: session.user.id, isAdmin: !!data, ready: true })
}

let started: Promise<void> | null = null

/** Tracks the signed-in admin. Safe to call from several components. */
export function startAdminAuth() {
  if (started) return started
  started = (async () => {
    if (!supabase) return void useAdmin.setState({ ready: true })
    await apply((await supabase.auth.getSession()).data.session)
    // Deferred: calling Supabase inside this callback synchronously can deadlock the auth client.
    supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => void apply(session), 0)
    })
  })()
  return started
}

export async function adminSignIn(email: string, password: string) {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)
}

export async function adminSignOut() {
  await supabase?.auth.signOut()
}
