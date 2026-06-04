import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { motionState } from '../lib/motion'
import { BUSINESS, WHATSAPP_LINK } from '../data/content'
import { ScrollGlove, ArrowIcon } from './icons/Icons'
import GoldTiger from './GoldTiger'

export default function Hero({ animate = true }) {
  const root = useRef(null)
  const imageRef = useRef(null)
  const contentRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Publish hero scroll progress → canvas (ropes tighten / spotlight grows).
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          motionState.heroProgress = self.progress
        },
      })

      if (!animate) return

      // Slow parallax on the hero image (moves at ~0.5x scroll speed).
      gsap.to(imageRef.current, {
        yPercent: 22,
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })

      // Intro reveal for the hero content.
      gsap.from(contentRef.current.querySelectorAll('[data-reveal]'), {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.12,
        delay: 0.15,
      })
    }, root)

    return () => ctx.revert()
  }, [animate])

  return (
    <section
      id="top"
      ref={root}
      className="relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden"
    >
      {/* Parallax hero image layer (above canvas, below content) */}
      <div className="absolute inset-0 -z-[1] overflow-hidden">
        <img
          ref={imageRef}
          src="./assets/hero-group.avif"
          alt="The Ancient Combat Evolution team in fighting stance in front of the gym's punching bags"
          fetchPriority="high"
          className="h-[120%] w-full scale-105 object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-canvas via-canvas/70 to-canvas" />
        <div className="absolute inset-0 bg-gradient-to-r from-canvas/90 via-transparent to-canvas/90" />
      </div>

      <div
        ref={contentRef}
        className="section-shell flex max-w-4xl flex-col items-center pt-20 text-center"
      >
        <div data-reveal className="mb-2 w-[clamp(13rem,34vw,21rem)]">
          <GoldTiger
            animate={animate}
            className="w-full drop-shadow-[0_0_44px_rgba(212,175,55,0.45)]"
          />
        </div>

        <p data-reveal className="eyebrow mb-4">
          {BUSINESS.locality} · Est. for Fighters
        </p>

        <h1
          data-reveal
          className="display text-[clamp(2.6rem,9vw,6.5rem)] text-ink"
        >
          Ancient Combat
          <br />
          <span className="text-gold">Evolution</span>
        </h1>

        <p
          data-reveal
          className="mt-5 max-w-2xl text-base text-muted md:text-lg"
        >
          Chennai's Premier MMA, Boxing &amp; Muay Thai Gym — Open to All.
        </p>

        <div
          data-reveal
          className="mt-9 flex flex-col items-center gap-4 sm:flex-row"
        >
          <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="btn-gold">
            Book Your First Class
          </a>
          <a href="#schedule" className="btn-outline">
            View Schedule <ArrowIcon />
          </a>
        </div>
      </div>

      {/* scroll indicator */}
      <a
        href="#about"
        aria-label="Scroll to learn more"
        className="absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-gold/80 transition-colors hover:text-gold"
      >
        <span className="text-[0.65rem] uppercase tracking-[0.3em] text-muted">
          Step In
        </span>
        <ScrollGlove className="h-8 w-8 animate-bob" />
      </a>
    </section>
  )
}
