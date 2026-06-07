# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

**Brand-Alchemy** — a high-performance, 3D/interactive single-page portfolio website for an AI-powered web-design agency targeting Chennai/Tamil Nadu SMBs. This branch (`wordpress-free`) is a **standalone static build** (no WordPress). The `main` branch targets WordPress Studio.

## Commands

```powershell
npm install          # one-time dep install
npm run dev          # Vite dev server with HMR (serves root index.html)
npm run build        # Vite build → dist/ (hashed assets, self-contained static site)
```

**WordPress branch only** — after any JS/CSS change:
```powershell
npm run build        # bundle src/ → brand-alchemy/assets/dist/
./sync.ps1           # robocopy theme to C:\…\Studio\brand-alchemyinfo\wp-content\themes\brand-alchemy-chem
```
Then screenshot via the WordPress Studio MCP (`mcp__wordpress-studio__take_screenshot`). **Never claim something works without syncing and screenshotting first.**

## Architecture

### Static build (`wordpress-free` branch)
Vite processes `index.html` at the repo root, bundles `src/`, and writes a self-contained site to `dist/`. No server required; can be hosted on any static host.

### WordPress build (`main` branch)
- **Dev source:** `E:\Website design service\` (this repo)
- **Runtime:** `C:\…\Studio\brand-alchemyinfo\` (WordPress Studio, PHP-WASM, only reads `C:` — symlinks to `E:` don't work)
- **Deployment:** `./sync.ps1` mirrors `brand-alchemy/` into Studio via robocopy
- **Asset pipeline:** Vite bundles `src/` → `brand-alchemy/assets/dist/` with a manifest; `brand-alchemy/inc/enqueue.php` reads the manifest and enqueues hashed files
- **WP CLI:** use `mcp__wordpress-studio__wp_cli` (never a bare `wp` binary)

### Layered canvas approach
```
z-index 0   <canvas id="alchemy-bg">     ← fixed, full-viewport, Three.js (background)
z-index 1   .site-content               ← scrolls over canvas, transparent bg + scrims
z-index 50  fixed nav + WhatsApp FAB
```

### JavaScript (`src/`)
- `main.js` — entry; decides render tier (`none` / `lite` / `full`) based on `prefers-reduced-motion`, WebGL availability, device memory, and screen width. Defers 3D init to `requestIdleCallback` so the LCP headline paints first.
- `three/scene.js` — active background (`ACTIVE_BG = 'nebula'`). Alternative scenes: `scene-alchemical-reactor.js`, `scene-quantum-lattice.js`, `scene-liquid-gold.js`, `scene-catalytic-surface.js`. Swap by changing `ACTIVE_BG` in `main.js`.
- `scroll.js` — Lenis smooth scroll + GSAP ScrollTrigger section reveals and count-ups. Desktop `full` tier only.
- `blueprint.js`, `through-line.js` — alternative background modules (not active).
- `styles/tokens.css` — all CSS custom properties (design tokens).

### WordPress theme (`brand-alchemy/`)
Block theme (not classic). `functions.php` bootstraps `inc/` modules:
- `inc/enqueue.php` — reads Vite manifest, enqueues hashed JS/CSS
- `inc/theme-setup.php` — block theme setup
- `inc/dequeue-bloat.php` — removes WP emoji scripts, unused block CSS, oEmbed, etc.
- `inc/seo.php`, `inc/schema.php`, `inc/tracking.php` — loaded only if the files exist (Phase 5+)

Templates live in `brand-alchemy/templates/`; header/footer parts in `brand-alchemy/parts/`.

## Design tokens (non-negotiable)

| Token | Value |
|---|---|
| `--bg` | `#0a0a0f` |
| `--text` | `#f0f0f5` |
| `--accent-gold` | `#ff9933` |
| `--accent-green` | `#00d26a` |
| `--glass-bg` | `rgba(255,255,255,0.05)` |
| `--scrim` | `rgba(10,10,15,0.75)` |

All text must meet WCAG AA (≥4.5:1). Scrims are mandatory behind any text over the 3D canvas.

## Performance constraints

- LCP < 1.8s desktop / < 2.5s mobile — 3D must never block first paint
- TBT < 200ms — 3D bundle is always lazy/deferred
- Particles: ≤5000 desktop / ≤1000 mobile
- `prefers-reduced-motion`: no Lenis, no auto-rotation, static CSS gradient fallback
- WebGL failure: static CSS gradient fallback

## Tier 1 services only (active)

Only **Essential Web Presence (₹35,000–₹75,000)** is active. Tiers 2 & 3 are visible but locked as "Coming Soon" with no CTA. Portfolio cards are placeholder concept demos labelled "Concept Work — Your Brand Here" — no fake clients.

## Portfolio projects

`portfolio/` contains separate client/demo site builds (e.g. `mac-studio-fitness/`), each with their own `package.json` and Vite config. They are independent from the main Brand-Alchemy build.

## Open placeholders (collect from founder)

Calendly URL, WhatsApp number (`wa.me/<number>`), Formspree endpoint, GA4/GTM/Pixel IDs, founder name/photo, real domain for canonicals, logo/favicon. These are `#` or placeholder values throughout the code — do not replace with invented values.
