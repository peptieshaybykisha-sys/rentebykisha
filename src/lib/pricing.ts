import { differenceInCalendarDays } from 'date-fns'
import type { CartItem, Dress, Fulfillment, Totals } from '@/types'
import { fromISODate } from './utils'

export const INCLUDED_DAYS = 3
export const MAX_DAYS = 7
export const DELIVERY_FEE = 150
export const LEAD_DAYS = 2

export const rentalDays = (start: string, end: string) =>
  differenceInCalendarDays(fromISODate(end), fromISODate(start)) + 1

/** The listed price covers 3 days; each extra day is about 20% of the price. */
export function rentalFee(dress: Dress, start: string, end: string) {
  const extra = Math.max(0, rentalDays(start, end) - INCLUDED_DAYS)
  return dress.price + extra * Math.round((dress.price * 0.2) / 10) * 10
}

export function computeTotals(
  items: CartItem[],
  getDress: (id: string) => Dress | undefined,
  fulfillment: Fulfillment = 'delivery',
): Totals {
  let fee = 0
  let deposit = 0
  for (const it of items) {
    const d = getDress(it.dressId)
    if (!d) continue
    fee += rentalFee(d, it.startDate, it.endDate)
    deposit += d.deposit
  }
  const delivery = items.length && fulfillment === 'delivery' ? DELIVERY_FEE : 0
  return { rentalFee: fee, deposit, delivery, total: fee + deposit + delivery }
}
