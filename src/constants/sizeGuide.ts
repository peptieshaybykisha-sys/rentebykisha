import type { SizeGuideContent } from '@/types'

/** Shown until an admin saves their own size guide in Supabase. */
export const DEFAULT_SIZE_GUIDE: SizeGuideContent = {
  note: 'Measurements are body measurements in centimetres. If you are between sizes, choose the larger one or book a fitting.',
  columns: ['Size', 'Bust', 'Waist', 'Hips'],
  rows: [
    ['XS', '80–84', '60–64', '86–90'],
    ['S', '85–89', '65–69', '91–95'],
    ['M', '90–94', '70–74', '96–100'],
    ['L', '95–99', '75–79', '101–105'],
    ['XL', '100–106', '80–86', '106–112'],
  ],
}
