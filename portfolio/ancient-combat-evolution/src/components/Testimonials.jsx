import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { TESTIMONIALS } from '../data/content'
import { StarIcon } from './icons/Icons'

export default function Testimonials({ animate = true }) {
  const root = useRef(null)

  useEffect(() => {
    if (!animate) return
    const ctx = gsap.context(() => {
      gsap.from('[data-tst-head]', {
        y: 36,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: root.current, start: 'top 75%' },
      })

      // Cards rise in
      gsap.from('[data-tst-card]', {
        y: 60,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.15,
        scrollTrigger: { trigger: '[data-tst-grid]', start: 'top 82%' },
      })

      // Decorative quote marks scale up + fade as you scroll through.
      gsap.utils.toArray('[data-quote-mark]').forEach((q) => {
        gsap.fromTo(
          q,
          { scale: 0.6, opacity: 0.04 },
          {
            scale: 1.25,
            opacity: 0.12,
            ease: 'none',
            scrollTrigger: {
              trigger: q.closest('[data-tst-card]'),
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        )
      })
    }, root)
    return () => ctx.revert()
  }, [animate])

  return (
    <section
      id="testimonials"
      ref={root}
      className="section-shell relative py-24 md:py-32"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <p data-tst-head className="eyebrow mb-4">
            The Corner
          </p>
          <h2
            data-tst-head
            className="display text-[clamp(2rem,5vw,3.6rem)] text-ink"
          >
            What Our <span className="text-gold">Fighters Say</span>
          </h2>
        </div>

        <div data-tst-grid className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <figure
              key={i}
              data-tst-card
              className="glass-card relative overflow-hidden p-8"
            >
              <span
                data-quote-mark
                aria-hidden="true"
                className="display pointer-events-none absolute -right-2 -top-10 select-none text-[10rem] leading-none text-gold"
              >
                &rdquo;
              </span>

              <div className="relative">
                <div className="mb-4 flex gap-1 text-gold">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <StarIcon key={s} className="h-4 w-4" />
                  ))}
                </div>
                <blockquote className="text-base leading-relaxed text-ink">
                  {t.quote}
                </blockquote>
                <figcaption className="mt-6 text-sm font-semibold uppercase tracking-widest text-muted">
                  — {t.author}
                </figcaption>
              </div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
