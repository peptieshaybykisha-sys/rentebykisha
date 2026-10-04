import { Heart } from 'lucide-react'
import Container, { PageTitle } from '@/components/common/Container'
import { EmptyState } from '@/components/common/States'
import DressGrid from '@/components/dresses/DressGrid'
import { DressGridSkeleton } from '@/components/ui/Skeleton'
import { useCatalogStatus, useDressList } from '@/hooks/useDresses'
import { useWishlistStore } from '@/stores'

export default function Wishlist() {
  const dresses = useDressList()
  const ids = useWishlistStore((s) => s.ids)
  const saved = dresses.filter((d) => ids.includes(d.id))
  const loading = useCatalogStatus() === 'loading' && ids.length > 0
  return (
    <Container className="pb-8">
      <PageTitle title="My Saved Dresses" />
      {loading ? (
        <DressGridSkeleton count={Math.min(ids.length, 8)} />
      ) : saved.length ? (
        <DressGrid dresses={saved} />
      ) : (
        <EmptyState icon={Heart} title="Your saved dresses are waiting for you." to="/dresses" cta="Explore the collection">
          Tap the heart on any dress to keep it here.
        </EmptyState>
      )}
    </Container>
  )
}
