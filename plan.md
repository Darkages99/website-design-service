# Brand-Alchemy — Build Plan

> **Single source of truth for this build.** If you are an AI agent or developer picking
> this up cold, read sections 0–6 first, then jump to the phase in §11 that `log.md` says
> is in progress. `log.md` = running status. `plan.md` (this file) = the map.

---

## 0. Continuity — read this first

- **What we're building:** A high-performance, 3D/interactive single-page portfolio website for
  **Brand-Alchemy**, an AI-powered web-design agency targeting Chennai / Tamil Nadu SMBs.
- **Where the code lives (source of truth, version-controlled):** `E:\Website design service\`
  - Theme source → `E:\Website design service\brand-alchemy\`
  - 3D / JS / CSS source → `E:\Website design service\src\`
- **Where it RUNS (WordPress):** `C:\Users\SARANG RAJGOPAUL\Studio\brand-alchemyinfo\` (Studio site
  `Brand-alchemy.info`, `http://localhost:8881`). The theme is **synced** into
  `…\wp-content\themes\brand-alchemy\` by `sync.ps1` (we develop on E:, deploy to C:).
- **Why the split:** Studio runs WordPress on a sandboxed PHP-WASM runtime that can only read files
  inside the site folder on `C:`. `E:` is invisible to it, so junctions/symlinks won't work — we copy.
- **WP-CLI:** Use the **WordPress Studio MCP** tools (`mcp__wordpress-studio__wp_cli`, `take_screenshot`,
  `site_start`, etc.) — NOT a bare `wp` binary. If using a terminal, prefix with `studio wp`.

---

## 1. Project snapshot

| | |
|---|---|
| **Agency** | Brand-Alchemy |
| **Tagline** | "We Transmute Clicks into Customers." |
| **Positioning** | Lead-generation infrastructure for Chennai/TN SMBs — fast, AI-built, conversion-optimised. Not a generic web shop. |
| **Audience** | Owners/Directors of 5–50-employee SMBs (₹50L–₹10Cr rev) in Chennai, Coimbatore, Madurai, Bangalore. Manufacturing, Logistics, Healthcare, Real Estate, Education, Professional Services, Retail/F&B. |
| **Founder** | Chennai-based, sales/closing background, zero coding. Site must read as built by a world-class creative technologist. |
| **Language** | Indian business English. ₹ symbol. Address reader as "you". Zero jargon. Every section answers "how does this make me money?" |

---

## 2. Key decisions & rationale

1. **Platform: WordPress (custom block theme)** — *deviation from the original React+R3F+Vite spec.*
   - Why: founder can self-edit (zero-code), WordPress server-renders crawlable semantic HTML (solves the
     spec's own SEO worry natively), the portfolio is built on the very product we sell, and a WP site
     (`Brand-alchemy.info`) was already provisioned. Confirmed with the user.
2. **Block theme, not classic** — required by Studio's `STUDIO.md`. Block theme = `theme.json` + HTML
   block templates + patterns. Art direction is unaffected (it's all enqueued CSS/JS). Bonus: Site-Editor
   editability for the founder.
3. **3D via vanilla Three.js (not React Three Fiber)** — R3F in WP means shipping a compiled React bundle
   (heavier, fights the LCP budget). Vanilla Three.js + custom GLSL gives identical visuals, lighter payload.
4. **Build tooling: Vite** — bundles `src/` → `brand-alchemy/assets/dist/` with a manifest; `functions.php`
   reads the manifest and enqueues hashed files. Committed `dist/` so the theme is deployable without a build.
5. **Scroll: Lenis (lerp 0.1) + GSAP ScrollTrigger** — synced via `lenis.on('scroll', ScrollTrigger.update)`,
   `gsap.ticker.add(t => lenis.raf(t*1000))`, `gsap.ticker.lagSmoothing(0)`. GSAP is 100% free (incl. all
   plugins) since Apr 2025 — no license concern.
6. **Dev-on-E:, deploy-to-C: via robocopy** (`sync.ps1`) — keeps the repo + docs where the user wants them
   while the live site runs under Studio.
7. **Applied scope changes from the user:**
   - Only **Tier 1 (Essential Web Presence)** is active. **Tiers 2 & 3 → "Coming Soon"** (visible, locked, no price CTA).
   - **Sample builds = a gallery of placeholders.** All "View Case Study" links are `#` placeholders we build out later.
   - No fake clients/testimonials. Demos labelled **"Concept Work — Your Brand Here."**

