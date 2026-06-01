import './styles/main.css'

/**
 * Brand-Alchemy front-end entry.
 *
 * The Three.js "Alchemy Sphere" and the Lenis smooth-scroll layer are loaded
 * dynamically AFTER first paint (via requestIdleCallback) so they never block
 * the LCP — the hero headline paints from the critical CSS bundle alone, and
 * the heavy 3D/scroll chunk arrives a beat later.
 *
 * Capability gate decides how much we run:
 *   'none' — reduced-motion, no WebGL, or a weak phone → keep the CSS gradient
 *   'lite' — capable phone/tablet → lightweight sphere, no bloom, native scroll
 *   'full' — desktop with a fine pointer → full sphere + bloom + smooth scroll
 */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')))
  } catch {
    return false
  }
}

function decideTier() {
  if (prefersReducedMotion || !hasWebGL()) return 'none'
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const small = window.matchMedia('(max-width: 720px)').matches
  if (small || coarse) {
    // Only run 3D on a phone if it looks like it can take it, to protect the
    // mobile LCP/TBT budget. Otherwise the static gradient is the experience.
    const mem = navigator.deviceMemory || 4
    const cores = navigator.hardwareConcurrency || 4
    return mem >= 4 && cores >= 4 ? 'lite' : 'none'
  }
  return 'full'
}

function init() {
  const canvas = document.getElementById('alchemy-bg')
  if (!canvas) return

  const tier = decideTier()
  console.info('[Brand-Alchemy] bundle loaded · tier:', tier, '· reduced-motion:', prefersReducedMotion)

  if (tier === 'none') return // static CSS gradient is the whole experience

  const start = () => {
    let sceneCtl = null

    import('./three/scene.js')
      .then(({ mountScene }) => {
        sceneCtl = mountScene(canvas, { tier })
      })
      .catch((err) => console.warn('[Brand-Alchemy] scene failed to load:', err))

    // Smooth scroll + ScrollTrigger only on the full (desktop) tier; phones
    // keep native momentum scrolling. The hero-progress callback drifts the
    // sphere away as the hero leaves the viewport.
    if (tier === 'full') {
      import('./scroll.js')
        .then(({ initSmoothScroll }) => {
          initSmoothScroll({
            // Hero scroll disperses + fades the molecule (the reaction begins) …
            onHeroProgress: (p) => sceneCtl && sceneCtl.setScroll(p),
            // … then it re-gathers, shifts gold→green, and glows as the product
            // forms at the final CTA.
            onContactProgress: (p) => {
              if (!sceneCtl) return
              sceneCtl.setScroll(1 - p * 0.9)
              sceneCtl.setReaction(p)
            },
          })
        })
        .catch((err) => console.warn('[Brand-Alchemy] scroll failed to load:', err))
    }
  }

  // Defer until the main thread is idle so first paint (the LCP headline) wins.
  if ('requestIdleCallback' in window) {
    requestIdleCallback(start, { timeout: 2500 })
  } else {
    setTimeout(start, 200)
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true })
} else {
  init()
}
