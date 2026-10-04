import { ReceiptText } from 'lucide-react'
import Container, { PageTitle } from '@/components/common/Container'
import { EmptyState } from '@/components/common/States'
import { RentalCard } from '@/components/rentals/RentalParts'
import { useAccount } from '@/stores/account'

export default function Rentals() {
  const { rentals, loaded, error } = useAccount()

  return (
    <Container className="max-w-4xl pb-8">
      <PageTitle title="My Rentals" />
      {!loaded ? (
        <p className="py-16 text-center text-muted" aria-busy="true">
          Loading your rentals…
        </p>
      ) : error ? (
        <EmptyState title="We could not load your rentals">Please refresh the page, or try again in a moment.</EmptyState>
      ) : rentals.length ? (
        <ul className="space-y-4">
          {rentals.map((r) => (
            <li key={r.id}>
              <RentalCard rental={r} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon={ReceiptText} title="No rentals yet." to="/dresses" cta="Find a dress for your next occasion" />
      )}
    </Container>
  )
}
