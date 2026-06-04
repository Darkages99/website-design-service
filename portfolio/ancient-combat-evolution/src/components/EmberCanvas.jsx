import { useEffect, useRef } from 'react'
import { motionState } from '../lib/motion'

// ---------------------------------------------------------------------------
//  The Ember Canvas — a fixed, full-viewport Canvas 2D "forge / torch-lit
//  arena" backdrop for Ancient Combat Evolution. Layers (bottom → top):
//  charcoal gradient + faint canvas-weave + warm vignette · a soft gold
//  spotlight that breathes (and drifts a touch toward the cursor) · gold
//  embers drifting upward, a few flaring brighter. RAF loop, pauses when the
//  tab is hidden, fully torn down on unmount. All motion is read from
//  `motionState`, so the component never re-renders during animation.
//
//  This replaces the old "boxing ring" backdrop — the four red/white/blue
//  ropes never matched the gym's actual gold-on-black ancient-warrior brand.
// ---------------------------------------------------------------------------

export default function EmberCanvas({ particleCount = 170, pointerDrift = true }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })

    let w = 0
    let h = 0
    let dpr = 1
    let bg = null // offscreen charcoal texture
    const embers = []
    let raf = 0
    let running = true
    let startTime = null

    // ---- offscreen charcoal texture (rebuilt on resize) --------------------
    const buildTexture = () => {
      const off = document.createElement('canvas')
      off.width = w * dpr
      off.height = h * dpr
      const o = off.getContext('2d')
      o.scale(dpr, dpr)

      // base vertical gradient — warm charcoal, slightly lifted at the top
      const grad = o.createLinearGradient(0, 0, 0, h)
      grad.addColorStop(0, '#0e0d10')
      grad.addColorStop(0.55, '#0a0a0d')
      grad.addColorStop(1, '#060507')
      o.fillStyle = grad
      o.fillRect(0, 0, w, h)

      // subtle canvas weave (fine crosshatch) — barely-there texture
      o.globalAlpha = 0.022
      o.strokeStyle = '#ffffff'
      o.lineWidth = 1
      const step = 28
      o.beginPath()
      for (let x = 0; x <= w; x += step) {
        o.moveTo(x, 0)
        o.lineTo(x, h)
      }
      for (let y = 0; y <= h; y += step) {
        o.moveTo(0, y)
        o.lineTo(w, y)
      }
      o.stroke()
      o.globalAlpha = 1

      // warm vignette to focus the centre on the tiger
      const vg = o.createRadialGradient(w / 2, h * 0.42, h * 0.08, w / 2, h * 0.52, h * 1.0)
      vg.addColorStop(0, 'rgba(0,0,0,0)')
      vg.addColorStop(1, 'rgba(0,0,0,0.62)')
      o.fillStyle = vg
      o.fillRect(0, 0, w, h)

      bg = off
    }

    const makeEmber = (anywhere) => {
      const flare = Math.random() > 0.86 // ~14% are big, bright flares
      return {
        x: Math.random() * w,
        y: anywhere ? Math.random() * h : h + Math.random() * 40,
        r: flare ? 1.6 + Math.random() * 2.4 : 0.5 + Math.random() * 1.5,
        vy: (flare ? 0.22 : 0.14) + Math.random() * 0.5,
        vx: (Math.random() - 0.5) * 0.16,
        phase: Math.random() * Math.PI * 2,
        sway: 0.3 + Math.random() * 0.5,
        // mostly gold/amber, a few pale-white sparks
        white: Math.random() > 0.82,
        flare,
        baseAlpha: 0.25 + Math.random() * 0.55,
      }
    }

    const seedEmbers = () => {
      embers.length = 0
      for (let i = 0; i < particleCount; i++) embers.push(makeEmber(true))
    }

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      buildTexture()
      if (embers.length === 0) seedEmbers()
    }

    // ---- draw helpers ------------------------------------------------------
    const drawSpotlight = (intensity, cx, cy) => {
      const radius = Math.min(w, h) * (0.52 + intensity * 0.22)
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
      const a = 0.14 + intensity * 0.18
      g.addColorStop(0, `rgba(255,233,178,${a})`)
      g.addColorStop(0.45, `rgba(212,175,55,${a * 0.4})`)
      g.addColorStop(1, 'rgba(212,175,55,0)')
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
      ctx.restore()
    }

    const drawEmbers = (t, densityAlpha) => {
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      for (const p of embers) {
        p.y -= p.vy
        p.x += p.vx + Math.sin(t * 0.0006 + p.phase) * 0.14 * p.sway
        if (p.y < -8) Object.assign(p, makeEmber(false))

        const twinkle = 0.55 + 0.45 * Math.sin(t * 0.0028 + p.phase)
        const a = p.baseAlpha * twinkle * densityAlpha
        const fill = p.white ? `rgba(255,244,214,${a})` : `rgba(224,176,58,${a})`

        if (p.flare) {
          // soft glow halo for the brighter flares
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4)
          g.addColorStop(0, fill)
          g.addColorStop(1, 'rgba(224,176,58,0)')
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.fillStyle = fill
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()
    }

    // ---- main loop ---------------------------------------------------------
    const frame = (now) => {
      if (!running) return
      if (startTime == null) startTime = now
      const t = now - startTime

      const scroll = motionState.scrollProgress
      const hero = motionState.heroProgress
      // footer ramp: the "main event" — embers + spotlight flare up at the end
      const footer = Math.max(0, (scroll - 0.82) / 0.18)

      // spotlight rests just above centre, breathes, and drifts a touch toward
      // the cursor (10%) so it feels alive without chasing it.
      const breathe = Math.sin(t * 0.0009) * h * 0.012
      const baseX = w / 2
      const baseY = h * 0.42 + breathe
      const targetX = pointerDrift && motionState.pointerActive ? motionState.pointerX : baseX
      const targetY = pointerDrift && motionState.pointerActive ? motionState.pointerY : baseY
      const cx = baseX + (targetX - baseX) * 0.1
      const cy = baseY + (targetY - baseY) * 0.1
      motionState.lerpX += (cx - motionState.lerpX) * 0.08
      motionState.lerpY += (cy - motionState.lerpY) * 0.08

      ctx.clearRect(0, 0, w, h)
      if (bg) ctx.drawImage(bg, 0, 0, w, h)

      const spotIntensity = Math.min(1, 0.34 + hero * 0.4 + footer * 0.6)
      drawSpotlight(spotIntensity, motionState.lerpX, motionState.lerpY)
      drawEmbers(t, Math.min(1.2, 0.72 + footer * 0.55))

      raf = requestAnimationFrame(frame)
    }

    const onVisibility = () => {
      if (document.hidden) {
        running = false
        cancelAnimationFrame(raf)
      } else if (!running) {
        running = true
        startTime = null
        raf = requestAnimationFrame(frame)
      }
    }

    resize()
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', onVisibility)
    raf = requestAnimationFrame(frame)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [particleCount, pointerDrift])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  )
}
