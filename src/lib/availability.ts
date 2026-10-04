import { addDays, areIntervalsOverlapping, isBefore, startOfDay } from 'date-fns'
import type { Dress } from '@/types'
import { LEAD_DAYS, MAX_DAYS } from '@/constants/business'
import { rentalDays } from './pricing'
import { formatShort, fromISODate, toISODate } from './utils'

export const earliestPickup = () => addDays(startOfDay(new Date()), LEAD_DAYS)

const overlaps = (a: { start: Date; end: Date }, r: { start: string; end: string }) =>
  areIntervalsOverlapping(a, { start: fromISODate(r.start), end: fromISODate(r.end) }, { inclusive: true })

const allRanges = (dress: Dress) => [...dress.bookedRanges, ...(dress.reservedRanges ?? [])]

export function isDayBooked(dress: Dress, day: Date) {
  return allRanges(dress).some((r) => overlaps({ start: day, end: day }, r))
}

/** Day cannot be picked at all (past, too soon, booked, or dress unavailable). */
export function isDayDisabled(dress: Dress, day: Date) {
  return dress.status === 'unavailable' || isBefore(day, earliestPickup()) || isDayBooked(dress, day)
}

export type Availability =
  | { state: 'idle' }
  | { state: 'available' }
  | { state: 'unavailable'; reason: string }

export function checkAvailability(dress: Dress, start?: string, end?: string): Availability {
  if (dress.status === 'unavailable') return { state: 'unavailable', reason: 'This dress is not available to rent right now.' }
  if (!start || !end) return { state: 'idle' }
  const s = fromISODate(start)
  const e = fromISODate(end)
  if (isBefore(e, s)) return { state: 'unavailable', reason: 'The return date must be on or after the pick-up date.' }
  if (isBefore(s, earliestPickup()))
    return { state: 'unavailable', reason: `We need ${LEAD_DAYS} days to prepare your dress. Please choose a later pick-up date.` }
  if (rentalDays(start, end) > MAX_DAYS)
    return { state: 'unavailable', reason: `Rentals can be up to ${MAX_DAYS} days. Please shorten your dates.` }
  const clash = allRanges(dress).find((r) => overlaps({ start: s, end: e }, r))
  if (clash)
    return {
      state: 'unavailable',
      reason: `Already reserved ${formatShort(clash.start)}${clash.start === clash.end ? '' : ` – ${formatShort(clash.end)}`}. Try different dates.`,
    }
  return { state: 'available' }
}

export function nextAvailableDate(dress: Dress): string | null {
  if (dress.status === 'unavailable') return null
  let d = earliestPickup()
  for (let i = 0; i < 90; i++) {
    if (!isDayBooked(dress, d)) return toISODate(d)
    d = addDays(d, 1)
  }
  return null
}

/** Range-click state machine for the calendar: first click = pick-up, second = return. */
export function nextRange(cur: { start?: string; end?: string }, clicked: string): { start?: string; end?: string } {
  if (!cur.start || cur.end) return { start: clicked }
  if (clicked < cur.start) return { start: clicked }
  return { start: cur.start, end: clicked }
}
