# Ancient Combat Evolution — site

Performance-first, 3D-immersive one-page site for **Ancient Combat Evolution**, a real
MMA / Boxing / Muay Thai / BJJ gym in **Alwarpet, Chennai**. A Brand-Alchemy spec build.

Priority order, treated as a hard gate: **Performance → CRO → SEO → Aesthetics.**

## Stack
- **Vanilla JS + Vite 8** — `base: './'` so the bundle drops into any sub-path.
- **Vanilla CSS** with design tokens (`src/styles/tokens.css`). No utility framework.
- **Three.js** (hero ember "void") + **Lenis** (smooth scroll) — both code-split and
  dynamic-imported *after idle, on the `full` tier only*. They never touch the critical path.
- Self-hosted **Anton** display font (`font-display: swap`).

## Run
```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # → dist/
npm run preview   # serve the production build
npm run media     # rebuild web assets from ../ace/assets (needs ffmpeg + npx hyperframes)
npm run verify    # Playwright: screenshots + fails on console errors (preview must be up)
```

## Architecture
- `src/main.js` — critical path only: nav, reveal-on-scroll (gated by a `.js` class so the
  page is fully visible without JS), lazy map, the CRO form, link wiring. Then it detects a
  render **tier** and dynamic-imports the enhancement layer after idle.
- `src/lib/tiers.js` — `none | lite | full` from `prefers-reduced-motion`, deviceMemory,
  CPU cores, save-data, screen width, WebGL.
  - **none** (reduced-motion): posters only, no autoplay, no smooth scroll, no 3D.
  - **lite** (mobile / low-power): lazy video reels + overlay words + count-ups.
  - **full** (desktop + WebGL): the above **plus** the Three.js void, ghost parallax, Lenis.
- `src/enhance.js` — deferred orchestrator (reels, count-ups; +void/Lenis/parallax on full).
- `src/lib/reels.js` — swaps reel posters → muted looping `<video>` only while on screen,
  pauses off screen. Overlay words animate via CSS keyed to each clip's real duration.
- `src/three/void.js` — gold-ember field, pointer parallax; renders only while the hero is
  on screen and the tab is visible; particle count well under caps.
- `src/data/config.js` — **the only place placeholders live** (see below).

## Media pipeline (`scripts/process-media.mjs`)
ffmpeg recuts the gym's vertical reels to 5–8s muted loops + WebP posters, grades the photos,
cuts the logo's black background, and `hyperframes remove-background` produces the hero
"ghost fighter" cutout. Outputs land in `public/assets/` (committed). Raw inputs stay in
`../ace/assets/`. Scratch (contact sheets, cutout intermediates) is under `media/` (gitignored).

## ⚠️ Before launch — fill these placeholders
All isolated in **`src/data/config.js`**; until set, the call/chat CTAs degrade to the on-page
form and the form falls back to WhatsApp, so no lead is ever dropped.

| What | Where |
|---|---|
| Real phone (display + E.164) | `PHONE_DISPLAY`, `PHONE_E164` — powers tel:, WhatsApp, schema |
| Booking link (e.g. Calendly) | `BOOKING_URL` (null → CTAs scroll to the form) |
| Form endpoint (e.g. Formspree) | `FORM_ENDPOINT` (null → WhatsApp fallback) |
| Exact map coordinates | confirm the unit, then swap the address-query embed for a pinned one |
| Real domain | `index.html` canonical + Open Graph URLs (currently `ancientcombatevolution.in`) |
| OG image | currently `proof-group.webp`; a dedicated 1200×630 is nicer |

Instagram (`ancient_combat_evolution`), address, hours, programs, schedule and the review
quotes are **real**. Verify the exact street unit before launch.

## Deploy
Built `dist/` is self-contained. The agency build copies it via `scripts/copy-portfolio.mjs`
→ `dist/portfolio/ancient-combat-evolution/`. A "Crafted by Brand-Alchemy" footer link points
back to the agency site (`../../` — adjust to the live URL).
