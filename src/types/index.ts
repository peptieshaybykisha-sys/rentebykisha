export type Category = 'Evening' | 'Formal' | 'Cocktail' | 'Bridal' | 'Prom' | 'Events'
/** Sizes are free text so each dress can use its own labels (XS, 8, Free size...). */
export type Size = string

export interface DressImage {
  url: string
  path: string // Storage path, used when deleting
  alt: string
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
  status: 'available' | 'unavailable'
  bookedRanges: DateRange[]
  featured?: boolean
  createdAt?: number
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

/* ---------- Admin-editable site content (Firestore settings/*) ---------- */
export interface SizeGuideContent {
  note: string
  columns: string[] // first column is the size label
  rows: string[][]
}

export type StepIconName = 'search' | 'calendar' | 'wallet' | 'sparkles' | 'package' | 'truck' | 'heart' | 'shirt' | 'camera' | 'message'

export interface HowItWorksContent {
  steps: { icon: StepIconName; title: string; text: string }[]
  faq: { q: string; a: string }[]
}

export interface HeroContent {
  dressIds: string[] // first one is the centre piece
}
