import Header from '../components/Header'
import Hero from '../components/Hero'
import SocialProof from '../components/SocialProof'
import ProblemSolution from '../components/ProblemSolution'
import FeaturesGrid from '../components/FeaturesGrid'
import RolePortals from '../components/RolePortals'
import ProductCockpit from '../components/ProductCockpit'
import HowItWorks from '../components/HowItWorks'
import StakeholderValue from '../components/StakeholderValue'
import Analytics from '../components/Analytics'
import Testimonials from '../components/Testimonials'
import Security from '../components/Security'
import FAQ from '../components/FAQ'
import CTABanner from '../components/CTABanner'
import Footer from '../components/Footer'
import CustomCursor from '../components/CustomCursor'

export default function LandingPage() {
  return (
    <>
      <CustomCursor />
      <Header />
      <main className="w-full pt-20 bg-slate-50 dark:bg-[#050811] min-h-screen transition-colors duration-300">
        <div className="flex flex-col w-full">
          <Hero />
          <SocialProof />
          <ProblemSolution />
          <FeaturesGrid />
          <RolePortals />
          <ProductCockpit />
          <HowItWorks />
          <StakeholderValue />
          <Analytics />
          <Testimonials />
          <Security />
          <FAQ />
          <CTABanner />
        </div>
      </main>
      <Footer />
    </>
  )
}