---

## 3. Stack & versions

- **WordPress** (Studio, PHP 8.4, SQLite backend) — block theme.
- **Three.js** (`three`, latest stable) — vanilla, ES modules.
- **GSAP** (`gsap`, latest) — ScrollTrigger (+ SplitText for headline reveal). Free for commercial use.
- **Lenis** (`lenis` by darkroomengineering, latest) — smooth scroll.
- **Vite** (latest) — bundler, `manifest: true`.
- **postprocessing** — subtle bloom only (threshold 0.85, intensity ~0.3) via `EffectComposer`/`UnrealBloomPass` or the `postprocessing` lib. Keep minimal.
- No CSS framework — hand-written CSS with design tokens (`:root` custom properties). Keeps payload tiny.

---

## 4. Architecture

**Layered, fixed-canvas approach (per spec):**

```
z-index 0   <canvas id="alchemy-bg">      ← fixed, full-viewport, Three.js scene (background)
z-index 1   .site-content (WP block output) ← scrolls over the canvas, transparent bg, scrims behind text
z-index 50  fixed top nav + WhatsApp FAB
```

- **3D scene (`src/three/`):**
  - `AlchemySphere` — metallic "liquid/transmutation" form. Sphere/icosahedron with custom GLSL vertex
    displacement (noise-driven morph) + metallic PBR via environment map. Reacts to cursor (subtle
    parallax/refraction) and scroll (morph state per section). Returns "stable & glowing" at final CTA.
  - `ParticleField` — instanced points, ≤5000 desktop / ≤1000 mobile, GPU-driven (no per-frame CPU loops).
  - Lighting: 3-point studio rig + environment map. Bake/static where possible.
  - Post: subtle bloom + ACES tone mapping. Never bloom text into illegibility (text is HTML, above canvas — safe).
- **Scroll (`src/scroll/`):** Lenis instance, ScrollTrigger timelines per section (scrubbed + reversible),
  total page ≤ 10 viewport-heights. ScrollTrigger drives `sphere.morphTarget`, particle behaviour, section reveals.
- **Content (WP block theme):** `front-page.html` lays out sections as `group`/`cover` blocks with anchor IDs
  + custom classNames; editable copy uses core heading/paragraph/buttons blocks (founder-editable in Site Editor);
  visual styling comes from enqueued theme CSS targeting those classNames.
- **SEO layer:** native WP semantic HTML + hand-rolled `<head>` meta/OG + JSON-LD (Organization, LocalBusiness,
  Service, FAQPage, BreadcrumbList) in `inc/schema.php`. WP core sitemap + clean permalinks.
- **Graceful degradation:** `prefers-reduced-motion` → no Lenis, no auto-rotate, static frame. Mobile → reduced
  particles + simplified shader. WebGL fail → CSS fallback (static gradient + CSS-transform sphere).

---

## 5. Repository & file structure

```
E:\Website design service\                  ← git root (source of truth)
├── plan.md  log.md  README.md  .gitignore
├── sync.ps1                                 ← robocopy brand-alchemy/ → Studio themes dir
├── package.json  vite.config.js
├── src/                                     ← Vite entry (compiled into the theme)
│   ├── main.js
│   ├── three/   { scene.js, alchemySphere.js, particles.js, lighting.js, shaders/*.glsl }
│   ├── scroll/  { lenis.js, timelines.js }
│   ├── ui/      { cursor.js, cardTilt.js, accordion.js, caseStudyModal.js, reducedMotion.js }
│   └── styles/  { main.css, tokens.css }
└── brand-alchemy/                           ← THE BLOCK THEME (deployable; synced to Studio)
    ├── style.css            (theme header)
    ├── theme.json           (design tokens, layout, disable bloat)
    ├── functions.php        (loads inc/*)
    ├── index.php            (classic fallback — minimal)
    ├── templates/   { index.html, front-page.html, 404.html }
    ├── parts/       { header.html, footer.html }
    ├── patterns/    { hero.php, problem.php, process.php, services.php, boundary.php,
    │                  portfolio.php, proof.php, about.php, faq.php, final-cta.php }
    ├── inc/         { enqueue.php (vite manifest reader), seo.php, schema.php, tracking.php,
    │                  theme-setup.php, dequeue-bloat.php }
    └── assets/      { dist/ (Vite output, committed), static/ (favicons, og-image, env map) }
```

