# Brand-Alchemy — Build Log

> Running status. Newest entry on top. Pairs with `plan.md` (the map). Any agent: update this at
> every phase boundary and whenever something breaks or a decision changes.

**Current phase:** Phase 16 ✅ — Consolidated onto `main`: original Alchemy Nebula (now with a defined-sphere bloom entrance), grammar/clarity pass, and the Brand-Alchemy identity restored.
**Live site:** `http://localhost:8881` (Studio site `Brand-alchemy.info`)
**Theme runs from:** `C:\Users\SARANG RAJGOPAUL\Studio\brand-alchemyinfo\wp-content\themes\brand-alchemy\` & `...\brand-alchemy-chem\` (synced from `E:` via `sync.ps1` and direct robocopy)

---

## 2026-06-02 — Phase 16: Consolidation onto main — nebula entrance, grammar pass, identity restore ✅

User: *"Settled on the original nebula as the proper background. Content changes need to be merged with main. Fix the grammatical issues — clarity is king but within the rules of good English. Make the initial nebula more of a defined sphere, and slightly smaller in radius so it expands for a bit longer."*

**Done**
- **Original Alchemy Nebula kept as the default** (`ACTIVE_BG = 'nebula'`, `src/main.js`) — the `da2ef7d` point cloud with the `{ setScroll, setHover, destroy }` interface and hero-scroll dispersal via `onHeroProgress`. The chemistry-lab experiments (Liquid Gold, Catalytic Surface, Through-Line, Self-Building Blueprint, Quantum Lattice, Alchemical Reactor) stay in-tree as **dormant, swappable alternatives** (per user).
- **Nebula entrance bloom** (`src/three/scene.js`): on mount the cloud now reads as a crisp, slightly smaller **defined sphere** and blooms outward into the full nebula over ~6.5s. `position` now stores the unit sphere direction; the shell-thickness jitter moved to a new `aJitter` attribute; a `uIntro` uniform (0→1, smootherstep on the JS side) fades in the radius (`uIntroStart` 0.6 → 1.0), shell thickness, curl swirl (gated by `uIntro²` so it stays defined at first), and breathing. Tuning knobs: `uIntroStart`, `INTRO_DURATION`.
- **Grammar / clarity pass** (`templates/front-page.html`, mirrored in `inc/schema.php`): fixed the "make your site … built to convert" verb mismatch (→ "We deliver a site that's search-ready and built to convert"); replaced the repeated awkward "you'll need to arrange yourself" with "is yours to arrange" / "handle yourself" (boundary intro + note + two FAQ answers); fixed a colon splice in the boundary note (→ period); "5 business email IDs" → "5 business email accounts"; tightened the 90-day metric label. JSON-LD FAQ + Service description kept in sync.
- **Brand identity restored** (dropped the "Chemistry Lab" rebrand): `style.css` theme name/description back to the original "Brand-Alchemy"; `theme.json` palette names back to Saffron Gold / Emerald (kept the chemistry-era hexes `#1fe08a` + the added Aqua Cyan — part of the approved readable look).
- **Consolidated onto `main`** via fast-forward: content/copy + de-glassed solid surfaces (Phase 8) + readability + palette + the original nebula. `main` and `chemistry-lab` now converge.

**Verified**
- `npm run build` clean (main/scroll/scene chunks emitted, new hashes). Mirrored into **both** Studio theme folders (`brand-alchemy` + `brand-alchemy-chem`) via robocopy so the change shows regardless of the active theme.
- Live verification of the entrance bloom + cursor drift is pending in a real desktop browser — Studio screenshots run reduced-motion (tier `none` → static gradient), so the 3D path doesn't render there.

---

## 2026-06-02 — Phase 15: Alchemy Nebula Re-Activated & Touchscreen / Low-Power Gate Solved ✅

