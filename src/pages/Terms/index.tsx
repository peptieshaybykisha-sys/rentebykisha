import Container, { PageTitle } from '@/components/common/Container'
import { useTerms } from '@/hooks/useSettings'
import { useCatalog } from '@/stores/catalog'

export default function Terms() {
  const terms = useTerms()
  const ready = useCatalog((s) => s.settingsReady)
  const image = terms?.image

  return (
    <Container className="pb-16">
      <PageTitle title="Terms & Conditions" />
      {image ? (
        <img src={image.url} alt="Terms and conditions" className="mx-auto h-auto w-full max-w-3xl rounded-2xl ring-1 ring-line" />
      ) : (
        ready && (
          <p className="py-24 text-center font-serif text-4xl text-burgundy-soft" role="status">
            Coming soon
          </p>
        )
      )}
    </Container>
  )
}
