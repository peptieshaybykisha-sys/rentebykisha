/** Admin-only writes to Supabase. Row level security rejects anyone who is not in the admins table. */
import { PHOTO_BUCKET, supabase } from './supabase'
import { imageToBlob } from './image'
import { fittingFromRow, rentalFromRow } from './mappers'
import type { Dress, DressImage, FittingAppointment, PaymentStatus, Rental, RentalStatus } from '@/types'

const client = () => {
  if (!supabase) throw new Error('Supabase is not configured. Add your keys to .env and restart.')
  return supabase
}

const check = (error: { message: string } | null) => {
  if (error) throw new Error(error.message)
}

export const newDressId = () => crypto.randomUUID()

export async function saveDress(id: string, data: Omit<Dress, 'id' | 'createdAt'> & { createdAt?: number }) {
  const row: Record<string, unknown> = {
    id,
    name: data.name,
    category: data.category,
    color_name: data.colorName,
    price: data.price,
    deposit: data.deposit,
    description: data.description,
    details: data.details,
    sizes: data.sizes,
    images: data.images,
    status: data.status,
    booked_ranges: data.bookedRanges,
    featured: data.featured ?? false,
  }
  // Keep the original creation time when editing; new dresses get the database default.
  if (data.createdAt) row.created_at = new Date(data.createdAt).toISOString()
  check((await client().from('dresses').upsert(row)).error)
}

export async function uploadDressImage(dressId: string, file: File): Promise<DressImage> {
  const sb = client()
  const blob = await imageToBlob(file)
  const safe = file.name.replace(/\.[^.]+$/, '').replace(/[^a-z0-9]+/gi, '-').slice(0, 40) || 'photo'
  const path = `${dressId}/${Date.now()}-${safe}.jpg`
  check((await sb.storage.from(PHOTO_BUCKET).upload(path, blob, { contentType: 'image/jpeg' })).error)
  return { url: sb.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl, path, alt: '' }
}

export async function deleteImages(paths: string[]) {
  if (!supabase || !paths.length) return
  await supabase.storage.from(PHOTO_BUCKET).remove(paths)
}

export async function deleteDress(dress: Dress) {
  await deleteImages(dress.images.map((i) => i.path))
  check((await client().from('dresses').delete().eq('id', dress.id)).error)
}

export async function saveSetting(key: 'sizeGuide' | 'howItWorks' | 'hero', value: object) {
  check((await client().from('settings').upsert({ key, value, updated_at: new Date().toISOString() })).error)
}

/* ---------------- rentals and fittings (admin) ---------------- */
export async function listRentals(): Promise<Rental[]> {
  const { data, error } = await client().from('rentals').select('*, rental_items(*)').order('created_at', { ascending: false }).limit(500)
  check(error)
  return (data ?? []).map(rentalFromRow)
}

/** Status changes are logged to the rental history and release the dates automatically (database triggers). */
export async function updateRental(id: string, patch: { status?: RentalStatus; paymentStatus?: PaymentStatus }) {
  const row: Record<string, string> = {}
  if (patch.status) row.status = patch.status
  if (patch.paymentStatus) row.payment_status = patch.paymentStatus
  check((await client().from('rentals').update(row).eq('id', id)).error)
}

export async function listFittings(): Promise<FittingAppointment[]> {
  const { data, error } = await client().from('fittings').select('*').order('fit_date', { ascending: true }).order('fit_time', { ascending: true })
  check(error)
  return (data ?? []).map(fittingFromRow)
}

export async function deleteFitting(id: string) {
  check((await client().from('fittings').delete().eq('id', id)).error)
}

export async function adminReceiptUrl(path: string): Promise<string | null> {
  const { data } = await client().storage.from('receipts').createSignedUrl(path, 3600)
  return data?.signedUrl ?? null
}
