import { BookOpen, CalendarHeart, Heart, House, MapPin, ReceiptText, UserRound, type LucideIcon } from 'lucide-react'
import type { NavigationContent } from '@/types'
import { CATEGORIES } from './catalog'

export const MAX_NAV_LINKS = 8
export const MAX_FOOTER_COLUMNS = 4
export const MAX_FOOTER_ITEMS = 10

/** What the header and footer show until an admin edits them. */
export const DEFAULT_NAVIGATION: NavigationContent = {
  main: [
    { to: '/', label: 'Home' },
    { to: '/dresses', label: 'Dresses' },
    { to: '/collections', label: 'Collections' },
    { to: '/how-it-works', label: 'How It Works' },
    { to: '/terms', label: 'Terms & Conditions' },
  ],
  footer: {
    tagline: 'Beautiful dresses for the moments you will remember. Rent it, wear it, return it.',
    columns: [
      { title: 'Collections', items: CATEGORIES.map((c) => ({ label: c, to: `/dresses?category=${c}` })) },
      {
        title: 'Rent with us',
        items: [
          { label: 'How it works', to: '/how-it-works' },
          { label: 'Schedule a fitting', to: '/fitting' },
          { label: 'My rentals', to: '/rentals' },
          { label: 'Rental cart', to: '/cart' },
          { label: 'Terms & conditions', to: '/terms' },
        ],
      },
      {
        title: 'Visit & contact',
        items: [
          { label: 'By appointment only', to: '' },
          { label: 'Tue – Sat, 10am – 6pm', to: '' },
          { label: 'hello@rentebykisha.ph', to: 'mailto:hello@rentebykisha.ph' },
          { label: 'GCash · Delivery · Pickup', to: '' },
        ],
      },
    ],
    copyright: 'Renté by Kisha. All rights reserved.',
    note: 'Designer dress rentals · Philippines',
  },
}

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
  { to: '/admin/hero', label: 'Showroom photo' },
  { to: '/admin/how-it-works', label: 'How it works' },
  { to: '/admin/terms', label: 'Terms & conditions' },
  { to: '/admin/navigation', label: 'Navbar & footer' },
]
