import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { motionState } from '../lib/motion'

// Boots Lenis smooth scroll, ties it into GSAP's ticker + ScrollTrigger, and
// publishes global scroll progress into motionState. Skipped when the user
// prefers reduced motion (native scroll is used instead, ScrollTrigger still
// works off the window scroll). Returns nothing; cleans up on unmount.
export function useSmoothScroll(enabled = true) {
  useEffect(() => {
    // Always keep ScrollTrigger fed with scroll progress, even without Lenis.
    const publishProgress = () => {
      const doc = document.documentElement
      const max = doc.scrollHeight - window.innerHeight
      motionState.scrollProgress = max > 0 ? window.scrollY / max : 0
    }

    if (!enabled) {
      window.addEventListener('scroll', publishProgress, { passive: true })
      publishProgress()
      return () => window.removeEventListener('scroll', publishProgress)
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    })

    lenis.on('scroll', (e) => {
      ScrollTrigger.update()
      motionState.scrollProgress = e.progress ?? 0
    })

    const tick = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    // Anchor links → Lenis smooth scroll
    const onAnchorClick = (e) => {
      const a = e.target.closest('a[href^="#"]')
      if (!a) return
      const id = a.getAttribute('href')
      if (id.length < 2) return
      const el = document.querySelector(id)
      if (!el) return
      e.preventDefault()
      lenis.scrollTo(el, { offset: -64, duration: 1.3 })
    }
    document.addEventListener('click', onAnchorClick)

    return () => {
      document.removeEventListener('click', onAnchorClick)
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [enabled])
}
