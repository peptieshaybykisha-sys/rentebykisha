import { toast } from 'sonner'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { CalendarDays, Trash2 } from 'lucide-react'
import DressPhoto from '@/components/dresses/DressPhoto'
import RentalDatePicker from '@/components/dresses/RentalDatePicker'
import { Button } from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import { checkAvailability } from '@/lib/availability'
import { rentalDays, rentalFee } from '@/lib/pricing'
import { cn, formatPeso, formatRange } from '@/lib/utils'
import { useCartStore } from '@/stores'
import type { CartItem, Dress } from '@/types'

export default function CartItemRow({ item, dress }: { item: CartItem; dress: Dress }) {
  const update = useCartStore((s) => s.update)
  const remove = useCartStore((s) => s.remove)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<{ start?: string; end?: string }>({})
  const availability = checkAvailability(dress, item.startDate, item.endDate)
  const draftOk = checkAvailability(dress, draft.start, draft.end).state === 'available'

  const open = () => {
    setDraft({ start: item.startDate, end: item.endDate })
    setEditing(true)
  }

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40, transition: { duration: 0.25 } }}
      className="rounded-[1.75rem] border border-line bg-ivory p-4 sm:p-5"
    >
      <div className="flex gap-4 sm:gap-6">
        <Link to={`/dresses/${dress.id}`} className="block w-24 shrink-0 overflow-hidden rounded-2xl bg-blush-soft sm:w-32" aria-label={`View ${dress.name}`}>
          <div className="aspect-[3/4]">
            <DressPhoto dress={dress} className="size-full object-cover" />
          </div>
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl leading-tight sm:text-3xl">
                <Link to={`/dresses/${dress.id}`}>{dress.name}</Link>
              </h2>
              <p className="mt-1 text-[0.95rem] text-muted">{dress.category} Collection</p>
            </div>
            <p className="text-lg tabular-nums sm:text-xl">{formatPeso(rentalFee(dress, item.startDate, item.endDate))}</p>
          </div>

          <p className="mt-3 flex items-center gap-2 text-[0.95rem]">
            <CalendarDays className="size-4 text-burgundy-soft" aria-hidden />
            {formatRange(item.startDate, item.endDate)}
            <span className="text-muted">· {rentalDays(item.startDate, item.endDate)} days</span>
          </p>

          <fieldset className="mt-3">
            <legend className="sr-only">Size</legend>
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-[0.95rem] text-muted" aria-hidden>
                Size:
              </span>
              {dress.sizes.map((s) => (
                <label key={s} className="cursor-pointer">
                  <input type="radio" name={`size-${dress.id}`} checked={item.size === s} onChange={() => update(dress.id, { size: s })} className="peer sr-only" />
                  <span className="grid size-10 place-items-center rounded-full border border-line text-sm transition-colors peer-checked:border-burgundy peer-checked:bg-burgundy peer-checked:text-ivory peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-burgundy hover:border-burgundy">
                    {s}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {availability.state === 'unavailable' && (
            <p role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-900">
              {availability.reason} Please change your dates.
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-x-5">
            <button type="button" onClick={open} className={cn('link-underline min-h-11 text-[0.95rem] font-medium text-burgundy')}>
              Change dates
            </button>
            <button type="button" onClick={() => {
              remove(dress.id)
              toast(`${dress.name} removed from your cart.`)
            }} className="flex min-h-11 items-center gap-1.5 text-[0.95rem] text-muted hover:text-burgundy">
              <Trash2 className="size-4" aria-hidden /> Remove
            </button>
          </div>
        </div>
      </div>

      <Dialog open={editing} onClose={() => setEditing(false)} title="Change your dates">
        <RentalDatePicker dress={dress} start={draft.start} end={draft.end} onChange={setDraft} />
        <div className="mt-6 flex gap-3">
          <Button
            disabled={!draftOk}
            onClick={() => {
              if (draft.start && draft.end) update(dress.id, { startDate: draft.start, endDate: draft.end })
              setEditing(false)
            }}
            className="flex-1"
          >
            Save dates
          </Button>
          <Button variant="ghost" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </div>
      </Dialog>
    </motion.li>
  )
}
