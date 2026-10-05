import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Ruler, ShieldCheck } from 'lucide-react'
import Container from '@/components/common/Container'
import { ErrorState, Notice } from '@/components/common/States'
import { AvailabilityDot } from '@/components/dresses/DressCard'
import DressPhoto from '@/components/dresses/DressPhoto'
import RentalDatePicker from '@/components/dresses/RentalDatePicker'
import SizeGuide from '@/components/dresses/SizeGuide'
import WishlistButton from '@/components/dresses/WishlistButton'
import { Button, ButtonLink } from '@/components/ui/Button'
import { DetailSkeleton } from '@/components/ui/Skeleton'
import { useDress } from '@/hooks/useDresses'
import { checkAvailability } from '@/lib/availability'
import { rentalDays, rentalFee } from '@/lib/pricing'
import { cn, formatPeso } from '@/lib/utils'
import { useCartStore } from '@/stores'
import { notify } from '@/lib/toast'
import type { Dress, Size } from '@/types'

export default function DressDetails() {
  const { id } = useParams()
  const { dress, loading } = useDress(id)
  if (loading) return <DetailSkeleton label="Loading dress…" />
  if (!dress)
    return (
      <ErrorState title="We could not find that dress" to="/dresses" cta="Browse the collection">
        It may have been retired from the collection, or the link is not quite right.
      </ErrorState>
    )
  // key resets all local state when navigating between dresses
  return <DressView key={dress.id} dress={dress} />
}