**Done**
- **Alchemy Nebula Activated**: Re-activated the gold-to-green additive point cloud ('nebula') as the final default background in `src/main.js` via the `ACTIVE_BG = 'nebula'` configuration.
- **Universal Desktop Tiering for Touchscreens**: Solved the issue where Windows touch screen devices with `(pointer: coarse)` (like Microsoft Surface, Dell XPS, Lenovo ThinkPad) were wrongly classified in the mobile safety check and downgraded to `lite` or `none` (leading to a static fallback or no animation). Rewrote `decideTier()` in `src/main.js` to run the mobile safety checks solely on screen width (`max-width: 720px`).
- **Touch-Friendly Pointer Tracking**: Removed the restrictive `(pointer: fine)` matchMedia gate in `src/three/scene.js`, binding `pointermove` universally to track both fingers and traditional cursors smoothly.
- **Gym Website Hosted**: Located the "Ancient Combat Evolution" gym portfolio project at `portfolio/ancient-combat-evolution/` and successfully booted up its React + Vite local development server on `http://localhost:5173/`.

**Verified**
- Rebuilt production assets via `npm run build` and mirrored outputs into BOTH active local WordPress theme folders (`wp-content/themes/brand-alchemy/` and `wp-content/themes/brand-alchemy-chem/`) using robocopy to guarantee compatibility regardless of which theme the user has active in the dashboard.
- Verified that the Vite server for the gym site is successfully running and active on `http://localhost:5173/`.

---

## 2026-06-01 — Phase 14: Volumetric Contrast Optimization & Universal Pointer Interactions ✅

**Done**
- **WebGL Transparency**: Replaced the solid `#08080c` Three.js backdrop canvas texture in `src/three/scene-alchemical-reactor.js` with `null` so the canvas is transparent, allowing the custom radial CSS gradients on `#alchemy-bg` to display and blend seamlessly with WebGL overlays.
- **Shader Color & Alpha Boost**: Fine-tuned the FBM fragment shader to increase contrast, visibility, and color luminosity. Scaled gold smoke colors to `0.85`, green to `0.95`, and cyan to `1.0`. Raised baseline smoke alpha bounds from `0.24` to `0.35` to give a rich, gaseous atmosphere while maintaining flawless text legibility.
- **Enhanced Interactive Glows**: Amplified the pointer-reactive conversion cascade from `smoothstep(0.48, 0.04)` to `smoothstep(0.55, 0.02)` and boosted cursor core glow intensity to `0.35` for a high-fidelity "wow" factor under client interaction.
- **Frustum Culling Safety**: Bypassed frustum culling on the screen-space quad (`bgMesh.frustumCulled = false`) to ensure the gaseous smoke shader is never clipped regardless of aspect ratio adjustments.
- **Universal Pointer Listener**: Removed the `pointer: fine` media query check, universally binding `pointermove` to support touch dragging and pointer speed trail spark emission on all mobile, tablet, and emulated touch devices.

**Verified**
- Rebuilt Vite production bundle (`npm run build`) and successfully synced assets via `powershell -ExecutionPolicy Bypass -File .\sync.ps1`.
- Performed high-fidelity visual and programmatic verification via a browser subagent on `http://localhost:8881`. Confirmed that the volumetric FBM fluid atmosphere paints immediately over beautiful CSS background gradients with zero JavaScript runtime errors.
- Verified smooth responsiveness of hover/scroll animations, cursor speed trails, and reactive card hovers.

---

## 2026-06-01 — Phase 13: Alchemical Reactor Activated + ReferenceError Bug Fix ✅

**Done**
- **Alchemical Reactor Background**: Activated `'reactor'` (Concept C) as the default background inside `src/main.js`. 
- **ReferenceError bug fix**: Fixed a critical `ReferenceError: bgGeometry is not defined` inside `src/three/scene-alchemical-reactor.js` by explicitly defining `bgGeometry` during full-screen quad creation so it can be successfully disposed when `destroy()` is called.
- **Easy swap toggle**: Configured the easy-swap toggle `ACTIVE_BG` in `src/main.js` to cleanly support all three background modules: `'reactor'` (Alchemical Reactor), `'quantum-lattice'` (Quantum Gravity Lattice), and `'nebula'` (the first Alchemy Nebula), making it extremely simple to transition between them.