`node_modules/` lives at the repo root (gitignored) — **never** inside `brand-alchemy/`, so the sync never copies it.

---

## 6. Local dev workflow

```powershell
# one-time
npm install

# build the 3D/JS/CSS bundle into the theme
npm run build            # vite build → brand-alchemy/assets/dist/ (+ manifest.json)

# deploy theme into the Studio site (mirror, excludes node_modules)
./sync.ps1

# (first run) activate the theme via MCP: mcp__wordpress-studio__wp_cli "theme activate brand-alchemy"
# preview: http://localhost:8881   |  screenshot via mcp__wordpress-studio__take_screenshot
```

**Golden rule:** after ANY change, `npm run build` (if JS/CSS changed) → `./sync.ps1` → screenshot, before
claiming anything works. For PHP/template-only changes, `./sync.ps1` alone is enough.

---

## 7. Design system

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0a0a0f` | near-black background (3D pops) |
| `--text` | `#f0f0f5` | primary text (contrast ✓ on `--bg`) |
| `--text-muted` | `#a0a0b0` | secondary/descriptions |
| `--accent-gold` | `#ff9933` | saffron CTA accent (sparingly) |
| `--accent-green` | `#00d26a` | emerald accent / "we do" checks |
| `--glass-bg` | `rgba(255,255,255,0.05)` | glassmorphism card fill |
| `--glass-border` | `rgba(255,255,255,0.1)` | 1px card border |
| `--scrim` | `rgba(10,10,15,0.75)` | mandatory behind text over 3D |
| blur | `backdrop-filter: blur(10px)` | glass cards |

- **Contrast: WCAG AA (≥4.5:1) on ALL text**, including over the 3D scene → use scrims. Accent colour is
  never the *sole* carrier of meaning (pair with icon/label).
- **Cards tilt ≤5°** toward cursor (desktop); stack cleanly on mobile.
- Type: a strong display face for headlines + clean sans for body (self-hosted/`fonts/` for speed; no render-blocking).

---

## 8. Site map & section specs (≤10 viewport-heights total)

> Single page, smooth-scroll. Fixed top nav (clear labels, no desktop hamburger). Fixed WhatsApp FAB.

1. **Hero (~1.5vh)** — H1 "We Transmute Clicks into Customers." Sub: "AI-powered web design for Chennai SMBs.
   Built in days. Tracked for leads. Proven with ROI." CTA "Get Your Free Website Audit" (primary) + WhatsApp
   (secondary). 3D: Alchemy Sphere center-right, slow rotate, cursor-reactive; morphs as you scroll to §2.
2. **The Problem (~1.5vh)** — 3 pain points w/ 3D icons assembling on scroll: brochure-not-sales-tool /
   months-and-lakhs-for-slow-agencies / no-idea-if-site-makes-money.
3. **Solution / Process (~1.5vh)** — 4 steps (2×2 grid or horizontal, NOT a long vertical scroll):
   Discovery Call → AI Build → Lead Tracking → Launch + Report. 3D connectors animate in.
4. **Services (~2vh)** — 3 glassmorphism cards rising w/ stagger 0.2s. **Tier 1 active**, **Tiers 2 & 3 "Coming Soon"**:
   - **Essential Web Presence — ₹35,000–₹75,000** *(ACTIVE, CTA "Book a Call")*: 5-page responsive site,
     technical SEO foundation, Google Business Profile, WhatsApp click-to-chat, basic contact form. Delivery 3–5 days.
   - **Lead Generation Website — ₹75,000–₹1,50,000** *[badge "Most Popular"] — **COMING SOON** (locked, no CTA)*:
     Essential + AI chatbot, call tracking, structured data for local SEO, 1 landing page, CRM + monthly lead report. Delivery 5–7 days.
   - **Digital Growth Partner — ₹1,50,000–₹3,00,000 + ₹15,000/mo** *— **COMING SOON** (locked)*:
     Lead Gen + multi-service landing pages, analytics dashboard, A/B testing, email nurture, quarterly reviews.
