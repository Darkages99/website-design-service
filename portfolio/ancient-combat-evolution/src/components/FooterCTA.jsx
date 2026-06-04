import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { WHATSAPP_LINK, BUSINESS, PHONE_DISPLAY } from '../data/content'

export default function FooterCTA({ animate = true }) {
  const root = useRef(null)
  const btnRef = useRef(null)

  useEffect(() => {
    if (!animate) return
    const ctx = gsap.context(() => {
      // Heartbeat pulse on the CTA — a double-thump that loops forever…
      const beat = gsap
        .timeline({ repeat: -1, repeatDelay: 0.55 })
        .to(btnRef.current, { scale: 1.06, duration: 0.16, ease: 'power2.out' })
        .to(btnRef.current, { scale: 1, duration: 0.18, ease: 'power2.in' })
        .to(btnRef.current, { scale: 1.04, duration: 0.14, ease: 'power2.out' }, '+=0.05')
        .to(btnRef.current, { scale: 1, duration: 0.2, ease: 'power2.in' })

      // …and accelerates (timeScale 1 → ~1.9) as the section approaches.
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top bottom',
        end: 'top center',
        scrub: true,
        onUpdate: (self) => beat.timeScale(1 + self.progress * 0.9),
      })

      gsap.from('[data-cta]', {
        y: 44,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: { trigger: root.current, start: 'top 70%' },
      })
    }, root)
    return () => ctx.revert()
  }, [animate])

  return (
    <section
      ref={root}
      className="section-shell relative flex min-h-[88vh] flex-col items-center justify-center py-24 text-center"
    >
      <p data-cta className="eyebrow mb-5">
        Trial Class Available
      </p>
      <h2 data-cta className="display text-[clamp(2.4rem,8vw,5.5rem)] text-ink">
        Your First Fight
        <br />
        <span className="text-gold">Starts Today.</span>
      </h2>
      <p data-cta className="mt-6 max-w-xl text-base text-muted md:text-lg">
        Trial class available. No experience needed. Just show up.
      </p>

      <a
        data-cta
        ref={btnRef}
        href={WHATSAPP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className={`btn-gold mt-10 !px-10 !py-5 !text-xl ${animate ? '' : 'animate-heartbeat'}`}
      >
        Book Your First Class
      </a>

      <p data-cta className="mt-6 text-sm text-muted">
        Or walk in — we're open now. {BUSINESS.hours}
      </p>

      {/* slim footer / agency credit (this is a Brand-Alchemy portfolio build) */}
      <footer className="mt-20 w-full border-t border-white/10 pt-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-muted md:flex-row">
          <p>
            © {BUSINESS.name} · {BUSINESS.locality} · {PHONE_DISPLAY}
          </p>
          <p>
            Crafted by{' '}
            <a
              href="../../"
              className="font-semibold text-gold transition-colors hover:text-gold-soft"
            >
              Brand-Alchemy
            </a>
          </p>
        </div>
      </footer>
    </section>
  )
}