**Verified**
- Rebuilt Vite bundle via `npm run build` and ran `./sync.ps1` successfully.
- Conducted interactive browser verification via browser subagent on `http://localhost:8881/` checking volumetric 3D gaseous smoke fluid interactions, confirming smooth performance and **zero JavaScript console errors**.

---

## 2026-06-01 — Phase 12: Quantum Gravity Lattice + Easy Swap Toggle + About Section Edit ✅

**Done**
- **Quantum Gravity Lattice background**: Created `src/three/scene-quantum-lattice.js` (3D constellation grid of glowing chemical nodes and connection lines driven by a simplex curl field, cursor-reactive gravity well, and scroll-responsive dispersion).
- **First ever nebula restored**: Replaced `src/three/scene.js` with the first ever version of the Alchemy Nebula (`da2ef7d`) from git history as requested by the user.
- **Easy swap toggle**: Added an `ACTIVE_BG` variable at the top of the `start` loader in `src/main.js` allowing seamless swapping between `'quantum-lattice'` and `'nebula'`.
- **About section content edit**: Removed "me and a friend" from the About paragraph in `brand-alchemy/templates/front-page.html`, making it read cleanly as "We're two Chennai-based students...".

**Verified**
- Rebuilt Vite bundle via `npm run build` and ran `./sync.ps1` successfully.
- Verified that both scenes adhere to the same `{setScroll, setHover, destroy}` controller interface, enabling 100% hot-swappable background loading.

---

## 2026-06-01 — Phase 11: back to the Alchemy Nebula (continuous scroll bursts) ✅

User: "switch back to the original light particles that explode on scroll and move with mouse… enhance it to be more continuously scroll interactive, it stopped after first scroll."

**Root cause of the stop:** the original drove a one-shot `setScroll` "disperse + fade" from a HERO-only ScrollTrigger (`start top top / end bottom top`) → it maxed out + faded once the hero left, then went inert.

**Done — rewrote `src/three/scene.js` as the Alchemy Nebula, self-driven by scroll:**
- Same curl-noise point cloud (~5000 full / 1000 lite, additive + bloom, `glsl.js` reused), cursor parallax (rotation), gold→green by height. **No more hero-only fade.**
- The scene now **listens to `window` scroll itself** and keeps a decaying `uEnergy`: each scroll event adds impulse ∝ scroll distance; the frame loop decays it (×0.90/frame). So scrolling ANYWHERE bursts the points outward (`pos += normalize(base)*uEnergy`) + brightens + grows them, and they ease back when you stop — continuous reactivity down the whole page. `uProgress` (scrollY/maxScroll) tinges the cloud cyan→green as you descend. Stays bright throughout (`vAlpha = 0.82 + uEnergy*0.5`) instead of fading to nothing.
- `main.js` mounts the nebula again (canvas + tier; 'none' = static gradient) and no longer needs to feed it scroll callbacks — `initSmoothScroll()` runs purely for smooth-scroll/reveals/count-ups/tilt on full tier. Restored the `#alchemy-bg` nebula atmosphere gradient (gold TR / green BL / faint cyan). Three.js is back in the bundle (the nebula needs it).
- De-glassed solid surfaces (Phase 8) kept. The Blueprint/Through-Line/Liquid Gold/Catalytic modules remain preserved as alternatives.

**Verified**
- Forced-tier desktop screenshot: gold→green luminous particle cloud in the hero, hero text legible, count-up running ("82 days" mid-count). Reverted the forced-tier hack + rebuilt/synced. HTTP 200, no PHP errors. The continuous scroll-burst + cursor drift only run in a real desktop browser (Studio = reduced-motion = static gradient) — confirm the "keeps reacting on every scroll" behaviour live.

**Tuning knobs:** impulse scale (`/38`, cap 0.7), energy decay (0.90), burst distance (`uEnergy*(0.55+rand*0.9)`), brightness floor (0.82). Raise decay→longer-lasting bursts; raise burst distance→bigger explosions.

---

## 2026-06-01 — Phase 10: background → The Self-Building Blueprint ✅

