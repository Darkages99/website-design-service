import './styles/main.css'

/**
 * Brand-Alchemy front-end entry.
 *
 * The Alchemy Nebula background and the Lenis smooth-scroll layer load dynamically
 * AFTER first paint (via requestIdleCallback) so they never block the LCP — the
 * hero headline paints from the critical CSS bundle alone.
 *
 * - The Alchemy Nebula (src/three/scene.js, WebGL) mounts on 'lite'/'full' tiers;
 *   reduced-motion / no-WebGL ('none') keeps the static CSS gradient. It listens to
 *   scroll itself, so the particles burst continuously down the whole page.
 * - Smooth scroll + section reveals + count-ups + tilt (src/scroll.js) load only
 *   on the desktop "full" tier; phones/reduced-motion keep native scroll.
 *
 * (Alternative backgrounds kept as modules: Self-Building Blueprint src/blueprint.js,
 *  Through-Line src/through-line.js, Liquid Gold / Catalytic Surface src/three/scene-*.js.)
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

  if (tier === 'none') return // reduced-motion / no-WebGL → static CSS gradient

  const start = () => {
    // The Alchemy Nebula — luminous particles that swirl, drift with the cursor,
    // and burst continuously with scroll energy (the scene listens to scroll itself).
    import('./three/scene.js')
      .then(({ mountScene }) => mountScene(canvas, { tier }))
      .catch((err) => console.warn('[Brand-Alchemy] scene failed to load:', err))

    // Smooth scroll + section reveals + metric count-ups + card tilt — desktop
    // "full" tier only; phones keep native scroll and render fully.
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
