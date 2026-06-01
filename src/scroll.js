import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Smooth scroll (Lenis) + GSAP ScrollTrigger choreography. Loaded ONLY on the
 * desktop "full" tier (so it never runs under reduced-motion / on mobile), and
 * it animates from JS state only — it never relies on CSS hiding content, so
 * every other path renders the page fully visible.
 *
 * - onHeroProgress(0..1): hero scroll progress → molecule disperses/fades
 * - onContactProgress(0..1): final-CTA enter progress → molecule re-gathers + glows (product forms)
 */
export function initSmoothScroll({ onHeroProgress, onContactProgress } = {}) {
  const lenis = new Lenis({
    lerp: 0.1,
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.4,
  })

  lenis.on('scroll', ScrollTrigger.update)
  const tick = (t) => lenis.raf(t * 1000) // gsap seconds → lenis ms
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)

  const triggers = []

  // --- Nebula scroll reactions ---------------------------------------------
  const hero = document.getElementById('hero')
  if (hero && typeof onHeroProgress === 'function') {
    triggers.push(ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      onUpdate: (self) => onHeroProgress(self.progress),
    }))
  }
  const contact = document.getElementById('contact')
  if (contact && typeof onContactProgress === 'function') {
    triggers.push(ScrollTrigger.create({
      trigger: contact,
      start: 'top bottom',
      end: 'center center',
      onUpdate: (self) => onContactProgress(self.progress),
    }))
  }

  // --- Scroll-reveal: staggered grids + single elements --------------------
  // Grids enter as a batch with a stagger; section heads / prose fade up.
  revealBatch('.ba-problems > li', triggers)
  revealBatch('.ba-steps > li', triggers)
  revealBatch('.ba-tiers > li', triggers)
  revealBatch('.ba-works > li', triggers)
  revealBatch('.ba-metrics > li', triggers)
  revealBatch('.ba-boundary > .ba-bcol', triggers)
  revealBatch('.ba-faq__item', triggers)

  revealEach([
    '.ba-section--problem .ba-sec-head',
    '.ba-section--process .ba-sec-head',
    '.ba-section--services .ba-sec-head',
    '.ba-section--boundary .ba-sec-head',
    '.ba-boundary__note',
    '.ba-section--work .ba-sec-head',
    '.ba-section--proof .ba-sec-head',
    '.ba-section--about > *',
    '.ba-section--faq .ba-sec-head',
    '.ba-final__inner',
  ], triggers)

  // --- Metric count-ups -----------------------------------------------------
  initCountUps(triggers)

  // --- Card tilt toward cursor (≤5°, desktop fine pointers) -----------------
  const teardownTilt = initTilt()

  // Recompute positions once everything is laid out / after load.
  ScrollTrigger.refresh()
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true })

  return {
    lenis,
    destroy() {
      triggers.forEach((t) => t && t.kill())
      teardownTilt && teardownTilt()
      gsap.ticker.remove(tick)
      lenis.destroy()
    },
  }
}

/* Batch-reveal a set of elements with a stagger when they scroll into view.
   ScrollTrigger.batch also fires onEnter for any already in view at load. */
function revealBatch(selector, triggers) {
  const els = document.querySelectorAll(selector)
  if (!els.length) return
  gsap.set(els, { opacity: 0, y: 30 })
  const batch = ScrollTrigger.batch(els, {
    start: 'top 88%',
    onEnter: (b) =>
      gsap.to(b, { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out', overwrite: true }),
  })
  batch.forEach((t) => triggers.push(t))
}

/* Fade-up single elements (each its own trigger). */
function revealEach(selectors, triggers) {
  selectors.forEach((sel) => {
    document.querySelectorAll(sel).forEach((el) => {
      gsap.set(el, { opacity: 0, y: 26 })
      triggers.push(ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        once: true,
        onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }),
      }))
    })
  })
}

/* Animate metric numbers from 0 → target on first view, preserving prefix/suffix. */
function initCountUps(triggers) {
  document.querySelectorAll('.ba-metric__num[data-count-to]').forEach((el) => {
    const to = parseFloat(el.dataset.countTo)
    if (Number.isNaN(to)) return
    const prefix = el.dataset.prefix || ''
    const suffix = el.dataset.suffix || ''
    const counter = { v: 0 }
    triggers.push(ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () =>
        gsap.to(counter, {
          v: to,
          duration: 1.4,
          ease: 'power2.out',
          onUpdate: () => { el.textContent = prefix + Math.round(counter.v) + suffix },
        }),
    }))
  })
}

/* Subtle 3D tilt toward the cursor; locked "Coming Soon" tiers stay flat. */
function initTilt() {
  if (!window.matchMedia('(pointer: fine)').matches) return null
  const cards = document.querySelectorAll('.ba-card:not(.ba-tier--soon)')
  const MAX = 5
  const onMove = (e) => {
    const card = e.currentTarget
    const r = card.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    card.style.transition = 'transform 0.08s linear'
    card.style.transform = `perspective(900px) rotateY(${px * MAX}deg) rotateX(${-py * MAX}deg) translateY(-4px)`
  }
  const onLeave = (e) => {
    const card = e.currentTarget
    card.style.transition = 'transform 0.45s cubic-bezier(0.22,1,0.36,1)'
    card.style.transform = ''
  }
  cards.forEach((card) => {
    card.addEventListener('pointermove', onMove)
    card.addEventListener('pointerleave', onLeave)
  })
  return () => cards.forEach((card) => {
    card.removeEventListener('pointermove', onMove)
    card.removeEventListener('pointerleave', onLeave)
  })
}
