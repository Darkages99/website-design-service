import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/gsap'
import {
  BUSINESS,
  WHATSAPP_LINK,
  TEL_LINK,
  MAPS_DIRECTIONS,
  MAPS_EMBED,
  PHONE_DISPLAY,
} from '../data/content'
import { WhatsAppIcon, PhoneIcon, PinIcon } from './icons/Icons'

export default function Location({ animate = true }) {
  const root = useRef(null)
  const imgRef = useRef(null)
  const mapWrap = useRef(null)
  // Only mount the third-party Google Maps iframe once it scrolls near view.
  // Keeps it off the initial network path (better LCP + privacy).
  const [showMap, setShowMap] = useState(false)

  useEffect(() => {
    const el = mapWrap.current
    if (!el || showMap) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShowMap(true)
          io.disconnect()
        }
      },
      { rootMargin: '200px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [showMap])

  useEffect(() => {
    if (!animate) return
    const ctx = gsap.context(() => {
      gsap.from('[data-loc]', {
        y: 36,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: { trigger: root.current, start: 'top 72%' },
      })
      gsap.to(imgRef.current, {
        yPercent: -12,
        ease: 'none',
        scrollTrigger: {
          trigger: '[data-loc-img]',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })
    }, root)
    return () => ctx.revert()
  }, [animate])

  return (
    <section id="location" ref={root} className="section-shell py-24 md:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <p data-loc className="eyebrow mb-4">
            Get Here
          </p>
          <h2 data-loc className="display text-[clamp(2rem,5vw,3.6rem)] text-ink">
            Find <span className="text-gold">The Arena</span>
          </h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* details + buttons */}
          <div data-loc className="flex flex-col">
            <div className="glass-card flex-1 p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold">
                Address
              </p>
              <p className="mt-3 text-lg leading-relaxed text-ink">
                {BUSINESS.address}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                <div>
                  <p className="uppercase tracking-widest text-muted">Hours</p>
                  <p className="mt-1 text-ink">{BUSINESS.hours}</p>
                </div>
                <div>
                  <p className="uppercase tracking-widest text-muted">Days</p>
                  <p className="mt-1 text-ink">{BUSINESS.days}</p>
                </div>
                <div>
                  <p className="uppercase tracking-widest text-muted">Phone</p>
                  <p className="mt-1 text-ink">{PHONE_DISPLAY}</p>
                </div>
                <div>
                  <p className="uppercase tracking-widest text-muted">Languages</p>
                  <p className="mt-1 text-ink">Hindi · English</p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a href={TEL_LINK} className="btn-outline !px-5 !py-3 !text-sm">
                  <PhoneIcon className="h-4 w-4" /> Call Now
                </a>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold !px-5 !py-3 !text-sm"
                >
                  <WhatsAppIcon className="h-4 w-4" /> WhatsApp
                </a>
                <a
                  href={MAPS_DIRECTIONS}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline !px-5 !py-3 !text-sm"
                >
                  <PinIcon className="h-4 w-4" /> Get Directions
                </a>
              </div>
            </div>
          </div>

          {/* map (lazy-mounted) */}
          <div
            ref={mapWrap}
            data-loc
            className="relative min-h-[320px] overflow-hidden rounded-2xl ring-1 ring-white/10"
          >
            {showMap ? (
              <iframe
                title="Ancient Combat Evolution location map"
                src={MAPS_EMBED}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full min-h-[320px] w-full grayscale-[0.3] contrast-110"
                style={{ border: 0 }}
              />
            ) : (
              <a
                href={MAPS_DIRECTIONS}
                target="_blank"
                rel="noopener noreferrer"
                className="ember-fallback flex h-full min-h-[320px] flex-col items-center justify-center gap-3 text-muted transition-colors hover:text-gold"
              >
                <PinIcon className="h-8 w-8" />
                <span className="text-sm uppercase tracking-widest">
                  Open map · {BUSINESS.locality}
                </span>
              </a>
            )}
          </div>
        </div>

        {/* team / medals image */}
        <div
          data-loc-img
          className="relative mt-10 overflow-hidden rounded-2xl ring-1 ring-white/10"
        >
          <img
            ref={imgRef}
            src="./assets/team-medals.jpg"
            alt="The ACE team with medals and trophies in front of the gym's logo wall"
            loading="lazy"
            decoding="async"
            className="h-[340px] w-full scale-110 object-cover md:h-[440px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/40 to-transparent" />
          <p className="display absolute bottom-6 left-1/2 w-full -translate-x-1/2 px-6 text-center text-[clamp(1.3rem,3.5vw,2.2rem)] text-ink">
            A legacy of champions starts with a{' '}
            <span className="text-gold">single step.</span>
          </p>
        </div>
      </div>
    </section>
  )
}
