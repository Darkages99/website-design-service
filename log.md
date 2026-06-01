# Brand-Alchemy — Build Log

> Running status. Newest entry on top. Pairs with `plan.md` (the map). Any agent: update this at
> every phase boundary and whenever something breaks or a decision changes.

**Current phase:** Phase 2 ✅ → starting Phase 3 (build sections §§2–10)
**Live site:** `http://localhost:8881` (Studio site `Brand-alchemy.info`)
**Theme runs from:** `C:\Users\SARANG RAJGOPAUL\Studio\brand-alchemyinfo\wp-content\themes\brand-alchemy\` (synced from `E:` via `sync.ps1`)

---

## 2026-06-01 — Phase 2: Three.js Alchemy Sphere hero ✅

**Done**
- `src/three/glsl.js` — inlined GLSL: Ashima simplex-3D noise, 4-octave fbm, radial
  displacement field, normal-recompute (tangent-neighbour) chunk, and a gold→green
  emissive shimmer chunk. All GLSL-ES-1.00 safe (injected into stock shader chunks).
- `src/three/scene.js` — the orb: high-detail `IcosahedronGeometry` driven by a real
  `MeshStandardMaterial` patched via `onBeforeCompile` (keeps PBR metalness + env-map
  reflections while morphing). Procedural gold→dark→green **equirect env map** via
  `PMREMGenerator` (no HDR download, on-brand reflections). 3-point light rig + ambient.
  Bloom (threshold 0.85, intensity 0.32, mipmapBlur) on the **full** tier only via
  `postprocessing` `EffectComposer`. Cursor parallax (eased), idle drift, hover energy,
  and a `setScroll(0..1)` that drifts/shrinks/dims the orb as the hero leaves. DPR-capped,
  tab-visibility-paused, `destroy()` disposes everything. `alpha:true` composites over
  the CSS gradient.
- `src/scroll.js` — Lenis (lerp 0.1) ↔ GSAP ScrollTrigger sync (the Phase-4 foundation):
  `lenis.on('scroll', ScrollTrigger.update)` + `gsap.ticker.add(t => lenis.raf(t*1000))`
  + `lagSmoothing(0)`. A hero ScrollTrigger feeds `onHeroProgress` → `scene.setScroll`.
- `src/main.js` — capability gate → tier `full` (desktop, fine pointer) / `lite` (capable
  phone: detail 32, no bloom, DPR 1, native scroll) / `none` (reduced-motion, no WebGL, or
  weak phone → static CSS gradient). Scene + scroll chunks **dynamically imported after
  first paint** via `requestIdleCallback` so they never block LCP.
- `src/styles/main.css` — feathered radial **scrim** behind `.ba-hero__inner` (AA contrast
  over the metal) + recommended Lenis CSS classes.
- Code-split bundle: `main` 1.26 kB gz (critical, paints hero), `scroll` 49.7 kB gz,
  `scene` 145.8 kB gz (Three+postprocessing) — both deferred.
- **Verified via screenshots** (forced tier, then reverted): desktop renders a molten
  metallic gold-green orb with correct lighting; hero copy stays legible over it (scrim);
  reduced-motion/headless + mobile both fall back to the clean static gradient.

**Notes / refine later**
- Studio's screenshot browser reports `prefers-reduced-motion: reduce`, so the live 3D is
  suppressed there by design — verify the sphere by temporarily forcing `tier='full'`
  (the build pipeline is otherwise identical). Real desktop visitors get the orb.
- Phase 4 will hang section choreography off the existing Lenis+ScrollTrigger plumbing.
- `scene.js` chunk is 581 kB raw (Three.js) — fine deferred, but a Phase-6 candidate for
  trimming (e.g. drop postprocessing on a budget, or a leaner bloom).

**Next**
- Phase 3: build sections §§2–10 — Problem, Process, Services (Tier 1 active; Tiers 2 & 3
  "Coming Soon", locked, no CTA), Get-vs-Don't (AEO/GEO honesty), Portfolio **placeholder
  gallery** (all "View Case Study" = `#`), Proof ("Concept Work — Your Brand Here"), About,
  FAQ, Final CTA. Keep ≤10 viewport-heights total.

