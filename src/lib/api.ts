/**
 * Mock API layer. Every function is async and returns plain data, so a real
 * backend can replace the bodies without touching any UI code.
 */
import { addDays, format } from 'date-fns'
import { getDress } from '@/hooks/useDresses'
import { useAuthStore, useMockDb } from '@/stores'
import type { Address, CartItem, CustomerInfo, FittingAppointment, Fulfillment, Rental, RentalStatus, User } from '@/types'
import { checkAvailability } from './availability'
import { computeTotals, rentalFee } from './pricing'
import { fromISODate, sleep, toISODate } from './utils'
import { STATUS_FLOW } from './status'

export class ApiError extends Error {}

const db = () => useMockDb.getState()
const publicUser = ({ id, name, email, phone }: User & { password?: string }): User => ({ id, name, email, phone })

/* ---------------- auth ---------------- */
export async function login(email: string, password: string): Promise<User> {
  await sleep(600)
  const u = db().users.find((x) => x.email.toLowerCase() === email.toLowerCase())
  if (!u || u.password !== password) throw new ApiError('That email and password do not match. Please try again.')
  return publicUser(u)
}

export async function register(data: { name: string; email: string; phone: string; password: string }): Promise<User> {
  await sleep(700)
  if (db().users.some((x) => x.email.toLowerCase() === data.email.toLowerCase()))
    throw new ApiError('An account with this email already exists. Try logging in instead.')
  const user = { id: `user-${Date.now()}`, ...data }
  useMockDb.setState((s) => ({ users: [...s.users, user] }))
  return publicUser(user)
}

export async function updateProfile(id: string, patch: Pick<User, 'name' | 'phone'>): Promise<User> {
  await sleep(400)
  useMockDb.setState((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) }))
  const u = db().users.find((x) => x.id === id)
  if (!u) throw new ApiError('Account not found.')
  return publicUser(u)
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

export async function createRental(input: CreateRentalInput): Promise<Rental> {
  await sleep(900)
  if (!input.items.length) throw new ApiError('Your rental cart is empty.')

  // Server-side re-validation of availability, including rentals already submitted.
  for (const it of input.items) {
    const dress = getDress(it.dressId)
    if (!dress) throw new ApiError('One of the dresses in your cart is no longer in our collection.')
    const check = checkAvailability(dress, it.startDate, it.endDate)
    if (check.state === 'unavailable') throw new ApiError(`${dress.name}: ${check.reason}`)
    const clash = db().rentals.some(
      (r) =>
        r.status !== 'Cancelled' &&
        r.status !== 'Completed' &&
        r.items.some((x) => x.dressId === it.dressId && x.startDate <= it.endDate && x.endDate >= it.startDate),
    )
    if (clash) throw new ApiError(`${dress.name} was just reserved for those dates. Please pick new dates.`)
  }

  const now = new Date()
  const prefix = `REN-${format(now, 'yyyyMMdd')}-`
  const count = db().rentals.filter((r) => r.id.startsWith(prefix)).length + 1
  const id = `${prefix}${String(count).padStart(3, '0')}`

  const rental: Rental = {
    id,
    userId: input.userId,
    createdAt: now.toISOString(),
    items: input.items.map((it) => {
      const d = getDress(it.dressId)!
      return {
        dressId: d.id,
        name: d.name,
        category: d.category,
        size: it.size,
        startDate: it.startDate,
        endDate: it.endDate,
        rentalFee: rentalFee(d, it.startDate, it.endDate),
        deposit: d.deposit,
      }
    }),
    customer: input.customer,
    fulfillment: input.fulfillment,
    address: input.address,
    notes: input.notes,
    totals: computeTotals(input.items, getDress, input.fulfillment),
    paymentStatus: 'Pending Verification',
    status: 'Payment Verification',
    receipt: input.receipt,
    history: [{ status: 'Payment Verification', at: now.toISOString() }],
  }
  try {
    useMockDb.setState((s) => ({ rentals: [rental, ...s.rentals] }))
  } catch {
    throw new ApiError('We could not save your request. Please try again.')
  }
  return rental
}

export const getRentals = (userId: string) => db().rentals.filter((r) => r.userId === userId)
export const getRental = (id: string) => db().rentals.find((r) => r.id === id)

export async function cancelRental(id: string) {
  await sleep(400)
  setStatus(id, 'Cancelled')
}

