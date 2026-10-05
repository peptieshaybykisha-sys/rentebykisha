import { addDays } from 'date-fns'
import { describe, expect, it } from 'vitest'
import { checkAvailability, isDayBooked, nextRange } from './availability'
import { computeTotals, rentalDays, rentalFee } from './pricing'
import { rentalFromRow } from './mappers'
import { phoneSchema } from './validation'
import { toISODate } from './utils'
import type { Dress } from '@/types'

const dress = (over: Partial<Dress> = {}): Dress => ({
  id: 'd1',
  name: 'Gown',
  category: 'Long Dress',
  colorName: 'Red',
  price: 900,
  deposit: 1000,
  sizes: ['S', 'M'],
  description: '',
  details: [],
  images: [],
  status: 'available',
  bookedRanges: [],
  ...over,
})
const day = (n: number) => toISODate(addDays(new Date(), n))

describe('pricing (must match the database function create_rental)', () => {
  it('counts days inclusively', () => {
    expect(rentalDays('2026-10-18', '2026-10-18')).toBe(1)
    expect(rentalDays('2026-10-18', '2026-10-20')).toBe(3)
  })
  it('includes 3 days in the listed price', () => {
    expect(rentalFee(dress(), '2026-10-18', '2026-10-20')).toBe(900)
  })
  it('adds 20% of the price for each extra day', () => {
    expect(rentalFee(dress(), '2026-10-18', '2026-10-23')).toBe(900 + 3 * 180)
  })
  it('totals fee, deposit and delivery', () => {
    const d = dress()
    const items = [{ dressId: 'd1', size: 'M', startDate: '2026-10-18', endDate: '2026-10-20', addedAt: 0 }]
    expect(computeTotals(items, () => d, 'delivery')).toEqual({ rentalFee: 900, deposit: 1000, delivery: 150, total: 2050 })
    expect(computeTotals(items, () => d, 'pickup').delivery).toBe(0)
  })
})

describe('availability', () => {
  it('needs both dates before judging', () => {
    expect(checkAvailability(dress(), day(10)).state).toBe('idle')
  })
  it('accepts free dates', () => {
    expect(checkAvailability(dress(), day(10), day(12)).state).toBe('available')
  })
  it('rejects past or too-soon pick-ups', () => {
    expect(checkAvailability(dress(), day(0), day(1)).state).toBe('unavailable')
  })
  it('rejects return before pick-up and over-long rentals', () => {
    expect(checkAvailability(dress(), day(12), day(10)).state).toBe('unavailable')
    expect(checkAvailability(dress(), day(10), day(20)).state).toBe('unavailable')
  })
  it('rejects overlap with blocked or reserved dates', () => {
    const blocked = dress({ bookedRanges: [{ start: day(11), end: day(12) }] })
    const reserved = dress({ reservedRanges: [{ start: day(11), end: day(12) }] })
    expect(checkAvailability(blocked, day(10), day(11)).state).toBe('unavailable')
    expect(checkAvailability(reserved, day(12), day(14)).state).toBe('unavailable')
    expect(isDayBooked(reserved, addDays(new Date(), 11))).toBe(true)
    expect(checkAvailability(reserved, day(13), day(14)).state).toBe('available')
  })
  it('rejects an unavailable dress', () => {
    expect(checkAvailability(dress({ status: 'unavailable' }), day(10), day(11)).state).toBe('unavailable')
  })
  it('picks pick-up then return with two clicks', () => {
    expect(nextRange({}, '2026-10-10')).toEqual({ start: '2026-10-10' })
    expect(nextRange({ start: '2026-10-10' }, '2026-10-12')).toEqual({ start: '2026-10-10', end: '2026-10-12' })
    expect(nextRange({ start: '2026-10-10' }, '2026-10-08')).toEqual({ start: '2026-10-08' })
    expect(nextRange({ start: '2026-10-10', end: '2026-10-12' }, '2026-10-20')).toEqual({ start: '2026-10-20' })
  })
})

describe('validation', () => {
  it.each(['09171234567', '0917 123 4567', '+63 917 123 4567', '0917-123-4567'])('accepts %s', (v) => {
    expect(phoneSchema.safeParse(v).success).toBe(true)
  })
  it.each(['', '12345', '08171234567', 'abc'])('rejects %j', (v) => {
    expect(phoneSchema.safeParse(v).success).toBe(false)
  })
})

describe('row mapping', () => {
  it('maps a rental row with its items', () => {
    const r = rentalFromRow({
      id: 'REN-20261004-001',
      user_id: 'u1',
      created_at: '2026-10-04T00:00:00Z',
      status: 'Confirmed',
      payment_status: 'Verified',
      customer_name: 'Ana',
      customer_email: 'a@x.com',
      customer_phone: '0917',
      fulfillment: 'pickup',
      rental_fee: 900,
      deposit: 1000,
      delivery_fee: 0,
      total: 1900,
      receipt_path: 'u1/1.jpg',
      history: [],
      rental_items: [{ dress_id: 'd1', dress_name: 'Gown', category: 'Long Dress', size: 'M', start_date: '2026-10-18', end_date: '2026-10-20', rental_fee: 900, deposit: 1000 }],
    })
    expect(r.totals).toEqual({ rentalFee: 900, deposit: 1000, delivery: 0, total: 1900 })
    expect(r.items[0]).toMatchObject({ name: 'Gown', size: 'M', startDate: '2026-10-18' })
    expect(r.receiptPath).toBe('u1/1.jpg')
  })
})