User found the Through-Line "too simple, no wow"; chose concept #3 **Self-Building Blueprint** instead.

**Done — `src/blueprint.js` (new, pure SVG + IntersectionObserver, no Three/GSAP):**
- A faint **drafting grid** behind everything (CSS on `#alchemy-bg`: fine 16 px + major 80 px cyan lines + a vignette so edges fade and text stays clean). Then per real element a **construction frame** that draws itself in as the element scrolls into view: an outline rect (`stroke-dashoffset` draw-on), 4 corner **registration brackets** (snap/scale in), and corner **node dots**. Framed targets: `.ba-hero__inner`, every `.ba-card`, `.ba-faq__item`, `.ba-final__inner`. The **active Services tier frames gold** (`.ba-tier--active`), the **final CTA frames green** ("build complete"); everything else cyan.
- Frames sit just OUTSIDE each element and BEHIND content (z-0) → they live in the gutters/gaps and never cover text. Geometry via the **offsetParent chain** (layout coords) so the scroll-reveal transforms don't offset them. `IntersectionObserver` (threshold 0.15, `-8%` bottom margin) toggles `.is-built` once per element → CSS animates the draw-on. Rebuild on resize/load via `ResizeObserver` (debounced). **Reduced-motion → every frame shown already built** (so it renders in Studio's screenshot — confirmed).
- `main.js` now imports `./blueprint.js` (was `./through-line.js`); scroll.js still desktop-only; still no Three.js in the bundle. The Through-Line (`src/through-line.js` + its `.ba-thread` CSS) is preserved as an alternative; Liquid Gold / Catalytic Surface / Molecular also still available (see Phase 9 notes).

**Verified**
- Desktop screenshot (reduced-motion → all frames built): blueprint grid + bracketed/outlined frames around the hero and every card, corner nodes, **gold frame on the ₹4,999 Essential tier**, over the drafting grid. HTTP 200, no PHP errors. The section-by-section draw-on (the real "engineering itself" effect) only runs in a real desktop browser (Studio = reduced-motion = all-built static).

**Notes / tuning knobs**
- Frame inset (PAD 6), bracket length (ARM 14), draw-on timing (0.9 s rect + 0.3 s bracket delay), grid spacing/opacity, glow — all easy to tune. Could add dimension lines / spec labels / a sweeping "scan" line for more drafting flavour if wanted.

---

## 2026-06-01 — Phase 9: background → The Through-Line ✅

