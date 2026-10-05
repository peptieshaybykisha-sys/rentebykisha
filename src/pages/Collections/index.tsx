import { Link } from 'react-router-dom'
import Container, { PageTitle } from '@/components/common/Container'
import DressCard from '@/components/dresses/DressCard'
import { CATEGORIES, OCCASION_BLURBS } from '@/constants/catalog'
import { DressGridSkeleton } from '@/components/ui/Skeleton'
import { useCatalogStatus, useDressList } from '@/hooks/useDresses'

export default function Collections() {
  const dresses = useDressList()
  const loading = useCatalogStatus() === 'loading'
  return (
    <Container className="pb-8">
      <PageTitle script="The lookbook" title="Collections">
        Two ways to dress for the moment.
      </PageTitle>
      {loading ? (
        <DressGridSkeleton count={8} />
      ) : (
      <div className="space-y-20">
        {CATEGORIES.map((c) => {
          const list = dresses.filter((d) => d.category === c)
          return (
            <section key={c} aria-labelledby={`col-${c}`}>
              <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
                <div>
                  <h2 id={`col-${c}`} className="text-4xl sm:text-5xl">
                    {c}
                  </h2>
                  <p className="mt-1 text-muted">{OCCASION_BLURBS[c]}</p>
                </div>
                <Link to={`/dresses?category=${c}`} className="link-underline font-medium text-burgundy">
                  View all →
                </Link>
              </div>
              {list.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line py-14 text-center">
                  <span className="text-xs font-medium uppercase tracking-[0.3em] text-burgundy">Coming soon</span>
                  <p className="mt-2 text-muted">New {c.toLowerCase()} styles are on their way.</p>
                </div>
              ) : (
                <ul className="no-scrollbar -mx-5 flex snap-x gap-5 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-4">
                  {list.slice(0, 4).map((d) => (
                    <li key={d.id} className="w-[62vw] max-w-[18rem] shrink-0 snap-start sm:w-auto sm:max-w-none">
                      <DressCard dress={d} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )
        })}
      </div>
      )}
    </Container>
  )
}
