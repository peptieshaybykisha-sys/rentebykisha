import { differenceInCalendarDays } from 'date-fns'
import type { CartItem, Dress, Fulfillment, Totals } from '@/types'
import { DELIVERY_FEE, EXTRA_DAY_RATE, INCLUDED_DAYS } from '@/constants/business'
import { fromISODate } from './utils'

export const rentalDays = (start: string, end: string) =>
  differenceInCalendarDays(fromISODate(end), fromISODate(start)) + 1

/** The listed price covers 3 days; each extra day is about 20% of the price. */
export function rentalFee(dress: Dress, start: string, end: string) {
  const extra = Math.max(0, rentalDays(start, end) - INCLUDED_DAYS)
  return dress.price + extra * Math.round((dress.price * EXTRA_DAY_RATE) / 10) * 10
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
