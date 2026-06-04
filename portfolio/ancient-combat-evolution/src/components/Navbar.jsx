import { useEffect, useState } from 'react'
import { NAV_LINKS, BUSINESS, WHATSAPP_LINK } from '../data/content'
import { WhatsAppIcon } from './icons/Icons'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // lock body scroll when the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-white/10 bg-canvas/80 backdrop-blur-md'
          : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
        <a href="#top" className="flex items-center gap-3">
          <img
            src="./assets/logo.webp"
            alt="Ancient Combat Evolution logo"
            width="40"
            height="40"
            className="h-10 w-10 rounded-full ring-1 ring-gold/50"
          />
          <span className="display text-lg leading-none text-ink">
            ANCIENT<span className="text-gold"> COMBAT</span>
          </span>
        </a>

        {/* desktop links */}
        <ul className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-sm font-semibold uppercase tracking-wider text-muted transition-colors hover:text-gold"
              >
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-gold/60 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-gold transition-all hover:bg-gold hover:text-black"
            >
              <WhatsAppIcon className="h-4 w-4" />
              Book Trial
            </a>
          </li>
        </ul>

        {/* mobile toggle */}
        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
        >
          <span
            className={`h-0.5 w-6 bg-ink transition-transform duration-300 ${
              open ? 'translate-y-2 rotate-45' : ''
            }`}
          />
          <span
            className={`h-0.5 w-6 bg-ink transition-opacity duration-300 ${
              open ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`h-0.5 w-6 bg-ink transition-transform duration-300 ${
              open ? '-translate-y-2 -rotate-45' : ''
            }`}
          />
        </button>
      </nav>

      {/* mobile drawer */}
      <div
        className={`fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-canvas/97 backdrop-blur-lg transition-all duration-300 md:hidden ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        {NAV_LINKS.map((l) => (
          <a
            key={l.href}
            href={l.href}
            onClick={() => setOpen(false)}
            className="display text-3xl text-ink transition-colors hover:text-gold"
          >
            {l.label}
          </a>
        ))}
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setOpen(false)}
          className="btn-gold mt-2"
        >
          <WhatsAppIcon /> Book Your Trial
        </a>
        <p className="mt-4 text-xs uppercase tracking-widest text-muted">
          {BUSINESS.locality}
        </p>
      </div>
    </header>
  )
}