5. **What You Get vs. Don't (~1vh)** — split screen. Left (green ✓ + label): Technical SEO, On-Page SEO,
   **On-page AEO**, **On-page GEO**, Speed, Tracking. Right (orange → + "We Partner Out"): Off-page SEO,
   Backlinks, Guest posts, Ongoing blogs, Digital PR. 3D translucent wall divides the columns.
   Honest framing: *"We make you search-ready. For aggressive ranking campaigns we partner you with vetted SEO specialists."*
6. **Portfolio / Spec Demos (~1.5vh)** — **gallery of 3 placeholder cards** ("Concept Work — Your Brand Here"),
   each a hover-rotating 3D preview + "View Interactive Case Study" → **`#` placeholder** (built out later).
   Themes: (1) Chennai Manufacturing/Logistics, (2) Multi-location Healthcare Diagnostics, (3) Real Estate Developer.
   Use pre-rendered video/poster loops for thumbnails, not live WebGL instances (perf).
7. **Proof & Promise (~1vh)** — no fake testimonials. Metric cards count up on scroll: "Sites load in <2 seconds",
   "Lead tracking live before launch", "90-Day Launch Guarantee".
8. **About / Why Brand-Alchemy (~1vh)** — founder narrative, Chennai-rooted, sales-first:
   "I handle strategy and closing. My AI stack handles the build." Optional founder photo / abstract avatar.
9. **FAQ (~1vh)** — accordion, 3D icon rotates 90° on open. Anchor Q: "Do you guarantee Google rankings?" →
   "No. We guarantee a technically perfect, search-ready site. Rankings need ongoing off-page work, which we refer to trusted partners."
10. **Final CTA (~1vh)** — H "Stop Losing Leads to a Slow Website." Sub: "Book a free 15-minute audit…"
    Buttons: "Book My Free Audit" (Calendly placeholder) + WhatsApp `wa.me` (pre-filled message). Alchemy Sphere
    returns, stable + glowing.

**SEO boundary copy is load-bearing** (radical honesty): we DO technical + on-page SEO + on-page AEO + GEO; we DO
NOT do off-page (backlinks, guest posts, ongoing blogs, digital PR) — we refer those out.

---

## 9. Performance & accessibility budgets (non-negotiable)

- **LCP** < 1.8s desktop / < 2.5s 4G mobile. (LCP element = hero H1 HTML text — renders instantly; 3D inits after first paint.)
- **TBT** < 200ms. 3D bundle lazy-loaded + initialised on idle/after paint.
- **Scroll length** ≤ 10 viewport-heights. No infinite scroll.
- **Contrast** WCAG AA on every text element; scrims behind text over 3D.
- **CTAs reachable within 3s of landing**; nav always visible; no hidden/easter-egg navigation.
- **`prefers-reduced-motion`** respected (no Lenis, no auto-rotation, static frames).
- 3D budget: ≤5000 particles desktop / ≤1000 mobile; no CPU loops in render; Draco for any GLTF (sphere is procedural → none needed); compressed textures/env map (KTX2/basis if used).
- Dequeue WP bloat: emoji scripts, block-library default CSS we don't use, oEmbed, jQuery if unused. Inline critical CSS. Defer non-critical JS.

---

## 10. SEO / AEO / GEO plan

- **Technical:** clean permalinks, XML sitemap (WP core), robots, canonical, fast Core Web Vitals (covered by §9), mobile-first.
- **On-page:** real `<h1>`–`<h6>` hierarchy, descriptive `<title>`/meta description, image `alt`, internal anchors, OG/Twitter cards.
- **Schema (JSON-LD, `inc/schema.php`):** `Organization` + `LocalBusiness` (Chennai address/area served), `Service`
  (the tiers), `FAQPage` (from §9 FAQ), `BreadcrumbList`, `WebSite`.
- **AEO/GEO:** concise question-led answers, FAQ schema, clear entity/authority signals, scannable summaries for AI engines.
- Consult skills when implementing: `seo`, `seo-aeo-best-practices`, `schema-markup`, `geo-content-optimizer`.

---

## 11. Phased build roadmap (step-by-step)

> Each phase ends with an explicit **acceptance check**. Update `log.md` at each phase boundary.

