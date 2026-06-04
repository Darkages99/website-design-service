// Lightweight inline SVG icons. Stroke inherits currentColor so they tint with
// whatever text colour the parent sets. Each accepts a className.

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function GloveIcon({ className = 'h-7 w-7' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M7 9a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v3a4 4 0 0 1-4 4H9a2 2 0 0 1-2-2z" />
      <path d="M7 11H5.5a1.5 1.5 0 0 0 0 5H7" />
      <path d="M11 5V4a1 1 0 0 1 2 0v1" />
      <path d="M9 19h7" />
    </svg>
  )
}

export function ShinIcon({ className = 'h-7 w-7' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M9 3h6l1 6c0 4-1 8-4 12-3-4-4-8-4-12z" />
      <path d="M8 7h8" />
      <path d="M9 12h6" />
    </svg>
  )
}

export function BeltIcon({ className = 'h-7 w-7' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <rect x="3" y="9" width="18" height="6" rx="1.5" />
      <rect x="9" y="6.5" width="6" height="11" rx="1.5" />
      <path d="M12 9.5v5" />
      <path d="M3 12h2M19 12h2" />
    </svg>
  )
}

export function KettlebellIcon({ className = 'h-7 w-7' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M9 7a3 3 0 0 1 6 0" />
      <path d="M8.5 8.5C6.5 9.7 5 12 5 14.5 5 18 8 20 12 20s7-2 7-5.5c0-2.5-1.5-4.8-3.5-6" />
      <circle cx="12" cy="14.5" r="2.2" />
    </svg>
  )
}

export function WhatsAppIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.15h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.23 8.23 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28z" />
    </svg>
  )
}

export function PhoneIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M5 4h3l1.5 4-2 1.5a12 12 0 0 0 5 5l1.5-2 4 1.5V18a2 2 0 0 1-2 2A14 14 0 0 1 3 6a2 2 0 0 1 2-2z" />
    </svg>
  )
}

export function PinIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}

export function ArrowIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

// animated scroll-cue glove pointing down
export function ScrollGlove({ className = 'h-8 w-8' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M9 4a3 3 0 0 1 6 0v6a3 3 0 0 1-1 2" />
      <path d="M15 8h1.5a1.5 1.5 0 0 1 0 3H15" />
      <path d="M12 10v8M9 15l3 3 3-3" />
    </svg>
  )
}

export function StarIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2.5l2.9 5.9 6.6.96-4.75 4.63 1.12 6.55L12 17.6l-5.87 3.04 1.12-6.55L2.5 9.36l6.6-.96z" />
    </svg>
  )
}

export const ICON_MAP = {
  glove: GloveIcon,
  shin: ShinIcon,
  belt: BeltIcon,
  kettlebell: KettlebellIcon,
}
