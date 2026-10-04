import Container, { PageTitle } from '@/components/common/Container'
import HowItWorksSteps from '@/components/common/HowItWorksSteps'
import { ButtonLink } from '@/components/ui/Button'
import { DELIVERY_FEE, INCLUDED_DAYS, LEAD_DAYS, MAX_DAYS } from '@/lib/pricing'
import { formatPeso } from '@/lib/utils'

const FAQ = [
  {
    q: 'What is the security deposit?',
    a: 'A refundable amount held while the dress is with you. After you return the dress and it passes our inspection, the deposit is refunded to your GCash. If there is damage beyond normal wear, we will tell you before deducting anything.',
  },
  {
    q: 'How long can I keep the dress?',
    a: `Each rental price includes ${INCLUDED_DAYS} days. You can extend up to ${MAX_DAYS} days in total; extra days are about 20% of the rental price each.`,
  },
  {
    q: 'How far ahead should I book?',
    a: `Please book at least ${LEAD_DAYS} days before your pick-up date so we can steam, pack and prepare your dress.`,
  },
  {
    q: 'Pickup or delivery?',
    a: `Pick up from our studio for free, or have it delivered for ${formatPeso(DELIVERY_FEE)} within Metro Manila.`,
  },
  {
    q: 'Who cleans the dress?',
    a: 'We do. Please do not wash or iron it. Just return it as it is, and we will take care of the rest.',
  },
  {
    q: 'How do I pay?',
    a: 'For now we accept GCash. Send the total to our GCash number and upload your receipt at checkout. Our team verifies it manually and confirms your rental.',
  },
]

export default function HowItWorks() {
  return (
    <Container className="pb-8">
      <PageTitle title="How it works">Five easy steps from first look to final return.</PageTitle>
      <div className="mt-6">
        <HowItWorksSteps />
      </div>

      <section aria-labelledby="faq" className="mx-auto mt-24 max-w-3xl">
        <h2 id="faq" className="mb-6 text-center text-4xl sm:text-5xl">
          Good to know
        </h2>
        <div className="divide-y divide-line border-y border-line">
          {FAQ.map((f) => (
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
