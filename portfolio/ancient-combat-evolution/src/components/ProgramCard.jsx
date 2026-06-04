import { useRef } from 'react'
import { ICON_MAP, ArrowIcon } from './icons/Icons'
import { PHONE_E164 } from '../data/content'

const MAX_TILT = 5 // degrees

export default function ProgramCard({ program, index, tilt = true }) {
  const cardRef = useRef(null)
  const Icon = ICON_MAP[program.icon]

  const learnMore = `https://wa.me/${PHONE_E164}?text=${encodeURIComponent(
    `Hi Ancient Combat Evolution, I'd like to learn more about your ${program.title} program.`
  )}`

  const onMove = (e) => {
    if (!tilt) return
    const el = cardRef.current
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    el.style.transform = `perspective(900px) rotateY(${px * MAX_TILT * 2}deg) rotateX(${
      -py * MAX_TILT * 2
    }deg) translateZ(0)`
    el.style.boxShadow = `${-px * 24}px ${py * 24 + 18}px 50px -20px rgba(0,0,0,0.7)`
  }

  const reset = () => {
    const el = cardRef.current
    if (!el) return
    el.style.transform = 'perspective(900px) rotateY(0) rotateX(0)'
    el.style.boxShadow = ''
  }

  return (
    <article
      data-program-card
      data-from={index % 2 === 0 ? 'left' : 'right'}
      ref={cardRef}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className="glass-card group relative flex flex-col gap-4 p-7 transition-[box-shadow] duration-200 will-change-transform md:p-8"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* number watermark */}
      <span className="display pointer-events-none absolute right-5 top-3 text-6xl text-white/[0.04]">
        0{index + 1}
      </span>

      <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-gold/10 text-gold ring-1 ring-gold/30 transition-colors group-hover:bg-gold group-hover:text-black">
        {Icon ? <Icon className="h-7 w-7" /> : null}
      </span>

      <h3 className="display text-2xl text-ink">{program.title}</h3>
      <p className="text-sm leading-relaxed text-muted">{program.blurb}</p>

      <a
        href={learnMore}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gold transition-colors hover:text-gold-soft"
      >
        Learn More <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </a>

      <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-gold to-blood transition-transform duration-300 group-hover:scale-x-100" />
    </article>
  )
}
