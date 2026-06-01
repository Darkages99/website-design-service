import './styles/main.css'

/**
 * Brand-Alchemy front-end entry.
 *
 * The Through-Line background and the Lenis smooth-scroll layer load dynamically
 * AFTER first paint (via requestIdleCallback) so they never block the LCP — the
 * hero headline paints from the critical CSS bundle alone.
 *
 * - The Self-Building Blueprint (src/blueprint.js, pure SVG) loads on every device;
 *   it self-gates motion (reduced-motion → every frame shown already built).
 *   (The Through-Line, src/through-line.js, is a preserved alternative.)
 * - Smooth scroll + section reveals + count-ups + tilt (src/scroll.js) load only
 *   on the desktop "full" tier; phones/reduced-motion keep native scroll.
 *
 * (Three.js backgrounds — Liquid Gold, Catalytic Surface, Molecular — are kept in
 *  src/three/scene-*.js; to use one, import its mountScene here instead.)
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
  const tier = decideTier()
  console.info('[Brand-Alchemy] bundle loaded · tier:', tier, '· reduced-motion:', prefersReducedMotion)

  const start = () => {
    // The Self-Building Blueprint background — drawn on every device (it self-gates
    // motion: reduced-motion shows every frame already built). Pure SVG, no WebGL.
    import('./blueprint.js')
      .then(({ initBlueprint }) => initBlueprint())
      .catch((err) => console.warn('[Brand-Alchemy] blueprint failed to load:', err))

    // Smooth scroll + section reveals + metric count-ups + card tilt — desktop
    // "full" tier only; phones/reduced-motion keep native scroll and render fully.
    if (tier === 'full') {
      import('./scroll.js')
        .then(({ initSmoothScroll }) => initSmoothScroll())
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
