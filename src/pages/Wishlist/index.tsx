import { Heart } from 'lucide-react'
import Container, { PageTitle } from '@/components/common/Container'
import { EmptyState } from '@/components/common/States'
import DressGrid from '@/components/dresses/DressGrid'
import { dresses } from '@/data/dresses'
import { useWishlistStore } from '@/stores'

export default function Wishlist() {
  const ids = useWishlistStore((s) => s.ids)
  const saved = dresses.filter((d) => ids.includes(d.id))
  return (
    <Container className="pb-8">
      <PageTitle title="My Saved Dresses" />
      {saved.length ? (
        <DressGrid dresses={saved} />
      ) : (
        <EmptyState icon={Heart} title="Your saved dresses are waiting for you." to="/dresses" cta="Explore the collection">
          Tap the heart on any dress to keep it here.
        </EmptyState>
      )}
    </Container>
  )
}
