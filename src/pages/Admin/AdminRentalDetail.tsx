import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Notice } from '@/components/common/States'
import { RentalSummary } from '@/components/rentals/RentalParts'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Field'
import { ListSkeleton, Skeleton } from '@/components/ui/Skeleton'
import StatusBadge from '@/components/ui/StatusBadge'
import { ALL_STATUSES, PAYMENT_STATUSES } from '@/constants/rental'
import { useReceiptUrl } from '@/hooks/useReceiptUrl'
import { adminReceiptUrl, listRentals, updateRental } from '@/lib/adminApi'
import { formatLong } from '@/lib/utils'
import { notify } from '@/lib/toast'
import type { PaymentStatus, Rental, RentalStatus } from '@/types'

export default function AdminRentalDetail() {
  const { id } = useParams()
  const [rental, setRental] = useState<Rental | null | undefined>(undefined)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const receipt = useReceiptUrl(rental?.receiptPath, adminReceiptUrl)

  const [version, setVersion] = useState(0)

  useEffect(() => {
    let cancelled = false
    listRentals()
      .then((all) => !cancelled && setRental(all.find((r) => r.id === id) ?? null))
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : 'Could not load this rental.'))
    return () => {
      cancelled = true
    }
  }, [id, version])

  const apply = async (patch: { status?: RentalStatus; paymentStatus?: PaymentStatus }, message: string) => {
    if (!rental) return
    setBusy(true)
    setError('')
    try {
      await updateRental(rental.id, patch)
      setVersion((v) => v + 1)
      notify(message)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'We could not save that change.')
    } finally {
      setBusy(false)
    }
  }

  if (rental === undefined) return error ? <Notice>{error}</Notice> : <ListSkeleton rows={3} label="Loading rental…" />
  if (rental === null)
    return (
      <Notice>
        We could not find that rental. <Link to="/admin" className="underline">Back to rentals</Link>
      </Notice>
    )

  const verifying = rental.status === 'Payment Verification'

  return (
    <div className="mx-auto max-w-5xl">
      <Link to="/admin" className="link-underline text-[0.95rem] text-burgundy">
        ← All rentals
      </Link>
      <header className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-4xl">#{rental.id}</h1>
          <p className="text-sm text-muted">Requested {formatLong(rental.createdAt.slice(0, 10))}</p>
        </div>
        <StatusBadge status={rental.status} className="text-base" />
      </header>

      {error && <Notice className="mt-4">{error}</Notice>}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-8 rounded-[2rem] border border-line bg-ivory p-5 sm:p-8">
          <RentalSummary rental={rental} />
          <section aria-labelledby="receipt">
            <h2 id="receipt" className="mb-3 font-sans text-base font-medium">
              GCash receipt
            </h2>
            {receipt ? (
              <a href={receipt} target="_blank" rel="noreferrer">
                <img src={receipt} alt="Customer's GCash receipt" className="max-h-96 rounded-2xl border border-line" />
              </a>
            ) : (
              rental.receiptPath ? <Skeleton className="h-72 w-52" /> : <p className="text-sm text-muted">No receipt on file.</p>
            )}
          </section>
          <section aria-labelledby="history">
            <h2 id="history" className="mb-3 font-sans text-base font-medium">
              History
            </h2>
            <ol className="space-y-1 text-[0.95rem]">
              {rental.history.map((h, i) => (
                <li key={i} className="flex justify-between gap-4 border-b border-line/60 py-1.5">
                  <span>{h.status}</span>
                  <span className="text-muted">{new Date(h.at).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="space-y-5">
          {verifying && (
            <div className="space-y-3 rounded-[1.75rem] border border-blush bg-blush-soft/60 p-5">
              <h2 className="text-2xl">Verify payment</h2>
              <p className="text-sm text-muted">Check the receipt amount matches {rental.totals.total.toLocaleString('en-PH')} pesos.</p>
              <Button className="w-full" loading={busy} onClick={() => apply({ status: 'Confirmed', paymentStatus: 'Verified' }, 'Payment verified. Rental confirmed.')}>
                Verified, confirm rental
              </Button>
              <Button variant="secondary" className="w-full" loading={busy} onClick={() => apply({ status: 'Pending Payment', paymentStatus: 'Rejected' }, 'Payment rejected.')}>
                Reject payment
              </Button>
            </div>
          )}

          <div className="space-y-4 rounded-[1.75rem] border border-line bg-ivory p-5">
            <h2 className="text-2xl">Update</h2>
            <Select label="Rental status" value={rental.status} disabled={busy} onChange={(e) => apply({ status: e.target.value as RentalStatus }, 'Status updated.')}>
              {ALL_STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
            <Select label="Payment status" value={rental.paymentStatus} disabled={busy} onChange={(e) => apply({ paymentStatus: e.target.value as PaymentStatus }, 'Payment status updated.')}>
              {PAYMENT_STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
            <p className="text-sm text-muted">
              Returned, Under Inspection, Completed and Cancelled release the dress for new bookings. Mark the deposit as refunded once you have sent it back.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
