import type { Category, CategoryFilter } from '@/types'

export const CATEGORIES: Category[] = ['Evening', 'Formal', 'Cocktail', 'Bridal', 'Prom', 'Events']

export const CATEGORY_FILTERS: CategoryFilter[] = ['All', ...CATEGORIES]

export const OCCASION_BLURBS: Record<Category, string> = {
  Evening: 'Galas, dinners and dramatic entrances',
  Formal: 'Ceremonies, balls and black-tie',
  Cocktail: 'Parties, birthdays and dates',
  Bridal: 'Weddings, pre-nups and civil ceremonies',
  Prom: 'Voluminous, romantic and made to twirl',
  Events: 'Garden parties, graduations and more',
}

/** Quick-add size labels in the admin dress form. */
export const SIZE_PRESETS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free size']

export const MAX_DRESS_PHOTO_DIMENSION = 1600
