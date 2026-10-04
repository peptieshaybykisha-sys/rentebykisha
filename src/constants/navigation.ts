import { BookOpen, CalendarHeart, Heart, House, MapPin, ReceiptText, UserRound, type LucideIcon } from 'lucide-react'

export const MAIN_NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/dresses', label: 'Dresses' },
  { to: '/collections', label: 'Collections' },
  { to: '/how-it-works', label: 'How It Works' },
]

export const MOBILE_NAV: { to: string; label: string; icon: LucideIcon; end?: boolean }[] = [
  { to: '/', label: 'Home', icon: House, end: true },
  { to: '/collections', label: 'Lookbook', icon: BookOpen },
  { to: '/wishlist', label: 'Saved', icon: Heart },
  { to: '/account', label: 'Account', icon: UserRound },
]

export const ACCOUNT_TABS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'profile', label: 'Profile', icon: UserRound },
  { id: 'rentals', label: 'My Rentals', icon: ReceiptText },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'fittings', label: 'Fitting Appointments', icon: CalendarHeart },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
]

export const ADMIN_NAV = [
  { to: '/admin', label: 'Rentals', end: true },
  { to: '/admin/dresses', label: 'Dresses' },
  { to: '/admin/fittings', label: 'Fittings' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/hero', label: 'Hero dresses' },
  { to: '/admin/size-guide', label: 'Size guide' },
  { to: '/admin/how-it-works', label: 'How it works' },
]
