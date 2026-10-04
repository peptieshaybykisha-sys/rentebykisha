import { STATUS_STYLES } from '@/constants/rental'
import { cn } from '@/lib/utils'
import type { RentalStatus } from '@/types'

export default function StatusBadge({ status, className }: { status: RentalStatus; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset',
        STATUS_STYLES[status],
        status === 'Cancelled' && 'line-through',
        className,
      )}
    >
      {status}
    </span>
  )
}