User picked "The Through-Line" from 3 content-integrated concepts I proposed (they wanted wow + tight integration with the content structure; disliked the prior backgrounds' detached/over-reactive feel).

**Done — `src/through-line.js` (new, pure SVG, no Three/GSAP):**
- A single luminous thread (gold→cyan→green gradient) drawn down the page just left of the content column, **behind** the content (z-0) so solid cards occlude it — text-safe by z-order; it shows in the gutter + section gaps. Drawn progressively on scroll (`stroke-dashoffset` = scroll progress) with a glowing head at the tip; a node lights up at each section as the line reaches it. Section Y from `offsetTop/offsetHeight` (immune to the reveal transforms). Multi-card sections get node clusters (Problem×3, Process×4, Services×3, Proof×3), Services' active node is gold, Boundary forks green/dim, the final CTA is a bright green "customer" node + halo. Native rAF-throttled scroll + ResizeObserver rebuild. **Reduced-motion → drawn full + static** (so it shows in Studio's screenshot, which it does).
- **Rewired `main.js`:** loads `through-line.js` on every device (self-gates motion); loads `scroll.js` (Lenis smooth scroll + reveals + count-ups + tilt) only on the desktop "full" tier. **No longer mounts a Three.js scene** → `three.module` (≈128 kB gz) is gone from the shipped bundle. Removed the top reaction-progress bar from `scroll.js` (the spine is the progress indicator now).
- **Preserved backgrounds (swap by importing one's `mountScene` in main.js):** Liquid Gold → `src/three/scene-liquid-gold.js`; Catalytic Surface → `src/three/scene-catalytic-surface.js`; Molecular Bond Network → git `9fd341c`. (`src/three/scene.js` still holds Liquid Gold but is unused/unbundled.)

**Verified**
- Desktop screenshot (reduced-motion → static thread): glowing gold→cyan→green spine down the left gutter with lit node clusters per section, solid cards, no glass. HTTP 200, no PHP errors. Build dropped the Three chunk (lighter bundle). The scroll-draw animation + traveling head only show in a real desktop browser (Studio = reduced-motion = static).

**Notes / tuning knobs**
- Thread presence: spine width 2.5 + cyan drop-shadow glow; node radii 3.8 / services 5.4 / CTA 8; baseX sits ~26 px left of the 1200-px content column (deeper gutter on wide screens, edge band on narrow). Easy to thicken/brighten or weave more. The "wow" is the draw-on-scroll + comet head + sequential node lighting — confirm live.

---

## 2026-06-01 — Phase 8: remove glassmorphism (solid surfaces) ✅

User: "I really don't like the glass thing so remove that." Removed ALL frosted/translucent glass:
- `--glass-bg` → solid `#14161d`; dropped `--glass-blur`; `--glass-border` → plain hairline `rgba(255,255,255,0.08)`.
- Removed every `backdrop-filter: blur()` — `.ba-card`, `.ba-nav` (now solid `#0b0c12`), `.ba-final__inner`.
- Form fields → solid fills (`#181b24` / focus `#1d212c`). Verified: **no `backdrop-filter` in output**, no PHP errors, cards render as solid opaque panels (screenshot). Background still Liquid Gold for now (user is picking a new one).

---

## 2026-06-01 — Phase 7: Content editability + founder handoff ✅

**Done**
- **Editability conversions** (front-end verified pixel-identical; `validate_blocks` 105/115):
  - **Services tiers → core blocks**: plan name = `core/heading`, price = `core/paragraph` ×2 in a
    `ba-tier__price` group, features = `core/list`, active CTA = `core/button`. Founder can now edit
    **prices, names, and feature lists** in the Site Editor. Badges + lock pills stay as tiny `core/html`
    chrome. Added `.ba-grid/.ba-tier/.ba-tier__price > * { margin-block-start: 0 }` to neutralise WP's
    injected layout block-gap so spacing matched the old design exactly.
  - **FAQ → `core/details` blocks** (native, editable accordion). Restyled: `.ba-faq__item summary` +
    a rotating `+`→`×` glyph via `summary::after`; answer = `.ba-faq__item > :not(summary)`.
  - Already-editable since Phase 3: hero copy, every section title/intro, About, final CTA copy (all core blocks).
- **`HANDOFF.md`** — founder guide: Part 1 (edit content, no code), Part 2 (pre-launch placeholder checklist
  with exact file locations), Part 3 (developer build/deploy + the FAQ↔schema sync rule). Linked from README.
- **README** updated with the HANDOFF pointer.

**Notes / refine later**
- Remaining `core/html` (10): the 5 lower-edit-frequency card grids (Problem/Process/Concept-Work/Proof/
  Boundary) + 4 tier badge/lock chrome bits + the contact form. All render fine and are parser-valid; the
  validator’s lint prefers core blocks (grids) or Jetpack Forms (form). Converting the grids is optional
  future polish (documented in HANDOFF Part 3); the form is intentionally a lightweight Formspree `<form>`.
- **FAQ↔schema sync**: editing FAQ copy in the Site Editor does NOT auto-update the JSON-LD in
  `inc/schema.php` — a dev must mirror changes. Documented in HANDOFF.

**Project status: feature-complete.** Outstanding = founder inputs (HANDOFF Part 2) + deploy + Lighthouse.

---

## 2026-06-01 — Phase 6: Performance & accessibility hardening ✅

**Done**
- **Inline critical CSS** (`inc/enqueue.php`): the theme CSS (3.7 kB gz) is now inlined via
  `wp_add_inline_style` on a src-less `ba-main` handle instead of a render-blocking `<link>` —
  verified: no external main-CSS link, `<style id='ba-main-inline-css'>` present.
- **Mobile JS trim** (`src/three/scene.js`): `postprocessing` (bloom) is now a **dynamically-imported,
  full-tier-only** chunk (`build-*.js`, 14 kB gz). Mobile/lite ships three (128 kB gz) + scene (3.5 kB gz)
  only; the render loop starts on the plain renderer and swaps to the composer when it resolves.
  Verified bloom still renders (forced-tier screenshot).
- **Bloat trim** (`inc/dequeue-bloat.php`): dequeued `classic-theme-styles`, removed oEmbed discovery,
  oEmbed host JS, and the REST `<head>` link. Verified all absent; page unaffected.
- 3D + scroll remain fully off the critical path (dynamic import on `requestIdleCallback`); critical
  payload = inline CSS + `main` (1.37 kB gz module, footer).
- **Accessibility pass** (manual): AA contrast holds (muted text ~7.6:1, gold ~8:1 on `--bg`; dark text
  on gold CTAs ~8:1); `:focus-visible` ring; skip link; decorative canvas `aria-hidden`; WhatsApp FAB +
  form fields labelled; heading order h1→h2→h3 with no skips; do/don't uses icon+label (colour not sole carrier);
  reduced-motion fully static (no 3D/scroll JS, CSS animations neutralised).
- **No PHP notices/warnings** in output; HTTP 200; 10 sections; HTML 70 kB (incl. inline CSS + JSON-LD).

**Notes / refine later**
- **Lighthouse/CWV must be run on the deployed site** (Studio runs PHP-WASM/SQLite; no headless Chrome here).
  Architecture targets the §9 budgets: LCP = inline-styled HTML H1 (no blocking CSS/JS), 3D deferred,
  code-split, single robots tag. Founder/dev: run PageSpeed Insights post-deploy and record results here.
- Scroll length ≈ 6–7 viewport-heights by inspection (within the ≤10vh budget).
- `three.module` is 128 kB gz — inherent to Three.js; deferred so it doesn't affect LCP/TBT.

**Next**
- Phase 7: expose key copy/prices/FAQ as founder-editable core blocks in the Site Editor (convert the
  §§2–7 `core/html` bodies), document editing + the plan §12 placeholders for the founder in README.

---

## 2026-06-01 — Phase 5: SEO/AEO/GEO + schema + tracking + form ✅

**Done**
- `inc/seo.php` — `title-tag` support + curated front-page `<title>`, meta description, canonical,
  single `wp_robots` tag (index/follow/max-image-preview), Open Graph + Twitter cards. `og:image`
  degrades to a comment until `assets/static/og-image.png` exists.
- `inc/schema.php` — one JSON-LD `@graph` on the front page: Organization, WebSite,
  LocalBusiness+ProfessionalService (Chennai/TN, areaServed Chennai/Coimbatore/Madurai/Bangalore),
  WebPage, Service (Essential Web Presence, INR 35k–75k PriceSpecification), **FAQPage (6 Q&As mirroring
  the on-page FAQ — AEO)**, BreadcrumbList. **Verified: parses cleanly (7 nodes), ₹ renders correctly.**
- `inc/tracking.php` — GA4 / GTM / Meta Pixel snippets, **inert** until `BA_GA4_ID` / `BA_GTM_ID` /
  `BA_META_PIXEL_ID` are set (empty → nothing output). Clearly commented for the founder.
- Contact form in the Final CTA — Name / Phone-or-email / message, honeypot + `_subject`, posts to a
  **Formspree placeholder** (`formspree.io/f/your-form-id`). Glass styling; `<button>` now shares `.ba-btn-link`.
- Calendly (`#calendly-placeholder`) + WhatsApp (`wa.me` placeholder) links already in place.
- **Verified** server-side via `Invoke-WebRequest` (head tags + JSON-LD) — no browser/reduced-motion
  dependency — and via screenshot (form renders, page intact, no PHP errors).

**Notes / refine later**
- AEO/GEO: concise question-led FAQ + FAQPage schema + scannable section summaries are in place. Google's
  FAQ *rich result* is now limited to gov/health, but the markup still aids other engines/LLMs — keep it.
- Placeholders to fill (plan §12): Formspree endpoint, Calendly URL, real WhatsApp number (FAB + buttons +
  schema telephone), GA4/GTM/Pixel IDs, og-image.png + logo.png, street/postal in LocalBusiness, sameAs socials.
- If schema FAQ copy changes, update BOTH `inc/schema.php` and the FAQ in `templates/front-page.html`.

**Next**
- Phase 6: dequeue remaining WP bloat, confirm 3D is fully off the critical path, check scroll length vs the
  ≤10vh budget, run Lighthouse/CWV against §9 (LCP/TBT/contrast), tighten as needed.

---

## 2026-06-01 — Phase 4: Scroll choreography & 3D reactions ✅

**Done** — all in `src/scroll.js` (loaded ONLY on the desktop "full" tier):
- **Scroll-reveal**: staggered batch reveals for every card grid (problems, steps, tiers, works,
  metrics, boundary cols, FAQ items) + fade-up for section heads / prose / final CTA panel.
- **Metric count-ups**: numbers animate 0→target on first view, preserving prefix/suffix
  (`<2s`, `90-day`). Verified live — a forced-tier screenshot caught "85-day" mid-count.
- **Card tilt** ≤5° toward the cursor (desktop fine-pointer); locked "Coming Soon" tiers stay flat.
- **Nebula scroll reactions**: hero scroll disperses + fades the nebula; as the **final CTA** enters
  it re-gathers + glows (`onContactProgress` eases scroll 1→0.1). FAQ +→× icon already CSS-driven.
- `ScrollTrigger.refresh()` on init + on `load` so Lenis-virtualised positions stay correct.
- **Safety**: reveals are JS-only (no CSS `opacity:0`), and `scroll.js` only loads on the full tier
  → reduced-motion / mobile / no-WebGL paths render the page fully visible (verified via screenshot).

**Notes / refine later**
- Could not see the live motion through Studio's screenshot tool (it reports reduced-motion →
  tier `none` → no scroll module). Verified by **forcing `tier='full'`**: page renders, reveals engage,
  count-up animates, no crash. Real desktop visitors get the full choreography; user confirms live.
