/**
 * Customer API on Supabase. Every function throws ApiError with a message that is safe to show people.
 * Security does not depend on this file: row level security and the database functions enforce the rules.
 */
import { supabase } from './supabase'
import { refreshCatalog } from '@/stores/catalog'
import { useAccount } from '@/stores/account'
import { applySession } from '@/stores/auth'
import type { CartItem, CustomerInfo, Fulfillment } from '@/types'

export class ApiError extends Error {}

const RECEIPT_BUCKET = 'receipts'

const client = () => {
  if (!supabase) throw new ApiError('The shop is not connected to its database yet.')
  return supabase
}

function friendly(message: string): string {
  if (/invalid login credentials/i.test(message)) return 'That email and password do not match. Please try again.'
  if (/email not confirmed/i.test(message)) return 'Please confirm your email first. We sent you a link when you signed up.'
  if (/already registered|already been registered/i.test(message)) return 'An account with this email already exists. Try logging in instead.'
  if (/rate limit|too many/i.test(message)) return 'Too many attempts. Please wait a minute and try again.'
  if (/failed to fetch|network|load failed/i.test(message)) return 'We could not reach the server. Please check your connection and try again.'
  if (/password should be at least/i.test(message)) return 'Please choose a longer password.'
  return message
}

const check = (error: { message: string } | null) => {
  if (error) throw new ApiError(friendly(error.message))
}

/* ---------------- auth ---------------- */
export async function login(email: string, password: string) {
  check((await client().auth.signInWithPassword({ email, password })).error)
}

export async function register(data: { name: string; email: string; phone: string; password: string }) {
  const { data: res, error } = await client().auth.signUp({
    email: data.email,
    password: data.password,
    options: { data: { name: data.name, phone: data.phone }, emailRedirectTo: `${window.location.origin}/login` },
  })
  check(error)
  // Supabase hides whether an email exists; an empty identities list means it already does.
  if (res.user && res.user.identities?.length === 0) throw new ApiError('An account with this email already exists. Try logging in instead.')
  return { needsConfirmation: !res.session }
}

export async function logout() {
  await client().auth.signOut()
}

export async function requestPasswordReset(email: string) {
  check((await client().auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` })).error)
}

export async function updatePassword(password: string) {
  check((await client().auth.updateUser({ password })).error)
}

export async function updateProfile(id: string, patch: { name: string; phone: string }) {
  const sb = client()
  check((await sb.from('profiles').update(patch).eq('id', id)).error)
  await applySession((await sb.auth.getSession()).data.session)
}

/* ---------------- rentals ---------------- */
export interface CreateRentalInput {
  userId: string
  items: CartItem[]
  customer: CustomerInfo
  fulfillment: Fulfillment
  address?: string
  notes?: string
  receipt: { name: string; dataUrl: string }
}

/** Uploads the receipt privately, then creates the rental in one validated database call. */
export async function createRental(input: CreateRentalInput): Promise<string> {
  const sb = client()
  const blob = await fetch(input.receipt.dataUrl).then((r) => r.blob())
  const path = `${input.userId}/${Date.now()}.jpg`
  const upload = await sb.storage.from(RECEIPT_BUCKET).upload(path, blob, { contentType: 'image/jpeg' })
  if (upload.error) throw new ApiError('We could not upload your receipt. Please try again.')

  const { data, error } = await sb.rpc('create_rental', {
    p_items: input.items.map((i) => ({ dressId: i.dressId, size: i.size, startDate: i.startDate, endDate: i.endDate })),
    p_customer: input.customer,
    p_fulfillment: input.fulfillment,
    p_address: input.address ?? null,
    p_notes: input.notes ?? null,
    p_receipt_path: path,
  })
  if (error) {
    await sb.storage.from(RECEIPT_BUCKET).remove([path]) // do not leave orphan receipts behind
    throw new ApiError(friendly(error.message))
  }
  await Promise.all([useAccount.getState().load(), refreshCatalog()])
  return data as string
}

export async function cancelRental(id: string) {
  check((await client().rpc('cancel_rental', { p_id: id })).error)
  await Promise.all([useAccount.getState().load(), refreshCatalog()])
}

/** A short-lived link to a private receipt image. */
export async function receiptUrl(path: string): Promise<string | null> {
  const { data } = await client().storage.from(RECEIPT_BUCKET).createSignedUrl(path, 3600)
  return data?.signedUrl ?? null
}

/* ---------------- fittings ---------------- */
export async function bookFitting(input: { name: string; phone: string; dressId?: string; date: string; time: string }) {
  const { error } = await client().rpc('book_fitting', {
    p_name: input.name,
    p_phone: input.phone,
    p_dress: input.dressId ?? null,
    p_date: input.date,
    p_time: input.time,
  })
  check(error)
  await useAccount.getState().load()
}

export async function takenSlots(date: string): Promise<string[]> {
  const { data, error } = await client().rpc('fitting_taken', { p_date: date })
  check(error)
  return (data as string[]) ?? []
}

export async function cancelFitting(id: string) {
  check((await client().from('fittings').delete().eq('id', id)).error)
  await useAccount.getState().load()
}

/* ---------------- addresses ---------------- */
export async function saveAddress(a: { label: string; line1: string; city: string }) {
  check((await client().from('addresses').insert(a)).error)
  await useAccount.getState().load()
}

export async function removeAddress(id: string) {
  check((await client().from('addresses').delete().eq('id', id)).error)
  await useAccount.getState().load()
}
