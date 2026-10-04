import { ReceiptText } from 'lucide-react'
import Container, { PageTitle } from '@/components/common/Container'
import { EmptyState } from '@/components/common/States'
import { RentalCard } from '@/components/rentals/RentalParts'
import { useAuthStore, useMockDb } from '@/stores'

export default function Rentals() {
  const user = useAuthStore((s) => s.user)
  const rentals = useMockDb((s) => s.rentals).filter((r) => r.userId === user?.id)

  return (
    <Container className="max-w-4xl pb-8">
      <PageTitle title="My Rentals" />
      {rentals.length ? (
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
