import type { Category } from '@/types'

/** Dresses themselves now live in Firestore (managed from /admin). */
export const CATEGORIES: Category[] = ['Evening', 'Formal', 'Cocktail', 'Bridal', 'Prom', 'Events']

export const OCCASION_BLURBS: Record<Category, string> = {
  Evening: 'Galas, dinners and dramatic entrances',
  Formal: 'Ceremonies, balls and black-tie',
  Cocktail: 'Parties, birthdays and dates',
  Bridal: 'Weddings, pre-nups and civil ceremonies',
  Prom: 'Voluminous, romantic and made to twirl',
  Events: 'Garden parties, graduations and more',
}
