import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Container from '@/components/common/Container'
import { ErrorState, Notice } from '@/components/common/States'
import { RentalSummary, StatusTimeline } from '@/components/rentals/RentalParts'
import { Button } from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import { DetailSkeleton, Skeleton } from '@/components/ui/Skeleton'
import StatusBadge from '@/components/ui/StatusBadge'
import { CANCELLABLE_STATUSES, STATUS_HELP } from '@/constants/rental'
import { useReceiptUrl } from '@/hooks/useReceiptUrl'
import { cancelRental } from '@/lib/api'
import { formatLong } from '@/lib/utils'
import { useAccount } from '@/stores/account'

export default function RentalDetail() {
  const { id } = useParams()
  const loaded = useAccount((s) => s.loaded)
  const rental = useAccount((s) => s.rentals.find((r) => r.id === id))
  const receipt = useReceiptUrl(rental?.receiptPath)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (!loaded) return <DetailSkeleton label="Loading your rental…" />
  if (!rental)
    return (
      <ErrorState title="We could not find that rental" to="/rentals" cta="Back to my rentals">
        It may belong to a different account.
      </ErrorState>
    )

  return (
    <Container className="max-w-5xl pb-8 pt-8 sm:pt-12">
      <Link to="/rentals" className="link-underline text-[0.95rem] text-burgundy">
        ← My rentals
      </Link>
      <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-muted">Rental</p>
          <h1 className="text-4xl sm:text-5xl">#{rental.id}</h1>
          <p className="mt-1 text-sm text-muted">Requested {formatLong(rental.createdAt.slice(0, 10))}</p>
        </div>
        <StatusBadge status={rental.status} className="text-base" />
      </header>
      <p className="mt-3 text-muted">{STATUS_HELP[rental.status]}</p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_17rem]">
        <div className="rounded-[2rem] border border-line bg-ivory p-5 sm:p-8">
          <RentalSummary rental={rental} />
          {rental.receiptPath && (
            <section aria-labelledby="receipt" className="mt-8">
              <h2 id="receipt" className="mb-3 font-sans text-base font-medium">
                GCash receipt
              </h2>
              {receipt ? (
                <img src={receipt} alt="Uploaded GCash receipt" loading="lazy" className="max-h-72 rounded-2xl border border-line" />
              ) : (
                <Skeleton className="h-72 w-52" />
              )}
            </section>
          )}
        </div>

        <aside className="space-y-6">
          {rental.status !== 'Cancelled' && (
            <section aria-labelledby="progress" className="rounded-[1.75rem] border border-line bg-ivory p-5">
              <h2 id="progress" className="mb-4 text-2xl">
                Progress
              </h2>
              <StatusTimeline rental={rental} />
            </section>
          )}
          {CANCELLABLE_STATUSES.includes(rental.status) && (
            <Button variant="secondary" className="w-full" onClick={() => setConfirmOpen(true)}>
              Cancel this rental
            </Button>
          )}
        </aside>
      </div>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Cancel this rental?">
        <p className="text-muted">Your dates will be released. If you already paid, we will refund your payment to your GCash within 3 business days.</p>
        {error && <Notice className="mt-4">{error}</Notice>}
        <div className="mt-6 flex gap-3">
          <Button
            loading={busy}
            onClick={async () => {
              setBusy(true)
              setError('')
              try {
                await cancelRental(rental.id)
                setConfirmOpen(false)
              } catch (e) {
                setError(e instanceof Error ? e.message : 'We could not cancel this rental.')
              } finally {
                setBusy(false)
              }
            }}
          >
            Yes, cancel rental
          </Button>
          <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
            Keep it
          </Button>
        </div>
      </Dialog>
    </Container>
  )
}
