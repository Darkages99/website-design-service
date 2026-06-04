import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { PROGRAMS } from '../data/content'
import ProgramCard from './ProgramCard'

export default function Programs({ animate = true }) {
  const root = useRef(null)

  useEffect(() => {
    if (!animate) return
    const ctx = gsap.context(() => {
      gsap.from('[data-prog-head]', {
        y: 36,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: root.current, start: 'top 75%' },
      })

      // Cards "punch in" from alternating sides with a hook-punch rotation.
      gsap.utils.toArray('[data-program-card]').forEach((card) => {
        const fromLeft = card.dataset.from === 'left'
        gsap.from(card, {
          x: fromLeft ? -140 : 140,
          rotation: fromLeft ? -8 : 8,
          opacity: 0,
          duration: 0.85,
          ease: 'power4.out',
          scrollTrigger: { trigger: card, start: 'top 88%' },
        })
      })
    }, root)
    return () => ctx.revert()
  }, [animate])

  return (
    <section id="programs" ref={root} className="section-shell py-24 md:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 max-w-2xl">
          <p data-prog-head className="eyebrow mb-4">
            Disciplines
          </p>
          <h2
            data-prog-head
            className="display text-[clamp(2rem,5vw,3.6rem)] text-ink"
          >
            Choose Your <span className="text-gold">Discipline</span>
          </h2>
          <p data-prog-head className="mt-5 text-base text-muted md:text-lg">
            Four paths, one arena. Pick your first round — or train them all.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {PROGRAMS.map((p, i) => (
            <ProgramCard key={p.id} program={p} index={i} tilt={animate} />
          ))}
        </div>
      </div>
    </section>
  )
}