function DressView({ dress }: { dress: Dress }) {
  const inCart = useCartStore((s) => s.items.find((i) => i.dressId === dress.id))
  const addToCart = useCartStore((s) => s.add)

  const [imgIndex, setImgIndex] = useState(0)
  const [size, setSize] = useState<Size | undefined>(inCart?.size)
  const [range, setRange] = useState<{ start?: string; end?: string }>({ start: inCart?.startDate, end: inCart?.endDate })
  const [guideOpen, setGuideOpen] = useState(false)
  const [attempted, setAttempted] = useState(false)
  const hasGuide = !!dress.sizeGuide?.rows.length

  const unavailable = dress.status === 'unavailable'
  const availability = checkAvailability(dress, range.start, range.end)
  const canAdd = !!size && availability.state === 'available'
  const days = range.start && range.end ? rentalDays(range.start, range.end) : 0

  const submit = () => {
    setAttempted(true)
    if (!canAdd || !range.start || !range.end || !size) return
    addToCart({ dressId: dress.id, size, startDate: range.start, endDate: range.end })
    notify(inCart ? 'Rental updated.' : `${dress.name} is in your rental cart.`, { label: 'View cart', href: '/cart' })
  }

  return (
    <Container className="pb-8 pt-6 sm:pt-10">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted">
        <Link to="/dresses" className="hover:text-burgundy">
          Dresses
        </Link>
        <span aria-hidden> / </span>
        <Link to={`/dresses?category=${dress.category}`} className="hover:text-burgundy">
          {dress.category}
        </Link>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        {/* gallery */}
        <div className="flex flex-col gap-3 lg:sticky lg:top-24 lg:flex-row-reverse lg:self-start">
          <div className="relative aspect-[3/4] flex-1 overflow-hidden rounded-[2rem] bg-blush-soft">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={imgIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0"
              >
                <DressPhoto dress={dress} index={imgIndex} priority className={cn('size-full object-cover', unavailable && 'opacity-70 saturate-50')} />
              </motion.div>
            </AnimatePresence>
            <WishlistButton dressId={dress.id} name={dress.name} className="absolute right-4 top-4 z-10" />
          </div>
          <ul className={cn("flex gap-3 lg:flex-col", dress.images.length < 2 && "hidden")} aria-label="Dress photos">
            {dress.images.map((img, i) => (
              <li key={img.path} className="w-1/4 lg:w-20">
                <button
                  type="button"
                  onClick={() => setImgIndex(i)}
                  aria-label={`Show photo ${i + 1}`}
                  aria-current={i === imgIndex}
                  className={cn(
                    'block aspect-[3/4] w-full overflow-hidden rounded-xl bg-blush-soft ring-offset-2 ring-offset-cream transition',
                    i === imgIndex ? 'ring-2 ring-burgundy' : 'opacity-75 hover:opacity-100',
                  )}
                >
                  <DressPhoto dress={dress} index={i} className="size-full object-cover" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* info */}
        <div>
          <p className="text-[0.95rem] text-muted">{dress.category} Collection</p>
          <h1 className="mt-1 text-5xl sm:text-6xl">{dress.name}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1">
            <p className="text-2xl">
              {formatPeso(dress.price)} <span className="text-base text-muted">/ rental</span>
            </p>
            <AvailabilityDot available={!unavailable} />
          </div>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/90">{dress.description}</p>
          <ul className="mt-5 grid gap-1.5 text-[0.95rem] text-muted sm:grid-cols-2">
            {dress.details.map((d) => (
              <li key={d} className="flex gap-2">
                <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-gold" />
                {d}
              </li>
            ))}
          </ul>

          {unavailable && (
            <Notice tone="info" className="mt-8">
              <strong className="font-medium">This dress is not available right now.</strong> It will be back in the collection soon. Save it to your wishlist, or{' '}
              <Link to={`/dresses?category=${dress.category}`} className="underline">
                see other {dress.category.toLowerCase()} dresses
              </Link>
              .
            </Notice>
          )}

          {/* size */}
          <fieldset className="mt-9" disabled={unavailable}>
            <div className="mb-3 flex items-center justify-between">
              <legend className="text-lg font-medium">Size</legend>
              {hasGuide && (
                <button type="button" onClick={() => setGuideOpen(true)} className="link-underline flex min-h-11 items-center gap-1.5 text-[0.95rem] text-burgundy">
                  <Ruler className="size-4" aria-hidden /> Size Guide
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2.5">
              {dress.sizes.map((s) => (
                <label key={s} className="cursor-pointer">
                  <input type="radio" name="size" value={s} checked={size === s} onChange={() => setSize(s)} className="peer sr-only" />
                  <span className="grid size-14 place-items-center rounded-full border border-line bg-ivory text-base transition-colors peer-checked:border-burgundy peer-checked:bg-burgundy peer-checked:text-ivory peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-burgundy hover:border-burgundy">
                    {s}
                  </span>
                </label>
              ))}
            </div>
            {attempted && !size && (
              <p role="alert" className="mt-2 text-sm text-red-800">
                Please choose a size.
              </p>
            )}
          </fieldset>

          {/* dates */}
          <section className="mt-9" aria-labelledby="dates-title">
            <h2 id="dates-title" className="mb-3 font-sans text-lg font-medium text-ink">
              Rental dates
            </h2>
            <RentalDatePicker dress={dress} start={range.start} end={range.end} onChange={setRange} />
            {attempted && availability.state === 'idle' && !unavailable && (
              <p role="alert" className="mt-2 text-sm text-red-800">
                Please choose your pick-up and return dates.
              </p>
            )}
          </section>

          {/* summary + CTA */}
          <div className="mt-8 rounded-3xl bg-blush-soft/70 p-5">
            <dl className="space-y-1.5 text-[0.95rem]">
              <div className="flex justify-between">
                <dt className="text-muted">Rental fee{days ? ` · ${days} ${days === 1 ? 'day' : 'days'}` : ''}</dt>
                <dd>{formatPeso(days && range.start && range.end ? rentalFee(dress, range.start, range.end) : dress.price)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Security deposit (refundable)</dt>
                <dd>{formatPeso(dress.deposit)}</dd>
              </div>
            </dl>
            <p className="mt-3 flex gap-2 text-sm text-muted">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-burgundy-soft" aria-hidden />
              The deposit may be refunded after your returned dress passes inspection.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="lg" onClick={submit} disabled={unavailable} className="flex-1 sm:flex-none sm:px-12">
              {inCart ? 'Update Rental Cart' : 'Add to Rental Cart'}
            </Button>
            {inCart && (
              <ButtonLink to="/cart" variant="secondary" size="lg">
                View Rental Cart
              </ButtonLink>
            )}
          </div>
          {attempted && !canAdd && !unavailable && availability.state !== 'idle' && (
            <p role="alert" className="mt-3 text-sm text-red-800">
              Please pick dates that are available before adding this dress.
            </p>
          )}
        </div>
      </div>
      {hasGuide && <SizeGuide guide={dress.sizeGuide!} open={guideOpen} onClose={() => setGuideOpen(false)} />}
    </Container>
  )
}
