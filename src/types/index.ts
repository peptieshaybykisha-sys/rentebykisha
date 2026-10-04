export type Category = 'Evening' | 'Formal' | 'Cocktail' | 'Bridal' | 'Prom' | 'Events'
export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL'

export type Silhouette = 'ballgown' | 'mermaid' | 'aline' | 'column' | 'mini' | 'sleeved'
export type Texture = 'satin' | 'sequin' | 'lace' | 'tulle' | 'velvet' | 'chiffon'

/** A dress image. With a real backend `src` is set; with mock data the image is drawn from `art`. */
export interface DressImage {
  src?: string
  alt: string
  view: 'front' | 'bodice' | 'hem' | 'studio'
}

export interface DateRange {
  start: string // yyyy-MM-dd
  end: string
}

export interface Dress {
  id: string
  name: string
  category: Category
  colorName: string
  price: number // flat rental fee for up to `includedDays`
  deposit: number
  sizes: Size[]
  description: string
  details: string[]
  images: DressImage[]
  art: { color: string; silhouette: Silhouette; texture: Texture; accent?: string }
  status: 'available' | 'unavailable'
  bookedRanges: DateRange[]
  featured?: boolean
}

export interface CartItem {
  dressId: string
  size: Size
  startDate: string
  endDate: string
  addedAt: number
}

export type RentalStatus =
  | 'Pending Payment'
  | 'Payment Verification'
  | 'Confirmed'
  | 'Preparing'
  | 'Ready for Pickup'
  | 'Rented'
  | 'Return Due'
  | 'Returned'
  | 'Under Inspection'
  | 'Completed'
  | 'Cancelled'

export type PaymentStatus = 'Pending Verification' | 'Verified' | 'Rejected' | 'Deposit Refunded'

export type Fulfillment = 'delivery' | 'pickup'

export interface Address {
  id: string
  label: string
  line1: string
  city: string
  notes?: string
}

export interface User {
  id: string
  name: string
  email: string
  phone: string
}

export interface CustomerInfo {
  name: string
  email: string
  phone: string
}

export interface RentalItem {
  dressId: string
  name: string
  category: Category
  size: Size
  startDate: string
  endDate: string
  rentalFee: number
  deposit: number
}

export interface Totals {
  rentalFee: number
  deposit: number
  delivery: number
  total: number
}

export interface Rental {
  id: string // REN-20261004-001
  userId: string
  createdAt: string
  items: RentalItem[]
  customer: CustomerInfo
  fulfillment: Fulfillment
  address?: string
  notes?: string
  totals: Totals
  paymentStatus: PaymentStatus
  status: RentalStatus
  receipt?: { name: string; dataUrl: string }
  history: { status: RentalStatus; at: string }[]
}

export interface FittingAppointment {
  id: string
  userId?: string
  name: string
  phone: string
  date: string
  time: string
  dressId?: string
  createdAt: string
}
