import BoutiqueHero from '@/components/home/BoutiqueHero'
import { CollectionSection, FeaturedSection, FittingCta, HowItWorksSection, OccasionSection } from '@/components/home/HomeSections'

export default function Home() {
  return (
    <>
      <BoutiqueHero />
      <CollectionSection />
      <OccasionSection />
      <FeaturedSection />
      <FittingCta />
      <HowItWorksSection />
    </>
  )
}
