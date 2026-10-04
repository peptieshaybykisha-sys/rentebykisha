import Container, { PageTitle } from '@/components/common/Container'
import HowItWorksSteps from '@/components/common/HowItWorksSteps'
import { ButtonLink } from '@/components/ui/Button'
import { useHowItWorks } from '@/hooks/useSettings'

export default function HowItWorks() {
  const { faq } = useHowItWorks()
  return (
    <Container className="pb-8">
      <PageTitle title="How it works">From first look to final return.</PageTitle>
      <div className="mt-6">
        <HowItWorksSteps />
      </div>

      <section aria-labelledby="faq" className="mx-auto mt-24 max-w-3xl">
        <h2 id="faq" className="mb-6 text-center text-4xl sm:text-5xl">
          Good to know
        </h2>
        <div className="divide-y divide-line border-y border-line">
          {faq.map((f) => (
            <details key={f.q} className="group py-1">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 font-serif text-2xl text-burgundy [&::-webkit-details-marker]:hidden">
                {f.q}
                <span aria-hidden className="text-3xl font-light transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="pb-5 pr-8 text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <div className="mt-14 text-center">
        <ButtonLink to="/dresses" size="lg">
          Find your dress
        </ButtonLink>
      </div>
    </Container>
  )
}
