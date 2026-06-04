import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { SCHEDULE, WHATSAPP_LINK, BUSINESS } from '../data/content'
import { WhatsAppIcon } from './icons/Icons'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function Schedule({ animate = true }) {
  const root = useRef(null)

  useEffect(() => {
    if (!animate) return
    const ctx = gsap.context(() => {
      gsap.from('[data-sched]', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: { trigger: root.current, start: 'top 72%' },
      })
    }, root)
    return () => ctx.revert()
  }, [animate])

  return (
    <section id="schedule" ref={root} className="section-shell py-24 md:py-32">
      <div className="mx-auto max-w-5xl text-center">
        <p data-sched className="eyebrow mb-4">
          Timetable
        </p>
        <h2 data-sched className="display text-[clamp(2rem,5vw,3.6rem)] text-ink">
          Train on <span className="text-gold">Your Time</span>
        </h2>
        <p data-sched className="mx-auto mt-5 max-w-xl text-base text-muted md:text-lg">
          Two sessions a day, every day of the week. No closed days — just show up.
        </p>

        {/* day strip */}
        <div data-sched className="mx-auto mt-10 flex max-w-2xl flex-wrap justify-center gap-2">
          {DAYS.map((d) => (
            <span
              key={d}
              className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-sm font-semibold uppercase tracking-wider text-muted"
            >
              {d}
            </span>
          ))}
        </div>

        {/* session blocks */}
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {SCHEDULE.map((s) => (
            <div
              key={s.period}
              data-sched
              className="glass-card relative overflow-hidden p-8 text-left"
            >
              <span
                className={`absolute left-0 top-0 h-full w-1.5 ${
                  s.accent === 'gold' ? 'bg-gold' : 'bg-blood'
                }`}
              />
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-muted">
                {s.period}
              </p>
              <p
                className={`display mt-2 text-3xl md:text-4xl ${
                  s.accent === 'gold' ? 'text-gold' : 'text-blood'
                }`}
              >
                {s.time}
              </p>
              <p className="mt-3 text-base text-ink">{s.focus}</p>
            </div>
          ))}
        </div>

        <div data-sched className="mt-12">
          <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="btn-gold">
            <WhatsAppIcon /> WhatsApp Us to Book
          </a>
          <p className="mt-4 text-sm text-muted">
            {BUSINESS.days} · {BUSINESS.hours}
          </p>
        </div>
      </div>
    </section>
  )
}
