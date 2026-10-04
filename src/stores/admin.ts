import { doc, getDoc } from 'firebase/firestore'
import { create } from 'zustand'
import { app, db } from '@/lib/firebase'

interface AdminState {
  email: string | null
  uid: string | null
  isAdmin: boolean
  ready: boolean
}

export const useAdmin = create<AdminState>()(() => ({ email: null, uid: null, isAdmin: false, ready: false }))

let started: Promise<void> | null = null

/** Loads Firebase Auth on demand (admin area only) and tracks the signed-in admin. */
export function startAdminAuth() {
  if (started) return started
  started = (async () => {
    if (!app || !db) {
      useAdmin.setState({ ready: true })
      return
    }
    const { getAuth, onAuthStateChanged } = await import('firebase/auth')
    onAuthStateChanged(getAuth(app), async (u) => {
      if (!u) return useAdmin.setState({ email: null, uid: null, isAdmin: false, ready: true })
      const isAdmin = await getDoc(doc(db!, 'admins', u.uid))
        .then((d) => d.exists())
        .catch(() => false)
      useAdmin.setState({ email: u.email, uid: u.uid, isAdmin, ready: true })
    })
  })()
  return started
}

export async function adminSignIn(email: string, password: string) {
  if (!app) throw new Error('Firebase is not configured.')
  const { getAuth, signInWithEmailAndPassword } = await import('firebase/auth')
  await signInWithEmailAndPassword(getAuth(app), email, password)
}

export async function adminSignOut() {
  if (!app) return
  const { getAuth, signOut } = await import('firebase/auth')
  await signOut(getAuth(app))
}
