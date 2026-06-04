# Ancient Combat Evolution — Fight-Night Portfolio Site

A high-converting, visually explosive one-page site for **Ancient Combat Evolution**, a
real MMA / Boxing / Muay Thai / BJJ gym in **Alwarpet, Chennai**. Built as a featured
spec build for the **Brand-Alchemy** agency portfolio to demonstrate range for combat-sports
businesses.

> Linked from the agency homepage ("Concept Work → Ancient Combat Evolution"). A
> "Crafted by Brand-Alchemy" link in the footer points back to the agency site.

## Stack
- **React 19 + Vite 8** — fast SPA, relative `base: './'` so the bundle drops into any sub-path.
- **Tailwind CSS v4** (`@tailwindcss/vite`) — design tokens in `src/index.css` (`@theme`).
- **GSAP + ScrollTrigger** — scroll-driven animations (parallax, punch-in cards, quote scale, heartbeat).
- **Lenis** — smooth scroll, tied into the GSAP ticker.
- **Canvas 2D** — the "Ring Canvas" background (no WebGL). Self-hosted fonts (Anton + Inter), no third-party requests.

## Run it
```bash
npm install
npm run dev        # http://localhost:5173 (or --port)
npm run build      # → dist/
npm run preview    # serve the production build
```

## The Ring Canvas (`src/components/RingCanvas.jsx`)
A fixed, full-viewport Canvas 2D "fight-night" backdrop:
- **Ropes** — four glowing horizontal lines (red / white / blue / white) that breathe and
  ripple where the cursor passes near them; they *tighten* as you scroll the hero.
- **Corner posts** — metallic-red turnbuckle posts at 15% / 85% that fade in on scroll.
- **Spotlight** — a warm gold spotlight that eases toward the cursor (lerp 0.1) and intensifies
  on the hero and the footer finale.
- **Dust** — up to ~180 gold/white particles drifting upward.
- Runs on `requestAnimationFrame`, **pauses when the tab is hidden**, tears down on unmount.

### Performance / accessibility tiers (`src/App.jsx`)
| Device / preference            | Background            | Animations |
|--------------------------------|-----------------------|------------|
| Desktop, motion OK             | full canvas + spotlight follow | on |
| Mobile/tablet, motion OK       | canvas: 50 dust, static ropes, no spotlight follow | on |
| Reduced-motion **or** low-end* | static CSS gradient (`.ring-fallback`) | off |

\* low-end = `hardwareConcurrency ≤ 2` or `deviceMemory ≤ 2`.

## Editing content (no deep code)
Almost all copy, links, programs, testimonials, schedule and contact details live in one file:
**`src/data/content.js`**. Change text there and rebuild.

## ⚠️ Before launch — fill these placeholders
All are flagged in `src/data/content.js`:

| What to provide | Where |
|---|---|
| **Phone number** (real) | `PHONE_DISPLAY` + `PHONE_E164` — currently `+91 98765 43210`. Powers `tel:`, WhatsApp, and schema. |
| **Exact map coordinates** | `BUSINESS.mapLat` / `mapLng` (currently approximate Alwarpet). The map embed uses the address query and works as-is. |
| **Real domain** | `index.html` `<link rel="canonical">` + Open Graph URLs (currently `ancientcombatevolution.in`). |
| **Agency link target** | Footer "Crafted by Brand-Alchemy" → `../../` (adjust to the deployed agency URL). |
| **Instagram / Facebook** | None found for this gym — add social links to the nav/footer if/when created. |

WhatsApp buttons are pre-filled with *"Hi Ancient Combat Evolution, I want to book a trial class."*
and work the moment the real phone number is set.

## Real assets used
Sourced from the gym's public listings (JustDial / BookMyPlayer), stored locally:
- `public/assets/logo.webp` — shield + tiger logo
- `public/assets/hero-group.avif` — team in fighting stance (hero)
- `public/assets/training-floor.webp` — kettlebell / battle-rope floor (About)
- `public/assets/team-medals.jpg` — team with medals (Location)

Fonts are self-hosted in `src/assets/fonts/` (latin subset, Vite-hashed at build).

## Verification
`verify-shots/shoot.mjs` is a small Playwright script that screenshots desktop (hero / programs /
testimonials / footer) and mobile, and fails on any console/page error. Run with the dev or
preview server up:
```bash
node verify-shots/shoot.mjs           # against http://localhost:4317
SHOOT_URL=http://localhost:4318 node verify-shots/shoot.mjs
```
