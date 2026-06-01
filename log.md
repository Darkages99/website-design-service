# Brand-Alchemy — Build Log

> Running status. Newest entry on top. Pairs with `plan.md` (the map). Any agent: update this at
> every phase boundary and whenever something breaks or a decision changes.

**Current phase:** Phase 5 ✅ → starting Phase 6 (performance & accessibility hardening)
**Live site:** `http://localhost:8881` (Studio site `Brand-alchemy.info`)
**Theme runs from:** `C:\Users\SARANG RAJGOPAUL\Studio\brand-alchemyinfo\wp-content\themes\brand-alchemy\` (synced from `E:` via `sync.ps1`)

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
