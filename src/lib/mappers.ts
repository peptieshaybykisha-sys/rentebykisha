/** Maps snake_case database rows to the app's types. */
import type { Address, FittingAppointment, Rental, RentalItem, RentalStatus } from '@/types'

type Row = Record<string, unknown>

export function rentalFromRow(r: Row): Rental {
  const items = (Array.isArray(r.rental_items) ? (r.rental_items as Row[]) : []).map(
    (i): RentalItem => ({
      dressId: String(i.dress_id ?? ''),
      name: String(i.dress_name),
      category: i.category as RentalItem['category'],
      size: String(i.size),
      startDate: String(i.start_date),
      endDate: String(i.end_date),
      rentalFee: Number(i.rental_fee),
      deposit: Number(i.deposit),
    }),
  )
  return {
    id: String(r.id),
    userId: String(r.user_id ?? ''),
    createdAt: String(r.created_at),
    items,
    customer: { name: String(r.customer_name), email: String(r.customer_email), phone: String(r.customer_phone) },
    fulfillment: r.fulfillment as Rental['fulfillment'],
    address: (r.address as string | null) ?? undefined,
    notes: (r.notes as string | null) ?? undefined,
    totals: {
      rentalFee: Number(r.rental_fee),
      deposit: Number(r.deposit),
      delivery: Number(r.delivery_fee),
      total: Number(r.total),
    },
    paymentStatus: r.payment_status as Rental['paymentStatus'],
    status: r.status as RentalStatus,
    receiptPath: (r.receipt_path as string | null) ?? undefined,
    history: Array.isArray(r.history) ? (r.history as Rental['history']) : [],
  }
}

export const fittingFromRow = (r: Row): FittingAppointment => ({
  id: String(r.id),
  userId: (r.user_id as string | null) ?? undefined,
  name: String(r.name),
  phone: String(r.phone),
  dressId: (r.dress_id as string | null) ?? undefined,
  date: String(r.fit_date),
  time: String(r.fit_time),
  createdAt: String(r.created_at),
})

export const addressFromRow = (r: Row): Address => ({
  id: String(r.id),
  label: String(r.label),
  line1: String(r.line1),
  city: String(r.city),
})
