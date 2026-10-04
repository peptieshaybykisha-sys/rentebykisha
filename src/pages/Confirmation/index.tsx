import { Link, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { Check } from 'lucide-react'
import Container from '@/components/common/Container'
import { ErrorState } from '@/components/common/States'
import { RentalSummary } from '@/components/rentals/RentalParts'
import { ButtonLink } from '@/components/ui/Button'
import StatusBadge from '@/components/ui/StatusBadge'
import { useAuthStore, useMockDb } from '@/stores'

export default function Confirmation() {
  const { id } = useParams()
  const user = useAuthStore((s) => s.user)
  const rental = useMockDb((s) => s.rentals.find((r) => r.id === id && r.userId === user?.id))

  if (!rental)
    return (
      <ErrorState title="We could not find that request" to="/rentals" cta="View my rentals">
        It may belong to a different account.
      </ErrorState>
    )

  return (
    <Container className="max-w-3xl pb-8 pt-12 sm:pt-16">
      <div className="text-center">
        <motion.span
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 16 }}
          className="mx-auto grid size-16 place-items-center rounded-full bg-burgundy text-ivory"
        >
          <Check className="size-8" aria-hidden />
        </motion.span>
        <h1 className="mt-6 text-5xl sm:text-6xl">Rental Request Submitted</h1>
        <p className="mt-3 font-serif text-3xl text-burgundy-soft">#{rental.id}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-3 text-left">
          <div>
            <p className="text-sm text-muted">Payment Status</p>
            <p className="font-medium">{rental.paymentStatus}</p>
          </div>
          <div>
            <p className="mb-0.5 text-sm text-muted">Rental Status</p>
            <StatusBadge status={rental.status} />
          </div>
        </div>
        <p className="mx-auto mt-6 max-w-md text-muted">
          Thank you! Our team will verify your GCash payment and confirm your dress. We will text {rental.customer.phone}.
        </p>
      </div>

      <div className="mt-12 rounded-[2rem] border border-line bg-ivory p-5 sm:p-8">
        <RentalSummary rental={rental} />
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <ButtonLink to="/rentals" size="lg">
          View My Rentals
        </ButtonLink>
        <Link to="/dresses" className="link-underline inline-flex min-h-14 items-center px-4 font-medium text-burgundy">
          Keep browsing
        </Link>
      </div>
    </Container>
  )
}
