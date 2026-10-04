import type { RentalStatus } from '@/types'

export const STATUS_FLOW: RentalStatus[] = [
  'Payment Verification',
  'Confirmed',
  'Preparing',
  'Ready for Pickup',
  'Rented',
  'Return Due',
  'Returned',
  'Under Inspection',
  'Completed',
]

/** Statuses in which a customer may still cancel. */
export const CANCELLABLE_STATUSES: RentalStatus[] = ['Pending Payment', 'Payment Verification', 'Confirmed']

export const STATUS_STYLES: Record<RentalStatus, string> = {
  'Pending Payment': 'bg-amber-50 text-amber-900 ring-amber-200',
  'Payment Verification': 'bg-blush-soft text-burgundy ring-blush',
  Confirmed: 'bg-emerald-50 text-emerald-900 ring-emerald-200',
  Preparing: 'bg-purple-50 text-purple-900 ring-purple-200',
  'Ready for Pickup': 'bg-emerald-100 text-emerald-950 ring-emerald-300',
  Rented: 'bg-burgundy text-blush-soft ring-burgundy',
  'Return Due': 'bg-orange-100 text-orange-950 ring-orange-300',
  Returned: 'bg-stone-100 text-stone-800 ring-stone-300',
  'Under Inspection': 'bg-sky-50 text-sky-900 ring-sky-200',
  Completed: 'bg-white text-sage ring-sage/50',
  Cancelled: 'bg-stone-100 text-stone-500 ring-stone-300',
}

export const STATUS_HELP: Record<RentalStatus, string> = {
  'Pending Payment': 'We are waiting for your GCash payment.',
  'Payment Verification': 'Our team is checking your receipt. This usually takes a few hours.',
  Confirmed: 'Your dress is reserved for your dates.',
  Preparing: 'Your dress is being steamed and packed.',
  'Ready for Pickup': 'Your dress is ready. We will message you the details.',
  Rented: 'Enjoy your moment!',
  'Return Due': 'Please return your dress by the date on your rental.',
  Returned: 'We have received your dress. Thank you!',
  'Under Inspection': 'We are inspecting the dress before refunding your deposit.',
  Completed: 'All done. Your security deposit has been settled.',
  Cancelled: 'This rental was cancelled.',
}
