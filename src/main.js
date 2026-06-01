import './styles/main.css'

/**
 * Brand-Alchemy front-end entry.
 *
 * Phase 1: confirm the Vite bundle + CSS load and the fixed 3D canvas is present.
 * Phase 2 will dynamically import and mount the Three.js "Alchemy Sphere" scene here,
 * deferred until after first paint so it never blocks the LCP (hero headline) budget.
 */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

function init() {
  const canvas = document.getElementById('alchemy-bg')
  if (!canvas) return

  // eslint-disable-next-line no-console
  console.info('[Brand-Alchemy] bundle loaded. canvas ready · reduced-motion:', prefersReducedMotion)

  // Phase 2 hook (kept commented until the scene module exists):
  // import('./three/scene.js').then(({ mountScene }) => mountScene(canvas, { prefersReducedMotion }))
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true })
} else {
  init()
}
