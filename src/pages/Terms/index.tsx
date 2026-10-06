import Container, { PageTitle } from '@/components/common/Container'
import { useTerms } from '@/hooks/useSettings'
import { termsImages } from '@/lib/utils'
import { useCatalog } from '@/stores/catalog'

export default function Terms() {
  const terms = useTerms()
  const ready = useCatalog((s) => s.settingsReady)
  const images = termsImages(terms)

  return (
    <Container className="pb-16">
      <PageTitle title="Terms & Conditions" />
      {images.length ? (
        <div className="mx-auto max-w-3xl space-y-6">
          {images.map((image, i) => (
            <img key={image.path} src={image.url} alt={`Terms and conditions, page ${i + 1} of ${images.length}`} className="h-auto w-full rounded-2xl ring-1 ring-line" />
          ))}
        </div>
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