- Process "connectors" (plan §8) not added — the staggered numbered-step reveal carries the flow;
  optional polish for later.
- `scroll` chunk is ~50 kB gz (GSAP+ScrollTrigger+Lenis), deferred after first paint.

**Next**
- Phase 5: `inc/seo.php` (title/meta/OG/Twitter/canonical), `inc/schema.php` (JSON-LD: Organization,
  LocalBusiness, Service, FAQPage, WebSite, BreadcrumbList), `inc/tracking.php` (GA4/GTM/Meta Pixel
  placeholders), contact form (Formspree placeholder), Calendly/WhatsApp placeholder links. Mark all
  placeholders clearly (plan §12).

---

## 2026-06-01 — Design revision: hero 3D reworked per user feedback ✅

User feedback: *"remove that glob in the background and replace it with something
more visually appealing."* The Phase-2 noise-displaced metallic sphere read as a
lumpy blob.

**Done** — replaced it with the **Alchemy Nebula** (same controller interface, layout,
and scroll/cursor hooks, so nothing downstream changed):
- `src/three/glsl.js` — swapped the orb displacement chunks for **curl-noise** (divergence-free
  flow) built on the existing simplex-3D noise. Exports `NOISE_GLSL`.
- `src/three/scene.js` — rewrote as a `THREE.Points` cloud: ~5000 points (full) / ~1000 (lite)
  on a Fibonacci-sphere shell, flowed along the curl field (swirls like a slow galaxy), **additive
  blending + bloom** so dense regions glow, gold(top)→green(bottom) gradient = the transmutation.
  Scroll disperses + fades it; cursor parallax; dark gold/green backdrop baked into the scene so
  additive+bloom composite cleanly. Dropped the env map / PMREM / 3-point lights (not needed for points).
