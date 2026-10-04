import { Info } from 'lucide-react'
import type { Totals } from '@/types'
import { formatPeso } from '@/lib/utils'

export default function OrderSummary({ totals, deliveryNote }: { totals: Totals; deliveryNote?: string }) {
  const rows: [string, number, string?][] = [
    ['Rental Fee', totals.rentalFee],
    ['Security Deposit', totals.deposit, 'Refundable'],
    ['Delivery', totals.delivery, totals.delivery === 0 ? 'Free pickup' : undefined],
  ]
  return (
    <div>
      <dl className="space-y-3">
        {rows.map(([label, amount, tag]) => (
          <div key={label} className="flex items-baseline justify-between gap-4">
            <dt className="text-ink/80">
              {label}
              {tag && <span className="ml-2 text-sm text-muted">{tag}</span>}
            </dt>
            <dd className="tabular-nums">{formatPeso(amount)}</dd>
          </div>
        ))}
        <div className="flex items-baseline justify-between gap-4 border-t border-burgundy/20 pt-4">
          <dt className="font-serif text-2xl text-burgundy">Total</dt>
          <dd className="font-serif text-3xl tabular-nums text-burgundy">{formatPeso(totals.total)}</dd>
        </div>
      </dl>
      <p className="mt-5 flex gap-2.5 rounded-2xl bg-blush-soft/80 p-4 text-sm leading-relaxed text-burgundy">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        <span>
          The security deposit may be refunded after your returned dress passes inspection. {deliveryNote}
        </span>
      </p>
    </div>
  )
}
