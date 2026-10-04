import { AnimatePresence } from 'motion/react'
import { ShoppingBag } from 'lucide-react'
import CartItemRow from '@/components/cart/CartItemRow'
import OrderSummary from '@/components/cart/OrderSummary'
import Container, { PageTitle } from '@/components/common/Container'
import { EmptyState, Notice } from '@/components/common/States'
import { ButtonLink } from '@/components/ui/Button'
import { getDress } from '@/hooks/useDresses'
import { checkAvailability } from '@/lib/availability'
import { DELIVERY_FEE, computeTotals } from '@/lib/pricing'
import { formatPeso } from '@/lib/utils'
import { useCartStore } from '@/stores'

export default function Cart() {
  const items = useCartStore((s) => s.items)
  const entries = items.flatMap((item) => {
    const dress = getDress(item.dressId)
    return dress ? [{ item, dress }] : []
  })
  const blocked = entries.some(({ item, dress }) => checkAvailability(dress, item.startDate, item.endDate).state !== 'available')
  const totals = computeTotals(items, getDress, 'delivery')

  if (!entries.length)
    return (
      <Container>
        <EmptyState icon={ShoppingBag} title="Your rental cart is empty" to="/dresses" cta="Find a dress for your next occasion">
          Choose a dress, pick your dates and it will wait for you here.
        </EmptyState>
      </Container>
    )

  return (
    <Container className="pb-8">
      <PageTitle title="Rental Cart" />
      <div className="grid gap-10 lg:grid-cols-[1fr_24rem] lg:items-start xl:grid-cols-[1fr_26rem]">
        <ul className="space-y-4" aria-label="Dresses in your cart">
          <AnimatePresence initial={false}>
            {entries.map(({ item, dress }) => (
              <CartItemRow key={item.dressId} item={item} dress={dress} />
            ))}
          </AnimatePresence>
        </ul>

        <aside aria-labelledby="summary-title" className="rounded-[1.75rem] border border-line bg-ivory p-6 lg:sticky lg:top-24">
          <h2 id="summary-title" className="mb-5 text-3xl">
            Summary
          </h2>
          <OrderSummary totals={totals} deliveryNote={`Delivery is ${formatPeso(DELIVERY_FEE)}, or choose free pickup at checkout.`} />
          {blocked && (
            <Notice className="mt-5">One of your dresses is no longer available for its dates. Please change the dates to continue.</Notice>
          )}
          <ButtonLink to={blocked ? '#' : '/checkout'} size="lg" className="mt-6 w-full" aria-disabled={blocked} onClick={(e) => blocked && e.preventDefault()}>
            Proceed to Checkout
          </ButtonLink>
          <ButtonLink to="/dresses" variant="ghost" className="mt-2 w-full">
            Keep browsing
          </ButtonLink>
        </aside>
      </div>
    </Container>
  )
}
