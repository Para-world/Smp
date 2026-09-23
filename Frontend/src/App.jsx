import { useEffect } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

import Header from './components/Header'
import Hero from './components/Hero'
import SocialProof from './components/SocialProof'
import ProblemSolution from './components/ProblemSolution'
import FeaturesGrid from './components/FeaturesGrid'
import RolePortals from './components/RolePortals'
import ProductCockpit from './components/ProductCockpit'
import HowItWorks from './components/HowItWorks'
import StakeholderValue from './components/StakeholderValue'
import Analytics from './components/Analytics'
import Testimonials from './components/Testimonials'
import Security from './components/Security'
import FAQ from './components/FAQ'
import CTABanner from './components/CTABanner'
import Footer from './components/Footer'
import CustomCursor from './components/CustomCursor'

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    })

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])

  return (
    <div className="bg-slate-50 dark:bg-[#050811] font-body-md text-body-md text-slate-800 dark:text-slate-300 antialiased transition-colors duration-300">
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
    </div>
  )
}

export default App