- **Verified (forced tier):** a luminous gold→green energy cloud, clearly more premium than the blob;
  hero copy stays legible over scrim + dark backdrop. Reduced-motion/mobile still fall back to the gradient.

---

## 2026-06-01 — Phase 3: Sections §§2–10 (content + layout) ✅

**Done** — all in `templates/front-page.html` (block markup) + `src/styles/main.css` (styling):
- **§2 Problem** — 3 glass cards (01/02/03 watermark): brochure-not-salesperson / months-&-lakhs / no-idea-if-it-makes-money.
- **§3 Process** — 4-step grid w/ numbered gold badges: Discovery Call → AI Build → Lead Tracking → Launch + Report.
- **§4 Services** — 3 tiers. **Essential Web Presence (₹35k–₹75k) ACTIVE** w/ gold border + "Book a Call"→#contact.
  **Lead Generation** ("Most Popular" + "Coming Soon" badges) and **Digital Growth Partner** ("Coming Soon") are
  **locked, dimmed, no CTA** — lock pill instead. (User scope change applied.)
- **§5 Boundary** — split: green "We build this in" (Technical/On-page SEO, AEO, GEO, Speed/CWV, Tracking) vs
  orange "We partner this out" (Off-page SEO, backlinks, guest posts, blogs, digital PR) + radical-honesty note.
