import { useEffect } from 'react'
import { ScrollTrigger } from './lib/gsap'
import { getCapabilities } from './lib/motion'
import { useIsDesktop, useReducedMotion } from './hooks/useMediaQuery'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import { usePointerTracking } from './hooks/usePointerTracking'

import EmberCanvas from './components/EmberCanvas'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Programs from './components/Programs'
import Schedule from './components/Schedule'
import Testimonials from './components/Testimonials'
import Location from './components/Location'
import FooterCTA from './components/FooterCTA'

// Low-end / capability flags are read once (they don't change at runtime).
const { lowEnd } = getCapabilities()

export default function App() {
  const isDesktop = useIsDesktop()
  const reducedMotion = useReducedMotion()

  // Render tiers:
  //  • full canvas  → desktop, motion ok, not low-end (more embers, pointer drift)
  //  • light canvas → mobile/tablet, motion ok, not low-end (fewer embers, no drift)
  //  • static gradient → reduced-motion OR low-end device
  const useCanvas = !reducedMotion && !lowEnd
  const animate = !reducedMotion
  // Pointer tracking feeds the spotlight drift AND the tiger's eye-tracking.
  const trackPointer = !reducedMotion && isDesktop

  useSmoothScroll(animate)
  usePointerTracking(trackPointer)

  // Recalculate ScrollTrigger positions once fonts/images settle.
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh()
    const t = setTimeout(refresh, 350)
    window.addEventListener('load', refresh)
    return () => {
      clearTimeout(t)
      window.removeEventListener('load', refresh)
    }
  }, [])

  return (
    <>
      {useCanvas ? (
        <EmberCanvas
          particleCount={isDesktop ? 170 : 55}
          pointerDrift={trackPointer}
        />
      ) : (
        <div className="ember-fallback pointer-events-none fixed inset-0 -z-10" aria-hidden="true" />
      )}

      <Navbar />

      <main className="relative">
        <Hero animate={animate} />
        <About animate={animate} />
        <Programs animate={animate} />
        <Schedule animate={animate} />
        <Testimonials animate={animate} />
        <Location animate={animate} />
        <FooterCTA animate={animate} />
      </main>
    </>
  )
}