function setStatus(id: string, status: RentalStatus) {
  useMockDb.setState((s) => ({
    rentals: s.rentals.map((r) =>
      r.id === id
        ? {
            ...r,
            status,
            paymentStatus:
              status === 'Confirmed' ? 'Verified' : status === 'Completed' ? 'Deposit Refunded' : r.paymentStatus,
            history: [...r.history, { status, at: new Date().toISOString() }],
          }
        : r,
    ),
  }))
}

/** Demo helper: pretend the team moved the rental to its next stage. */
export function advanceRental(id: string) {
  const r = getRental(id)
  if (!r) return
  const i = STATUS_FLOW.indexOf(r.status)
  if (i >= 0 && i < STATUS_FLOW.length - 1) setStatus(id, STATUS_FLOW[i + 1])
}

/* ---------------- fittings ---------------- */
export async function bookFitting(input: Omit<FittingAppointment, 'id' | 'createdAt'>): Promise<FittingAppointment> {
  await sleep(600)
  if (db().fittings.some((f) => f.date === input.date && f.time === input.time))
    throw new ApiError('Sorry, that slot was just taken. Please choose another time.')
  const f: FittingAppointment = { ...input, id: `fit-${Date.now()}`, createdAt: new Date().toISOString() }
  useMockDb.setState((s) => ({ fittings: [...s.fittings, f] }))
  return f
}

export const getFittings = (userId: string) => db().fittings.filter((f) => f.userId === userId)
export const bookedSlots = (date: string) => db().fittings.filter((f) => f.date === date).map((f) => f.time)

export function cancelFitting(id: string) {
  useMockDb.setState((s) => ({ fittings: s.fittings.filter((f) => f.id !== id) }))
}

/* ---------------- addresses ---------------- */
export const getAddresses = (userId: string): Address[] => db().addresses[userId] ?? []
export function saveAddress(userId: string, a: Omit<Address, 'id'>) {
  const addr = { ...a, id: `addr-${Date.now()}` }
  useMockDb.setState((s) => ({ addresses: { ...s.addresses, [userId]: [...(s.addresses[userId] ?? []), addr] } }))
}
export function removeAddress(userId: string, id: string) {
  useMockDb.setState((s) => ({ addresses: { ...s.addresses, [userId]: (s.addresses[userId] ?? []).filter((a) => a.id !== id) } }))
}

/* ---------------- seed ---------------- */
export const DEMO_LOGIN = { email: 'demo@rente.ph', password: 'password123' }

/** Creates the demo account (with two past rentals) the first time the app runs. */
export function seedDemo() {
  if (db().users.some((u) => u.email === DEMO_LOGIN.email)) return
  const id = 'user-demo'
  const customer = { name: 'Kisha Demo', email: DEMO_LOGIN.email, phone: '0917 123 4567' }
  const mk = (n: number, dressId: string, from: number, len: number, status: RentalStatus, size: 'S' | 'M'): Rental => {
    const d = getDress(dressId)!
    const start = toISODate(addDays(new Date(), from))
    const end = toISODate(addDays(fromISODate(start), len - 1))
    const fee = rentalFee(d, start, end)
    const created = addDays(new Date(), Math.min(from, 0) - 6).toISOString()
    return {
      id: `REN-${format(addDays(new Date(), Math.min(from, 0) - 6), 'yyyyMMdd')}-00${n}`,
      userId: id,
      createdAt: created,
      items: [{ dressId, name: d.name, category: d.category, size, startDate: start, endDate: end, rentalFee: fee, deposit: d.deposit }],
      customer,
      fulfillment: 'pickup',
      totals: { rentalFee: fee, deposit: d.deposit, delivery: 0, total: fee + d.deposit },
      paymentStatus: status === 'Completed' ? 'Deposit Refunded' : 'Verified',
      status,
      history: [{ status: 'Payment Verification', at: created }, { status, at: created }],
    }
  }
  useMockDb.setState((s) => ({
    users: [...s.users, { id, ...customer, password: DEMO_LOGIN.password }],
    rentals: [...s.rentals, mk(1, 'dress-001', 24, 3, 'Confirmed', 'M'), mk(2, 'dress-003', -20, 2, 'Completed', 'S')],
  }))
}

export const currentUser = () => useAuthStore.getState().user
