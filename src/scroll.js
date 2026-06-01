import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Smooth scroll (Lenis) synced to GSAP ScrollTrigger — the foundation the
 * Phase-4 section choreography will hang off. For now it also feeds hero
 * scroll-progress to the 3D scene so the Alchemy Sphere drifts away as you
 * leave the hero.
 *
 * Skipped entirely under prefers-reduced-motion (the caller gates on that).
 */
export function initSmoothScroll({ onHeroProgress } = {}) {
  const lenis = new Lenis({
    lerp: 0.1,
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.4,
  })

  // Drive ScrollTrigger from Lenis, and Lenis from GSAP's ticker.
  lenis.on('scroll', ScrollTrigger.update)
  const tick = (t) => lenis.raf(t * 1000) // gsap time is seconds, lenis wants ms
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)

  // Hero scroll-progress (0 at top → 1 once the hero has scrolled past).
  let heroST = null
  const hero = document.getElementById('hero')
  if (hero && typeof onHeroProgress === 'function') {
    heroST = ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      onUpdate: (self) => onHeroProgress(self.progress),
    })
  }

  return {
    lenis,
    destroy() {
      if (heroST) heroST.kill()
      gsap.ticker.remove(tick)
      lenis.destroy()
    },
  }
}
