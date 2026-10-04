import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Container from '@/components/common/Container'
import { ErrorState } from '@/components/common/States'
import { RentalSummary, StatusTimeline } from '@/components/rentals/RentalParts'
import { Button } from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import StatusBadge from '@/components/ui/StatusBadge'
import { advanceRental, cancelRental } from '@/lib/api'
import { CANCELLABLE_STATUSES, STATUS_HELP } from '@/constants/rental'
import { formatLong } from '@/lib/utils'
import { useAuthStore, useMockDb } from '@/stores'

export default function RentalDetail() {
  const { id } = useParams()
  const user = useAuthStore((s) => s.user)
  const rental = useMockDb((s) => s.rentals.find((r) => r.id === id && r.userId === user?.id))
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [busy, setBusy] = useState(false)

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
          {rental.receipt && (
            <section aria-labelledby="receipt" className="mt-8">
              <h2 id="receipt" className="mb-3 font-sans text-base font-medium">
                GCash receipt
              </h2>
              <img src={rental.receipt.dataUrl} alt="Uploaded GCash receipt" loading="lazy" className="max-h-72 rounded-2xl border border-line" />
            </section>
          )}
        </div>

        <aside className="space-y-6">
          {rental.status === 'Cancelled' ? null : (
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
          {import.meta.env.DEV && rental.status !== 'Cancelled' && rental.status !== 'Completed' && (
            <div className="rounded-2xl border border-dashed border-gold/60 p-4 text-sm text-muted">
              <p className="font-medium text-ink">Demo control</p>
              <p className="mb-2">Pretend our team moved this rental forward. Only shown in development.</p>
              <Button size="sm" variant="soft" onClick={() => advanceRental(rental.id)}>
                Advance to next status
              </Button>
            </div>
          )}
        </aside>
      </div>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Cancel this rental?">
        <p className="text-muted">Your dates will be released. If you already paid, we will refund your payment to your GCash within 3 business days.</p>
        <div className="mt-6 flex gap-3">
          <Button
            loading={busy}
            onClick={async () => {
              setBusy(true)
              await cancelRental(rental.id)
              setBusy(false)
              setConfirmOpen(false)
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
