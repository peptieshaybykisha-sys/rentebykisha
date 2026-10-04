import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import DressArt from '@/components/dresses/DressArt'
import StatusBadge from '@/components/ui/StatusBadge'
import { dresses } from '@/data/dresses'
import { STATUS_FLOW } from '@/lib/status'
import { cn, formatLong, formatPeso, formatRange } from '@/lib/utils'
import type { Rental } from '@/types'

const artFor = (id: string) => dresses.find((d) => d.id === id)

/** Compact row used in My Rentals and the account page. */
export function RentalCard({ rental }: { rental: Rental }) {
  const first = rental.items[0]
  const dress = artFor(first.dressId)
  const more = rental.items.length - 1
  const start = rental.items.map((i) => i.startDate).sort()[0]
  const end = rental.items.map((i) => i.endDate).sort().at(-1)!
  return (
    <article className="flex gap-4 rounded-[1.75rem] border border-line bg-ivory p-4 sm:gap-6 sm:p-5">
      <div className="hidden w-24 shrink-0 overflow-hidden rounded-2xl bg-blush-soft sm:block">
        <div className="aspect-[3/4]">{dress && <DressArt dress={dress} view="front" className="size-full" />}</div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted">Rental #{rental.id}</p>
          <StatusBadge status={rental.status} />
        </div>
        <h2 className="mt-2 text-2xl leading-tight sm:text-3xl">
          {first.name}
          {more > 0 && <span className="text-lg text-muted"> + {more} more</span>}
        </h2>
        <p className="mt-1 text-[0.95rem] text-muted">{formatRange(start, end)}</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <p className="text-xl tabular-nums">{formatPeso(rental.totals.rentalFee)}</p>
          <Link to={`/rentals/${rental.id}`} className="link-underline min-h-11 py-2 font-medium text-burgundy">
            View Details →
          </Link>
        </div>
      </div>
    </article>
  )
}

export function RentalSummary({ rental }: { rental: Rental }) {
  const { totals } = rental
  return (
    <div className="space-y-8">
      <section aria-labelledby="rs-dresses">
        <h2 id="rs-dresses" className="mb-3 font-sans text-base font-medium text-ink">
          {rental.items.length > 1 ? 'Dresses' : 'Dress'}
        </h2>
        <ul className="divide-y divide-line rounded-2xl border border-line bg-ivory">
          {rental.items.map((it) => {
            const dress = artFor(it.dressId)
            return (
              <li key={it.dressId} className="flex items-center gap-4 p-3 sm:p-4">
                <div className="w-14 shrink-0 overflow-hidden rounded-xl bg-blush-soft">
                  <div className="aspect-[3/4]">{dress && <DressArt dress={dress} bare className="size-full" />}</div>
                </div>
                <div className="min-w-0 flex-1">
                  <Link to={`/dresses/${it.dressId}`} className="font-serif text-2xl leading-tight text-burgundy">
                    {it.name}
                  </Link>
                  <p className="text-[0.95rem] text-muted">
                    Size {it.size} · {formatRange(it.startDate, it.endDate)}
                  </p>
                </div>
                <p className="tabular-nums">{formatPeso(it.rentalFee)}</p>
              </li>
            )
          })}
        </ul>
      </section>

      <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
        <Info label="Rental dates">
          {rental.items.map((i) => (
            <span key={i.dressId} className="block">
              {i.startDate === i.endDate ? formatLong(i.startDate) : `${formatLong(i.startDate).replace(/, \d{4}$/, '')} – ${formatLong(i.endDate).replace(/, \d{4}$/, '')}`}
            </span>
          ))}
        </Info>
        <Info label={rental.fulfillment === 'delivery' ? 'Delivery to' : 'Pickup'}>
          {rental.fulfillment === 'delivery' ? rental.address : 'Renté Studio — we will message you the details.'}
        </Info>
        <Info label="Customer">
          {rental.customer.name}
          <span className="block text-muted">{rental.customer.email}</span>
          <span className="block text-muted">{rental.customer.phone}</span>
        </Info>
        <Info label="Payment status">{rental.paymentStatus}</Info>
        {rental.notes && <Info label="Notes">{rental.notes}</Info>}
      </dl>

      <section aria-labelledby="rs-total" className="rounded-3xl bg-blush-soft/70 p-5 sm:p-6">
        <h2 id="rs-total" className="sr-only">
          Totals
        </h2>
        <dl className="space-y-2">
          <Line label="Rental fee" value={totals.rentalFee} />
          <Line label="Security deposit" value={totals.deposit} note="refundable after inspection" />
          <Line label="Delivery" value={totals.delivery} />
          <div className="flex items-baseline justify-between border-t border-burgundy/20 pt-3">
            <dt className="font-serif text-2xl text-burgundy">Total</dt>
            <dd className="font-serif text-3xl tabular-nums text-burgundy">{formatPeso(totals.total)}</dd>
          </div>
        </dl>
      </section>
    </div>
  )
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="mt-0.5">{children}</dd>
    </div>
  )
}

function Line({ label, value, note }: { label: string; value: number; note?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt>
        {label}
        {note && <span className="ml-2 text-sm text-muted">{note}</span>}
      </dt>
      <dd className="tabular-nums">{formatPeso(value)}</dd>
    </div>
  )
}

export function StatusTimeline({ rental }: { rental: Rental }) {
  if (rental.status === 'Cancelled') return null
  const current = STATUS_FLOW.indexOf(rental.status)
  return (
    <ol className="space-y-0" aria-label="Rental progress">
      {STATUS_FLOW.map((s, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={s} aria-current={active ? 'step' : undefined} className="relative flex gap-4 pb-5 last:pb-0">
            {i < STATUS_FLOW.length - 1 && <span aria-hidden className={cn('absolute left-[0.7rem] top-6 h-full w-px', done ? 'bg-burgundy' : 'bg-line')} />}
            <span
              className={cn(
                'relative z-10 mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border',
                done && 'border-burgundy bg-burgundy text-ivory',
                active && 'border-burgundy bg-blush-soft',
                !done && !active && 'border-line bg-cream',
              )}
            >
              {done && <Check className="size-3.5" aria-hidden />}
              {active && <span className="size-2 rounded-full bg-burgundy" />}
            </span>
            <span className={cn(active ? 'font-medium text-burgundy' : done ? 'text-ink' : 'text-muted')}>{s}</span>
          </li>
        )
      })}
    </ol>
  )
}