- **Phase 0 — Foundations** ✅/⏳ (see log)
  - git init + .gitignore + first commit. Write plan.md, log.md, README.md. Write `sync.ps1`.
  - **Accept:** repo initialised, docs committed.
- **Phase 1 — Theme skeleton + toolchain**
  - `package.json` (three, gsap, lenis, vite, postprocessing). `vite.config.js` (manifest, lib of entries).
  - Block theme bones: `style.css` header, `theme.json` (tokens, disable bloat), `functions.php` + `inc/*`
    (enqueue w/ manifest reader, theme-setup, dequeue-bloat), `templates/index.html`, `parts/header|footer`.
  - `sync.ps1`; activate theme via MCP `wp_cli`; confirm site renders the theme shell.
  - **Accept:** screenshot shows a dark-themed empty shell at localhost:8881; no PHP errors in debug.log.
- **Phase 2 — Hero visual spike (de-risk the aesthetic)**
  - Fixed `<canvas>` + Three.js scene: Alchemy Sphere (metallic + GLSL morph) + lighting + env map + subtle bloom.
  - Hero block content (H1/sub/CTAs) over a scrim; fixed nav + WhatsApp FAB. Lenis + ScrollTrigger wired.
  - **Accept:** screenshot of hero meets the aesthetic bar (this is the user's go/no-go on WordPress). LCP sanity-check.
- **Phase 3 — Remaining sections (content + layout)**
  - Build §§2–10 as block patterns + CSS. Apply scope changes (Tiers 2/3 Coming Soon; portfolio placeholders).
  - **Accept:** full page scrolls top→bottom ≤10vh, all copy in place, AA contrast holds, mobile stacks cleanly.
- **Phase 4 — Scroll choreography & 3D reactions**
  - ScrollTrigger timelines: sphere morph per section, particle behaviour, icon assembly, card stagger,
    process connectors, count-ups, FAQ icon rotate, sphere "stabilises" at final CTA. All scrubbed/reversible.
  - **Accept:** smooth scrubbed animations; reduced-motion path verified; no jank (60fps target desktop).
- **Phase 5 — SEO/AEO/GEO + schema + tracking + forms**
  - `inc/seo.php` meta/OG; `inc/schema.php` JSON-LD; `inc/tracking.php` GA4/GTM/Meta Pixel placeholders;
    contact form (Formspree placeholder) + WhatsApp/Calendly placeholder links.
  - **Accept:** schema validates; head tags correct; placeholders clearly marked for later fill.
- **Phase 6 — Performance & accessibility hardening**
  - Dequeue bloat, lazy-load 3D, inline critical CSS, compress assets, mobile particle reduction, WebGL fallback.
  - Run skills: `web-design-guidelines`, `seo-audit`. Lighthouse/CWV pass against §9 budgets.
  - **Accept:** budgets in §9 met (or documented gaps in log.md).
- **Phase 7 — Content editability + handoff**
  - Expose key copy/prices/FAQ as editable blocks/patterns in the Site Editor; document for the founder in README.
  - **Accept:** founder can edit hero copy + prices + FAQ without code; documented.

---

## 12. Open items / placeholders to fill (collect from founder)

- [ ] **Calendly URL** (audit booking) — currently `#calendly-placeholder`.
- [ ] **WhatsApp number** for `wa.me/<number>` + pre-filled message — currently placeholder.
- [ ] **Formspree (or Google-Sheets/Zapier) endpoint** for contact form — currently placeholder.
- [ ] **GA4 ID, GTM container ID, Meta Pixel ID** — placeholders in `inc/tracking.php`.
- [ ] **Founder name, photo/avatar, About copy** — placeholder copy in §8 About.
- [ ] **Real domain** (is `brand-alchemy.info` the live domain?) — affects canonical/OG URLs.
- [ ] **Logo / brand mark / favicon** — placeholder wordmark for now.
- [ ] Sample-build case studies (3) — built out separately later; links are `#` placeholders.

## 13. Risks & watch-items

- **WordPress LCP discipline** — must keep 3D off the critical path. Mitigate: HTML hero is LCP element, 3D defers.
- **Block-theme vs bespoke layout friction** — mitigate by using simple core blocks + custom classNames + enqueued CSS.
- **WASM sandbox** — theme must run from C: Studio dir; always `sync.ps1` before screenshotting.
- **Robocopy staleness footgun** — never screenshot without syncing first.