- **§6 Concept Work** — **gallery of 3 placeholder cards** (Mfg/Logistics, Healthcare Diagnostics, Real Estate),
  each labelled "Concept Work — Your Brand Here"; "View Interactive Case Study" → **`#` placeholder**. (Scope change applied.)
- **§7 Proof** — 3 metric cards (gradient numbers, `data-count-to` for Phase-4 count-up): <2s / Day 1 / 90-day.
- **§8 About** — founder narrative (closer + AI). Copy is placeholder pending founder input (plan §12).
- **§9 FAQ** — native `<details>` accordion (accessible + crawlable; CSS +→× icon). Anchor Q "Do you guarantee
  Google rankings?" answered honestly. Good for FAQPage schema in Phase 5.
- **§10 Final CTA** — glowing panel "Stop Losing Leads to a Slow Website" + Book My Free Audit (#calendly-placeholder)
  + WhatsApp (`wa.me` placeholder). Section id="contact"; nav "Book a Call" + hero/audit CTAs point here.
- Header nav "Book a Call" repointed `#book`→`#contact`. Hero CTAs → #contact / wa.me placeholder.
- **Block validity:** ran `validate_blocks` — added `anchor` to each section group + removed stray HTML divider
  comments → all structural blocks valid (no Site-Editor "block recovery" risk).
- **Verified via screenshots:** desktop + mobile render all sections; cards/grids stack cleanly at ≤900/≤560px;
  AA contrast holds (glass cards + scrims over the dark canvas). Orb confirmed to coexist with sections (forced-tier
  check) — parks small/dim after the hero, lower sections stay clean.

**Notes / refine later**
- **Phase 7 (editability) TODO:** §§2–7 card/list/tier bodies are currently `core/html` blocks (Studio's
  `validate_blocks` flags these — it prefers editable core blocks). They render perfectly and are parser-valid,
  but the founder can't rich-text-edit them yet. Phase 7 will convert Problem/Process/Tiers/Boundary/Work/Metrics
  to `core/group + heading/paragraph/list/buttons` (keeping `html` only for the FAQ `<details>` accordion + lock SVG).
  Deferred deliberately: editability is Phase 7's job, and refactoring mid-content-phase risks layout drift.
- Scroll length is a touch generous (large section padding). Tighten in Phase 6 if it exceeds the ≤10vh budget.
- Metric count-up, FAQ-icon scroll-rotate, card stagger/tilt, per-section sphere morph → all Phase 4.

**Next**
- Phase 4: ScrollTrigger choreography off the existing Lenis plumbing — section reveals (fade/rise + stagger),
  card tilt ≤5° toward cursor (desktop), process-connector draw, metric count-ups, per-section sphere morph, and
  the sphere "stabilises + glows" at the Final CTA. All scrubbed/reversible; reduced-motion path stays static.

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
