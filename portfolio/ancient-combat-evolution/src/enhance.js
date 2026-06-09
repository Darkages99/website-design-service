// Deferred enhancement layer. main.js dynamic-imports this after idle, only when
// tier !== 'none'. Everything heavy (Three.js, Lenis) is imported here so it
// never touches the critical path.
//
// Note on GSAP: intentionally NOT used. Section reveals are pure-CSS (gated by
// IntersectionObserver in main.js) and count-ups are vanilla rAF — so the only
// libraries on the 'full' tier are Three.js (the void) and Lenis (smooth scroll).

import { initReels, initCountUp } from './lib/reels.js'

export async function initEnhance(tier) {
  // lite + full
  initReels()
  initCountUp()

  if (tier !== 'full') return

  // full only
  ghostParallax()

  import('./three/void.js')
    .then((m) => m.initVoid())
    .catch(() => {})

  import('lenis')
    .then(({ default: Lenis }) => {
      const lenis = new Lenis({ lerp: 0.1, smoothWheel: true })
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf) }
      requestAnimationFrame(raf)
    })
    .catch(() => {})
}

// Mouse-driven parallax on the hero ghost — the "holographic presence" shift.
function ghostParallax() {
  const g = document.querySelector('.hero__ghost')
  if (!g) return
  let tx = 0, ty = 0, cx = 0, cy = 0
  window.addEventListener('pointermove', (e) => {
    tx = ((e.clientX / innerWidth) - 0.5) * -34
    ty = ((e.clientY / innerHeight) - 0.5) * -20
  }, { passive: true })
  const loop = () => {
    cx += (tx - cx) * 0.06
    cy += (ty - cy) * 0.06
    g.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`
    requestAnimationFrame(loop)
  }
  requestAnimationFrame(loop)
}
