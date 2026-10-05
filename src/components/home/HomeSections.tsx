import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import Container from '@/components/common/Container'
import { EmptyState } from '@/components/common/States'
import HowItWorksSteps from '@/components/common/HowItWorksSteps'
import CategoryTabs, { type CategoryFilter } from '@/components/dresses/CategoryTabs'
import DressPhoto from '@/components/dresses/DressPhoto'
import DressCard from '@/components/dresses/DressCard'
import DressGrid from '@/components/dresses/DressGrid'
import { ButtonLink } from '@/components/ui/Button'
import { CATEGORIES, OCCASION_BLURBS } from '@/constants/catalog'
import { useDressList } from '@/hooks/useDresses'
import { DressGridSkeleton, FeaturedRowSkeleton } from '@/components/ui/Skeleton'
import { useCatalogStatus, useDresses } from '@/hooks/useDresses'
import { cn } from '@/lib/utils'
import type { Category } from '@/types'

export function CollectionSection() {
  const [cat, setCat] = useState<CategoryFilter>('All')
  const list = useDresses({ category: cat })
  const loading = useCatalogStatus() === 'loading'
  return (
    <Container as="section" id="collection" aria-labelledby="collection-title" className="scroll-mt-20 pb-6 pt-16 sm:pt-24">
      <div className="text-center">
        <h2 id="collection-title" className="text-5xl sm:text-7xl">
          Our Collection
        </h2>
        <p className="mx-auto mt-4 max-w-md text-lg text-muted">Find something for your next occasion.</p>
      </div>
      <CategoryTabs value={cat} onChange={setCat} className="mt-8 sm:mt-10" />
      <div className="mt-10" aria-live="polite">
        {loading ? (
          <DressGridSkeleton />
        ) : list.length ? (
          <DressGrid dresses={list.slice(0, 8)} />
        ) : (
          <EmptyState title="Nothing here yet" to="/dresses" cta="See every dress" />
        )}
      </div>
      <div className="mt-12 text-center">
        <ButtonLink to={cat === 'All' ? '/dresses' : `/dresses?category=${cat}`} variant="secondary" size="lg">
          View all {cat === 'All' ? 'dresses' : cat.toLowerCase()} <ArrowRight className="size-4" aria-hidden />
        </ButtonLink>
      </div>
    </Container>
  )
}

