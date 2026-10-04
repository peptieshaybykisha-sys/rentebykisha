import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronDown, ShoppingBag } from 'lucide-react'
import OrderSummary from '@/components/cart/OrderSummary'
import { CustomerStep, DetailsStep, PaymentStep, Stepper } from '@/components/checkout/CheckoutSteps'
import Container, { PageTitle } from '@/components/common/Container'
import { EmptyState, Notice } from '@/components/common/States'
import { useDressLookup } from '@/hooks/useDresses'
import { createRental } from '@/lib/api'
import { refreshCatalog } from '@/stores/catalog'
import { checkAvailability } from '@/lib/availability'
import { computeTotals } from '@/lib/pricing'
import { formatPeso } from '@/lib/utils'
import { useAuthStore, useCartStore, useCheckoutStore } from '@/stores'

export default function Checkout() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)!
  const items = useCartStore((s) => s.items)
  const getDress = useDressLookup()
  const clearCart = useCartStore((s) => s.clear)
  const draft = useCheckoutStore()
  const resetDraft = useCheckoutStore((s) => s.reset)

  const [step, setStep] = useState(1)
  const [receipt, setReceipt] = useState<{ name: string; dataUrl: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const totals = computeTotals(items, getDress, draft.fulfillment)
  const stale = items.filter((it) => {
    const d = getDress(it.dressId)
    return !d || checkAvailability(d, it.startDate, it.endDate).state !== 'available'
  })

  if (!items.length)
    return (
      <Container>
        <EmptyState icon={ShoppingBag} title="Your rental cart is empty" to="/dresses" cta="Find a dress for your next occasion" />
      </Container>
    )

  if (stale.length)
    return (
      <Container className="max-w-2xl py-16">
        <Notice>
          <strong className="font-medium">One of your dresses is no longer available for its dates.</strong> Please update your rental cart before checking out.
        </Notice>
        <p className="mt-6 text-center">
          <Link to="/cart" className="link-underline font-medium text-burgundy">
            Back to rental cart →
          </Link>
        </p>
      </Container>
    )

  const submit = async () => {
    if (!receipt) return
    setSubmitting(true)
    setError('')
    try {
      const rentalId = await createRental({
        userId: user.id,
        items,
        customer: draft.customer,
        fulfillment: draft.fulfillment,
        address: draft.fulfillment === 'delivery' ? draft.address.trim() : undefined,
        notes: draft.notes.trim() || undefined,
        receipt,
      })
      navigate(`/confirmation/${rentalId}`, { replace: true })
      clearCart()
      resetDraft()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong on our side. Please try again.')
      void refreshCatalog() // someone may have just booked those dates
      setSubmitting(false)
    }
  }

  const summary = (
    <OrderSummary totals={totals} deliveryNote={draft.fulfillment === 'pickup' ? 'You chose free studio pickup.' : undefined} />
  )

  return (
    <Container className="pb-8">
      <PageTitle title="Checkout" />
      <Stepper step={step} />

      <details className="group mb-8 rounded-2xl border border-line bg-ivory lg:hidden">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between px-5 [&::-webkit-details-marker]:hidden">
          <span className="font-medium">Order summary</span>
          <span className="flex items-center gap-2 font-serif text-2xl text-burgundy">
            {formatPeso(totals.total)}
            <ChevronDown className="size-5 transition-transform group-open:rotate-180" aria-hidden />
          </span>
        </summary>
        <div className="px-5 pb-5">{summary}</div>
      </details>

      <div className="grid gap-12 lg:grid-cols-[1fr_24rem] lg:items-start">
        <div className="min-w-0 max-w-2xl">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={step} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} transition={{ duration: 0.22 }}>
              {step === 1 && (
                <CustomerStep
                  defaults={draft.customer.email ? draft.customer : { name: user.name, email: user.email, phone: user.phone }}
                  onNext={(customer) => {
                    draft.setDraft({ customer })
                    setStep(2)
                  }}
                />
              )}
              {step === 2 && (
                <DetailsStep
                  items={items}
                  defaults={{ fulfillment: draft.fulfillment, address: draft.address, notes: draft.notes }}
                  onBack={() => setStep(1)}
                  onNext={(v) => {
                    draft.setDraft(v)
                    setStep(3)
                  }}
                />
              )}
              {step === 3 && (
                <PaymentStep
                  total={totals.total}
                  receipt={receipt}
                  onReceipt={setReceipt}
                  onBack={() => setStep(2)}
                  onSubmit={submit}
                  submitting={submitting}
                  error={error}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <aside aria-labelledby="co-summary" className="hidden rounded-[1.75rem] border border-line bg-ivory p-6 lg:sticky lg:top-24 lg:block">
          <h2 id="co-summary" className="mb-5 text-3xl">
            Order summary
          </h2>
          <ul className="mb-5 space-y-1 border-b border-line pb-5 text-[0.95rem]">
            {items.map((it) => (
              <li key={it.dressId} className="flex justify-between gap-3">
                <span>{getDress(it.dressId)?.name}</span>
                <span className="text-muted">Size {it.size}</span>
              </li>
            ))}
          </ul>
          {summary}
        </aside>
      </div>
    </Container>
  )
}
