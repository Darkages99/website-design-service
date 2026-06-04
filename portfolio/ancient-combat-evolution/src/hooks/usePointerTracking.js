import { useEffect } from 'react'
import { motionState } from '../lib/motion'

// Publishes the pointer position into motionState (read by EmberCanvas's
// spotlight drift and GoldTiger's eye-tracking). Only active where we want it;
// otherwise the spotlight rests centred and the tiger looks straight ahead.
// Cheap: no React state, just a passive listener writing a ref-like object.
export function usePointerTracking(enabled = true) {
  useEffect(() => {
    if (!enabled) {
      motionState.pointerActive = false
      motionState.pointerX = window.innerWidth / 2
      motionState.pointerY = window.innerHeight * 0.4
      return
    }

    const onMove = (e) => {
      motionState.pointerX = e.clientX
      motionState.pointerY = e.clientY
      motionState.pointerActive = true
    }
    const onLeave = () => {
      motionState.pointerActive = false
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerleave', onLeave)
    document.addEventListener('mouseleave', onLeave)

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('mouseleave', onLeave)
    }
  }, [enabled])
}