---

## 2026-06-01 — Phase 1: Theme skeleton + toolchain ✅

**Done**
- `package.json` + `vite.config.js` (base `./`, outDir `brand-alchemy/assets/dist`, `manifest: true`, entry `src/main.js`).
- Installed: vite ^8.0.15 (dev); three ^0.184, gsap ^3.15, lenis ^1.3, postprocessing ^6.39 (runtime, for Phase 2).
- Block theme scaffolded: `style.css` (theme header), `theme.json` (v2 — dark palette tokens, fluid type, layout, disabled default palette/gradients), `functions.php`, `inc/theme-setup.php` (canvas + skip link via `wp_body_open`, WhatsApp FAB via `wp_footer`), `inc/enqueue.php` (Vite manifest reader → enqueues hashed CSS + JS module), `inc/dequeue-bloat.php` (emoji/head clutter removal).
- Templates: `templates/index.html`, `templates/front-page.html` (hero), `parts/header.html` (glass nav), `parts/footer.html`.
- `src/main.js` (entry, reduced-motion aware, Phase-2 mount hook), `src/styles/{tokens,main}.css`.
- `sync.ps1` (robocopy E:→Studio). Built (`npm run build` → manifest at `assets/dist/.vite/manifest.json`), synced, activated theme, set blogname=Brand-Alchemy + tagline.
- **Verified via screenshot:** dark hero renders correctly — nav, eyebrow, H1, subhead, both CTAs, WhatsApp FAB, footer. AA contrast holds. Build→sync→activate→render pipeline confirmed working.

**Notes / refine later**
- Hero is currently centered (constrained layout). Phase 2/3: shift to left-aligned with the Alchemy Sphere occupying center-right, per spec.
- `vite` is v8; `three` r184. GLSL shaders will be inlined as JS template strings (no extra plugin).

**Next**
- Phase 2: mount Three.js Alchemy Sphere into `#alchemy-bg` (metallic + GLSL morph, 3-point + env-map lighting, subtle bloom), wire Lenis + GSAP ScrollTrigger, cursor reactivity, reduced-motion + mobile + WebGL-fail fallbacks. Deferred-load after first paint.

## 2026-06-01 — Phase 0: Foundations & research

**Done**
- Confirmed WordPress Studio MCP is connected; site `Brand-alchemy.info` exists and is running (port 8881, PHP 8.4, SQLite).
- Inspected the site: standard on-disk WP install, only default themes + Akismet/Hello (clean slate).
- Read site `STUDIO.md`/`AGENTS.md`/`CLAUDE.md`. Key constraints captured: **use block themes** (not classic),
  use `studio wp` (or MCP) for CLI, don't touch core/`wp-includes`/`mu-plugins`/`db.php`, SQLite backend.
- **Architecture decision (with user): build on WordPress** as a custom **block theme**, vanilla Three.js for 3D,
  Vite build, Lenis + GSAP ScrollTrigger. Rationale in `plan.md` §2.
- Research confirmed: GSAP 100% free incl. all plugins (Apr 2025); Vite→WP manifest enqueue pattern; Lenis↔ScrollTrigger sync idiom.
- Decided dev-on-`E:` / deploy-to-`C:` via `sync.ps1` (WASM sandbox can't see `E:`).
- Wrote `plan.md`, `log.md`, `README.md`, `.gitignore`.

**In progress**
- git init + first commit (Phase 0 close-out).

**Next**
- Phase 1: `package.json` + `vite.config.js`, block-theme skeleton (`theme.json`, `functions.php`, `inc/*`,
  `templates/index.html`, `parts/*`), `sync.ps1`, activate theme, confirm dark shell renders.

**Not working / open**
- None yet. Placeholders to fill listed in `plan.md` §12 (Calendly, WhatsApp, Formspree, GA4/GTM/Pixel, founder copy, domain, logo).
