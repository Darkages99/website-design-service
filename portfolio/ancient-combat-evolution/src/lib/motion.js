// ---------------------------------------------------------------------------
//  Shared mutable motion state. Written by event listeners (pointer + scroll),
//  read every frame by the EmberCanvas RAF loop. Living outside React avoids a
//  re-render per mouse-move / scroll tick.
// ---------------------------------------------------------------------------

export const motionState = {
  // Pointer in viewport pixels (target) + lerped value the canvas eases toward.
  pointerX: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
  pointerY: typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
  lerpX: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
  lerpY: typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
  pointerActive: false,

  // 0..1 progress through the whole document.
  scrollProgress: 0,
  // 0..1 progress through the hero section (drives the spotlight intensity).
  heroProgress: 0,
}

// Detect device / preference capabilities once.
export function getCapabilities() {
  if (typeof window === 'undefined') {
    return { isDesktop: true, reducedMotion: false, lowEnd: false }
  }
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const isDesktop = window.matchMedia('(min-width: 768px) and (pointer: fine)').matches
  // Heuristic for low-end: few cores or tiny memory => skip the canvas entirely.
  const cores = navigator.hardwareConcurrency || 4
  const mem = navigator.deviceMemory || 4
  const lowEnd = cores <= 2 || mem <= 2
  return { isDesktop, reducedMotion, lowEnd }
}
