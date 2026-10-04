import { CalendarDays, CheckCircle2, XCircle } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import Calendar from '@/components/common/Calendar'
import { checkAvailability, isDayBooked, isDayDisabled, nextRange } from '@/lib/availability'
import { INCLUDED_DAYS, LEAD_DAYS, MAX_DAYS } from '@/constants/business'
import { rentalDays } from '@/lib/pricing'
import { formatLong } from '@/lib/utils'
import type { Dress } from '@/types'

interface Props {
  dress: Dress
  start?: string
  end?: string
  onChange: (range: { start?: string; end?: string }) => void
}

export function AvailabilityStatus({ dress, start, end }: { dress: Dress; start?: string; end?: string }) {
  const a = checkAvailability(dress, start, end)
  return (
    <div aria-live="polite" className="min-h-[3.25rem]">
      <AnimatePresence mode="wait" initial={false}>
        {a.state === 'available' && (
          <motion.p key="ok" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-lg font-medium text-sage">
            <CheckCircle2 className="size-5 shrink-0" aria-hidden /> Available for your dates
          </motion.p>
        )}
        {a.state === 'unavailable' && (
          <motion.div key="no" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-start gap-2 text-red-900">
            <XCircle className="mt-1 size-5 shrink-0" aria-hidden />
            <p>
              <span className="block text-lg font-medium">Unavailable for selected dates</span>
              <span className="text-[0.95rem]">{a.reason}</span>
            </p>
          </motion.div>
        )}
        {a.state === 'idle' && (
          <motion.p key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-muted">
            {start ? 'Now choose your return date.' : 'Choose your pick-up date, then your return date.'}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function RentalDatePicker({ dress, start, end, onChange }: Props) {
  return (
    <div>
      <div className="mb-3 grid grid-cols-2 gap-3">
        {([['Pick-up', start], ['Return', end]] as const).map(([label, v]) => (
          <div key={label} className="rounded-2xl border border-line bg-ivory px-4 py-3">
            <p className="text-sm text-muted">{label}</p>
            <p className="flex items-center gap-2 text-[0.95rem] font-medium sm:text-base">
              <CalendarDays className="size-4 shrink-0 text-burgundy-soft" aria-hidden />
              {v ? formatLong(v).replace(/, \d{4}$/, '') : 'Select date'}
            </p>
          </div>
        ))}
      </div>

      <Calendar
        start={start}
        end={end}
        onPick={(iso) => onChange(nextRange({ start, end }, iso))}
        isDisabled={(d) => isDayDisabled(dress, d)}
        isStruck={(d) => isDayBooked(dress, d)}
      />

      <p className="mt-3 text-sm text-muted">
        Struck-through dates are already reserved. Your rental includes {INCLUDED_DAYS} days
        {start && end ? ` (you selected ${rentalDays(start, end)})` : ''}; up to {MAX_DAYS} days in total. Book at least {LEAD_DAYS} days ahead.
      </p>
      <div className="mt-3">
        <AvailabilityStatus dress={dress} start={start} end={end} />
      </div>
    </div>
  )
}