export function OccasionSection() {
  const dresses = useDressList()
  const [active, setActive] = useState<Category>('Evening')
  const sample = dresses.find((d) => d.category === active && d.images.length && d.status === 'available') ?? dresses.find((d) => d.images.length)
  return (
    <section aria-labelledby="occasion-title" className="mt-24 bg-blush-soft/60 py-20 sm:py-28">
      <Container className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
        <div>
          <h2 id="occasion-title" className="text-5xl sm:text-6xl">
            Choose your occasion
          </h2>
          <ul className="mt-8 divide-y divide-burgundy/10 border-y border-burgundy/10">
            {CATEGORIES.map((c) => {
              const count = dresses.filter((d) => d.category === c).length
              return (
                <li key={c}>
                  <Link
                    to={`/dresses?category=${c}`}
                    onMouseEnter={() => setActive(c)}
                    onFocus={() => setActive(c)}
                    className="group flex min-h-[4.5rem] items-center justify-between gap-4 py-3"
                  >
                    <span>
                      <span className={cn('block font-serif text-3xl transition-colors sm:text-4xl', active === c ? 'text-burgundy' : 'text-burgundy/70')}>{c}</span>
                      <span className="text-[0.95rem] text-muted">{OCCASION_BLURBS[c]}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2 text-sm text-muted">
                      {count === 0 ? 'Coming soon' : `${count} ${count === 1 ? 'gown' : 'gowns'}`}
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="relative mx-auto hidden aspect-[4/5] w-full max-w-md lg:block" aria-hidden>
          <div className="absolute inset-0 overflow-hidden rounded-t-[999px] rounded-b-3xl border border-gold/50 bg-cream shadow-soft">
            <AnimatePresence mode="wait">
              {sample && <motion.div key={sample.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="size-full">
                <DressPhoto dress={sample} className="size-full object-cover" />
              </motion.div>}
            </AnimatePresence>
            {!sample && (
              <div className="flex size-full items-center justify-center">
                <span className="font-serif text-3xl text-burgundy/50">Coming soon</span>
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  )
}

export function FeaturedSection() {
  const dresses = useDressList()
  const featured = dresses.filter((d) => d.featured)
  const loading = useCatalogStatus() === 'loading'
  const track = useRef<HTMLUListElement>(null)
  const [edge, setEdge] = useState({ start: true, end: true })

  const measure = useCallback(() => {
    const el = track.current
    if (!el) return
    setEdge({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 })
  }, [])

  useEffect(() => {
    const el = track.current
    if (!el) return
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [measure, loading, featured.length])

  const scrollByCard = (dir: 1 | -1) => {
    const el = track.current
    const card = el?.querySelector('li')
    if (!el || !card) return
    const step = card.getBoundingClientRect().width + 20
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollBy({ left: dir * step, behavior: reduce ? 'auto' : 'smooth' })
  }

  if (!loading && featured.length === 0) return null
  const overflowing = !edge.start || !edge.end
  const arrow =
    'grid size-11 place-items-center rounded-full border border-burgundy/25 bg-ivory text-burgundy transition-colors hover:bg-burgundy hover:text-ivory disabled:pointer-events-none disabled:opacity-35'
  return (
    <section aria-labelledby="featured-title" className="pt-16 sm:pt-24">
      <Container>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div>
            <h2 id="featured-title" className="text-4xl sm:text-6xl">
              Featured dresses
            </h2>
            <p className="mt-2 text-base text-muted sm:text-lg">The gowns everyone asks for first.</p>
          </div>
          <div className="flex items-center gap-5">
            <Link to="/dresses" className="link-underline pb-1 font-medium text-burgundy">
              See all dresses →
            </Link>
            {overflowing && (
              <div className="hidden items-center gap-2 sm:flex">
                <button type="button" onClick={() => scrollByCard(-1)} disabled={edge.start} aria-label="Previous dresses" className={arrow}>
                  <ChevronLeft className="size-5" aria-hidden />
                </button>
                <button type="button" onClick={() => scrollByCard(1)} disabled={edge.end} aria-label="Next dresses" className={arrow}>
                  <ChevronRight className="size-5" aria-hidden />
                </button>
              </div>
            )}
          </div>
        </div>
      </Container>
      {loading ? (
        <FeaturedRowSkeleton />
      ) : (
        <ul
          ref={track}
          onScroll={measure}
          tabIndex={0}
          aria-label="Featured dresses, scroll horizontally"
          className="no-scrollbar flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto scroll-smooth px-5 pb-4 focus-visible:outline-offset-[-4px] sm:scroll-px-8 sm:gap-5 sm:px-8 lg:scroll-px-12 lg:px-[max(3rem,calc((100vw-80rem)/2+3rem))]"
        >
          {featured.map((d) => (
            <li key={d.id} className="w-[72vw] max-w-[21rem] shrink-0 snap-start sm:w-[40vw] md:w-[30vw] lg:w-[21rem]">
              <DressCard dress={d} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

const FADE = 'linear-gradient(to right, transparent 0%, black 25%, black 75%, transparent 100%)'

export function FittingCta() {
  const dresses = useDressList()
  const dress = dresses.find((d) => d.featured && d.images.length) ?? dresses.find((d) => d.images.length)
  return (
    <section aria-labelledby="fitting-title" className="mt-24">
      <Container>
        <div className="grid items-center overflow-hidden rounded-[2.5rem] bg-burgundy text-blush-soft md:grid-cols-2">
          <div className="p-8 sm:p-14">
            <p className="font-script-title text-5xl text-blush sm:text-6xl">Going today?</p>
            <h2 id="fitting-title" className="mt-3 text-4xl text-ivory sm:text-5xl">
              Try it on before you decide.
            </h2>
            <p className="mt-4 max-w-md text-lg text-blush">
              Visit our studio, try on your favourites and let us help you choose. Fittings are free and take about 30 minutes.
            </p>
            <ButtonLink to="/fitting" variant="soft" size="lg" className="mt-8">
              Schedule My Fitting
            </ButtonLink>
          </div>
          <div className="relative hidden h-full min-h-[26rem] overflow-hidden bg-burgundy md:block">
            {dress ? (
              <>
                {/* full photo on the card colour; its edges fade into the burgundy so nothing is cropped or boxed in */}
                <DressPhoto
                  dress={dress}
                  priority
                  className="absolute inset-0 size-full object-contain"
                  style={{ maskImage: FADE, WebkitMaskImage: FADE }}
                />
              </>
            ) : (
              <div className="absolute inset-0 grid place-items-center">
                <span className="font-serif text-3xl text-burgundy/50">Coming soon</span>
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  )
}

export function HowItWorksSection() {
  return (
    <section aria-labelledby="how-title" className="pt-24">
      <Container>
        <h2 id="how-title" className="mb-12 text-center text-5xl sm:text-6xl">
          How renting works
        </h2>
        <HowItWorksSteps />
        <p className="mt-12 text-center">
          <Link to="/how-it-works" className="link-underline font-medium text-burgundy">
            Deposits, delivery and returns →
          </Link>
        </p>
      </Container>
    </section>
  )
}
