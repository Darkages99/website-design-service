import { useEffect, useRef } from 'react'
import { motionState } from '../lib/motion'

// ---------------------------------------------------------------------------
//  GoldTiger — the hero centerpiece. A stylized, front-facing snarling tiger
//  head emblem in weathered championship gold, echoing the tiger in the gym's
//  shield logo. Two tricks bring it alive:
//    • the pupils lerp toward the cursor (eye-tracking), and
//    • it bares its fangs on a loose timer (and whenever the pointer enters).
//  Both are pure DOM writes from a single RAF loop / timers — no re-renders.
//  When `animate` is false (reduced-motion / low-end) it renders a calm,
//  static gold tiger: eyes forward, mouth closed.
// ---------------------------------------------------------------------------

const MAX_PUPIL = 5 // max pupil travel in viewBox units

export default function GoldTiger({ animate = true, className = '' }) {
  const svgRef = useRef(null)
  const pupilsRef = useRef(null)

  useEffect(() => {
    const svg = svgRef.current
    const pupils = pupilsRef.current
    if (!svg) return

    let raf = 0
    let lx = 0
    let ly = 0
    let snarlTimer = 0
    let snarlOff = 0

    // ---- snarl: bare the fangs briefly, then relax ----------------------
    const snarl = (hold = 620) => {
      svg.classList.add('is-snarling')
      clearTimeout(snarlOff)
      snarlOff = setTimeout(() => svg.classList.remove('is-snarling'), hold)
    }
    const scheduleSnarl = () => {
      const delay = 5200 + Math.random() * 6000
      snarlTimer = setTimeout(() => {
        snarl()
        scheduleSnarl()
      }, delay)
    }

    if (!animate) {
      // static: centre the pupils, no snarl loop
      if (pupils) pupils.setAttribute('transform', 'translate(0 0)')
      return () => {}
    }

    // snarl on pointer-enter too — feels reactive without being constant
    const onEnter = () => snarl(520)
    svg.addEventListener('pointerenter', onEnter)
    scheduleSnarl()

    // ---- eye-tracking RAF -----------------------------------------------
    const loop = () => {
      const r = svg.getBoundingClientRect()
      let tx = 0
      let ty = 0
      if (motionState.pointerActive && r.width > 0) {
        const cx = r.left + r.width / 2
        const cy = r.top + r.height * 0.46 // eyes sit a touch above centre
        const dx = motionState.pointerX - cx
        const dy = motionState.pointerY - cy
        const nx = dx / (r.width / 2)
        const ny = dy / (r.height / 2)
        const mag = Math.min(1, Math.hypot(nx, ny))
        const ang = Math.atan2(ny, nx)
        tx = Math.cos(ang) * mag * MAX_PUPIL
        ty = Math.sin(ang) * mag * MAX_PUPIL
      }
      lx += (tx - lx) * 0.12
      ly += (ty - ly) * 0.12
      if (pupils) pupils.setAttribute('transform', `translate(${lx.toFixed(2)} ${ly.toFixed(2)})`)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(snarlTimer)
      clearTimeout(snarlOff)
      svg.removeEventListener('pointerenter', onEnter)
    }
  }, [animate])

  return (
    <svg
      ref={svgRef}
      className={`gold-tiger ${className}`}
      viewBox="0 0 240 250"
      role="img"
      aria-label="Ancient Combat Evolution — golden tiger emblem"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="tg-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6e09a" />
          <stop offset="0.42" stopColor="#d8b047" />
          <stop offset="1" stopColor="#8f6e19" />
        </linearGradient>
        <linearGradient id="tg-gold-soft" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe9a8" />
          <stop offset="1" stopColor="#c79a32" />
        </linearGradient>
        <radialGradient id="tg-iris" cx="0.5" cy="0.42" r="0.6">
          <stop offset="0" stopColor="#ffe27a" />
          <stop offset="0.55" stopColor="#e0a52f" />
          <stop offset="1" stopColor="#8a5d12" />
        </radialGradient>
        <radialGradient id="tg-halo" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="rgba(214,176,71,0.55)" />
          <stop offset="0.55" stopColor="rgba(214,176,71,0.16)" />
          <stop offset="1" stopColor="rgba(214,176,71,0)" />
        </radialGradient>
        <filter id="tg-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0" />
        </filter>
        <clipPath id="tg-face-clip">
          <path d="M120,70 C150,66 168,80 176,96 C190,110 200,124 202,140 C203,152 196,156 198,168 C188,168 190,180 184,190 C176,188 178,198 170,206 C156,214 138,222 120,224 C102,222 84,214 70,206 C62,198 64,188 56,190 C50,180 52,168 42,168 C44,156 37,152 38,140 C40,124 50,110 64,96 C72,80 90,66 120,70 Z" />
        </clipPath>
        <clipPath id="tg-eye-l">
          <path d="M62,114 C74,107 98,109 110,124 C98,131 76,131 62,123 Z" />
        </clipPath>
        <clipPath id="tg-eye-r">
          <path d="M178,114 C166,107 142,109 130,124 C142,131 164,131 178,123 Z" />
        </clipPath>
      </defs>

      {/* gold aura */}
      <ellipse className="tg-halo" cx="120" cy="132" rx="118" ry="124" fill="url(#tg-halo)" />

      {/* ears (rounded, outer gold + dark inner) */}
      <g>
        <path d="M68,88 C56,62 66,40 88,46 C102,50 105,68 102,86 Z" fill="url(#tg-gold)" />
        <path d="M172,88 C184,62 174,40 152,46 C138,50 135,68 138,86 Z" fill="url(#tg-gold)" />
        <path d="M82,82 C76,62 82,52 92,56 C99,60 98,72 96,83 Z" fill="#1a150a" />
        <path d="M158,82 C164,62 158,52 148,56 C141,60 142,72 144,83 Z" fill="#1a150a" />
      </g>

      {/* head / face */}
      <path
        d="M120,70 C150,66 168,80 176,96 C190,110 200,124 202,140 C203,152 196,156 198,168 C188,168 190,180 184,190 C176,188 178,198 170,206 C156,214 138,222 120,224 C102,222 84,214 70,206 C62,198 64,188 56,190 C50,180 52,168 42,168 C44,156 37,152 38,140 C40,124 50,110 64,96 C72,80 90,66 120,70 Z"
        fill="url(#tg-gold)"
        stroke="#2a2008"
        strokeWidth="1.5"
      />

      {/* weathered grain overlay, clipped to the face */}
      <g clipPath="url(#tg-face-clip)">
        <rect x="0" y="0" width="240" height="250" filter="url(#tg-grain)" opacity="0.16" />
      </g>

      {/* forehead + cheek stripes (dark) */}
      <g fill="#181208">
        {/* central arrow */}
        <path d="M120,72 L126,96 L120,114 L114,96 Z" />
        {/* forehead flanks */}
        <path d="M104,76 C100,90 100,101 104,110 L98,110 C92,98 93,86 96,76 Z" />
        <path d="M86,80 C80,92 79,104 81,116 L75,114 C71,100 73,86 80,80 Z" />
        <path d="M136,76 C140,90 140,101 136,110 L142,110 C148,98 147,86 144,76 Z" />
        <path d="M154,80 C160,92 161,104 159,116 L165,114 C169,100 167,86 160,80 Z" />
        {/* cheek bars */}
        <path d="M62,128 L40,123 L42,130 L63,134 Z" />
        <path d="M62,141 L38,143 L42,149 L63,147 Z" />
        <path d="M64,153 L46,160 L52,163 L66,158 Z" />
        <path d="M178,128 L200,123 L198,130 L177,134 Z" />
        <path d="M178,141 L202,143 L198,149 L177,147 Z" />
        <path d="M176,153 L194,160 L188,163 L174,158 Z" />
      </g>

      {/* fierce brows — bold wedges driving down toward the nose */}
      <g fill="#120d06">
        <path d="M56,99 L116,118 L113,127 L58,110 Z" />
        <path d="M184,99 L124,118 L127,127 L182,110 Z" />
      </g>

      {/* eyes — angled sockets + clipped, moving amber pupils */}
      <path d="M62,114 C74,107 98,109 110,124 C98,131 76,131 62,123 Z" fill="#0c0904" />
      <path d="M178,114 C166,107 142,109 130,124 C142,131 164,131 178,123 Z" fill="#0c0904" />
      <g ref={pupilsRef}>
        <g clipPath="url(#tg-eye-l)">
          <circle cx="86" cy="120" r="10" fill="url(#tg-iris)" />
          <ellipse cx="86" cy="120" rx="2.9" ry="7.6" fill="#080703" />
          <circle cx="82.6" cy="116.4" r="1.9" fill="#fff7df" opacity="0.95" />
        </g>
        <g clipPath="url(#tg-eye-r)">
          <circle cx="154" cy="120" r="10" fill="url(#tg-iris)" />
          <ellipse cx="154" cy="120" rx="2.9" ry="7.6" fill="#080703" />
          <circle cx="150.6" cy="116.4" r="1.9" fill="#fff7df" opacity="0.95" />
        </g>
      </g>
      {/* upper-lid shadow for depth */}
      <g fill="none" stroke="#0c0904" strokeWidth="2.2" strokeLinecap="round">
        <path d="M64,116 C76,110 98,112 108,123" />
        <path d="M176,116 C164,110 142,112 132,123" />
      </g>

      {/* nose + snout bridge */}
      <path d="M120,123 L112,139 L120,143 L128,139 Z" fill="#2a2008" opacity="0.65" />
      <path d="M103,139 C103,134 137,134 137,139 C137,151 127,160 120,166 C113,160 103,151 103,139 Z" fill="#130e08" />

      {/* neutral mouth (closed but stern) + resting fang tips */}
      <g className="tg-mouth-neutral">
        <g fill="none" stroke="#13100a" strokeWidth="2.6" strokeLinecap="round">
          <path d="M120,166 L120,178" />
          <path d="M98,179 C108,177 132,177 142,179" />
        </g>
        <g fill="#efe4ca">
          <path d="M112,179 L114,186 L117,179 Z" />
          <path d="M123,179 L126,186 L128,179 Z" />
        </g>
      </g>

      {/* snarl (bared fangs) */}
      <g className="tg-mouth-snarl">
        {/* dark open mouth */}
        <path d="M92,168 C105,162 135,162 148,168 C141,199 99,199 92,168 Z" fill="#080603" />
        {/* curled upper lip / gum */}
        <path d="M88,165 C104,154 136,154 152,165 C141,172 99,172 88,165 Z" fill="#1c150a" />
        {/* upper fangs (outer canines large) */}
        <g fill="#f4ead0">
          <path d="M96,167 L101,192 L108,167 Z" />
          <path d="M132,167 L139,192 L144,167 Z" />
          <path d="M112,167 L115,182 L119,167 Z" />
          <path d="M121,167 L125,182 L128,167 Z" />
        </g>
        {/* lower fangs */}
        <g fill="#e9ddc0">
          <path d="M104,196 L107,184 L112,196 Z" />
          <path d="M128,196 L132,184 L136,196 Z" />
        </g>
      </g>
    </svg>
  )
}
