import type { Category, CategoryFilter } from '@/types'

export const CATEGORIES: Category[] = ['Long Dress', 'Short Dress']

export const CATEGORY_FILTERS: CategoryFilter[] = ['All', ...CATEGORIES]

export const OCCASION_BLURBS: Record<Category, string> = {
  'Long Dress': 'Gowns for galas, weddings, proms and black-tie',
  'Short Dress': 'Cocktail, party and day-to-night dresses',
}

/** Quick-add size labels in the admin dress form. */
export const SIZE_PRESETS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free size']

export const MAX_DRESS_PHOTO_DIMENSION = 1600
