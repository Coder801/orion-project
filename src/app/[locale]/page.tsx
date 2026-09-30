import { Faq } from '@/features/landing/Faq'
import { Features } from '@/features/landing/Features'
import { FiatAndCrypto } from '@/features/landing/FiatAndCrypto'
import { FinalCta } from '@/features/landing/FinalCta'
import { Hero } from '@/features/landing/Hero'
import { LandingFooter } from '@/features/landing/LandingFooter'
import { LandingHeader } from '@/features/landing/LandingHeader'
import { Pricing } from '@/features/landing/Pricing'

export default function LandingPage() {
  return (
    <>
      <LandingHeader />
      <main id="main">
        <Hero />
        <Features />
        <FiatAndCrypto />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <LandingFooter />
    </>
  )
}
