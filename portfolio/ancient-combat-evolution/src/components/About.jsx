import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { STATS, BUSINESS } from '../data/content'

export default function About({ animate = true }) {
  const root = useRef(null)
  const imgRef = useRef(null)

  useEffect(() => {
    if (!animate) return
    const ctx = gsap.context(() => {
      gsap.to(imgRef.current, {
        yPercent: -16,
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })

      gsap.from('[data-about-reveal]', {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: { trigger: root.current, start: 'top 70%' },
      })

      gsap.from('[data-stat]', {
        y: 24,
        opacity: 0,
        duration: 0.6,
        ease: 'back.out(1.6)',
        stagger: 0.1,
        scrollTrigger: { trigger: '[data-stats]', start: 'top 85%' },
      })
    }, root)
    return () => ctx.revert()
  }, [animate])

  return (
    <section id="about" ref={root} className="section-shell py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        {/* copy */}
        <div>
          <p data-about-reveal className="eyebrow mb-4">
            The Arena
          </p>
          <h2
            data-about-reveal
            className="display text-[clamp(2rem,5vw,3.6rem)] text-ink"
          >
            Built for Fighters.
            <br />
            <span className="text-gold">Open to Everyone.</span>
          </h2>
          <p
            data-about-reveal
            className="mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg"
          >
            Located in the heart of Alwarpet — minutes from Teynampet — Ancient
            Combat Evolution is where ancient discipline meets modern combat.
            Whether you're stepping into the ring for the first time or sharpening
            your championship edge, our cornerman coaches meet you where you are.
          </p>

          <div
            data-stats
            className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4"
          >
            {STATS.map((s) => (
              <div
                key={s.label}
                data-stat
                className="glass-card flex flex-col items-center gap-1 px-4 py-5 text-center"
              >
                <span className="display text-3xl text-gold md:text-4xl">
                  {s.value}
                </span>
                <span className="text-[0.7rem] uppercase tracking-widest text-muted">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* image */}
        <div className="relative">
          <div className="relative overflow-hidden rounded-2xl ring-1 ring-white/10">
            <img
              ref={imgRef}
              src="./assets/training-floor.webp"
              alt="Members training with kettlebells and battle ropes on the ACE training floor"
              loading="lazy"
              decoding="async"
              className="h-[460px] w-full scale-110 object-cover md:h-[560px]"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-canvas/70 to-transparent" />
          </div>
          {/* gold corner accent */}
          <div className="absolute -bottom-4 -right-4 hidden h-24 w-24 rounded-br-2xl border-b-2 border-r-2 border-gold/70 md:block" />
          <span className="absolute bottom-4 left-4 rounded-full bg-canvas/70 px-3 py-1.5 text-xs uppercase tracking-widest text-ink backdrop-blur">
            {BUSINESS.locality}
          </span>
        </div>
      </div>
    </section>
  )
}
