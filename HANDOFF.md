# Brand-Alchemy — Founder Handoff Guide

Plain-English guide to running and editing your site. No coding needed for the
everyday edits in Part 1. Part 2 is the "fill these in before launch" checklist.
Part 3 is for a developer.

- **Live (local) preview:** http://localhost:8881 (while WordPress Studio is running)
- **Log in to edit:** http://localhost:8881/wp-admin  (user `admin`)
- The animated background only shows on desktop browsers with motion enabled — phones,
  and anyone who turns on "reduce motion", see a clean static version instead. That's intentional.

---

## Part 1 — Editing your content (no code)

Open **Appearance → Editor → Pages → Front Page** (or **Templates → Front Page**) in
wp-admin. Click any text to edit it, just like a document. Click **Save** (top right) when done.

**Easily editable (plain text — click and type):**
- The headline and sub-text in the **hero** (top of the page)
- Every **section title** and intro line (Problem, Process, Services, etc.)
- The **Services prices, plan names, and feature lists** — click a price like “₹35,000–₹75,000” and type a new one
- The **FAQ** — click any question or answer to edit it. To add a new one, add a **“Details” block**
  and type the question in the header and the answer inside.
- The **About** paragraphs and the **final call-to-action** heading/sub-text

**Editable but shows raw code (ask a developer if unsure):**
- The Problem / Process / Concept-Work / Proof / “What we do vs don’t” cards are **“Custom HTML” blocks**.
  You *can* change the words inside, but you’ll see HTML tags around them — change only the text between the tags.

> **Important — FAQ & Google:** the FAQ also feeds Google’s structured data from a separate file
> (`brand-alchemy/inc/schema.php`). If you change FAQ wording, have a developer update that file too,
> so search engines stay in sync. (See Part 3.)

---

## Part 2 — Fill these in before you go live

Everything below is a **placeholder** right now. Give these to your developer (or follow the file
hints) to switch the site from "demo" to "live". Locations are inside `brand-alchemy/`.

| # | What to provide | Where it’s used |
|---|---|---|
| 1 | **WhatsApp number** (e.g. 91XXXXXXXXXX) | `inc/theme-setup.php` (floating button) · the hero & final-CTA “Talk on WhatsApp” buttons in the Front Page · `inc/schema.php` (telephone) |
| 2 | **Calendly link** (your booking page) | Front Page → final CTA → “Book My Free Audit” button (currently `#calendly-placeholder`) |
| 3 | **Form endpoint** (free [Formspree](https://formspree.io) form ID) | Front Page → final CTA → contact form `action` (currently `formspree.io/f/your-form-id`) |
| 4 | **Google Analytics 4 ID** (`G-…`) | `inc/tracking.php` → `BA_GA4_ID` |
| 5 | **Google Tag Manager ID** (`GTM-…`), optional | `inc/tracking.php` → `BA_GTM_ID` |
| 6 | **Meta (Facebook) Pixel ID**, optional | `inc/tracking.php` → `BA_META_PIXEL_ID` |
| 7 | **Logo + favicon** | `assets/static/logo.png`; set Site Icon in **Settings → General / Editor** |
| 8 | **Social share image** (1200×630) | `assets/static/og-image.png` (then it’s auto-used for link previews) |
| 9 | **Business address & phone** | `inc/schema.php` (LocalBusiness) — improves local SEO |
| 10 | **Your About story + photo** | Front Page → About section (editable text) |
| 11 | **Real domain** | Set the WordPress Site Address; titles/canonical/share links follow automatically |

Until the WhatsApp number (1) and form (3) are real, those buttons won’t deliver messages.

---

## Part 3 — For a developer

- **Source of truth:** `E:\Website design service\` (this repo). Read `plan.md` (the map) and `log.md`
  (build history) first.
- **The site runs from** `C:\Users\…\Studio\brand-alchemyinfo\wp-content\themes\brand-alchemy\` — Studio’s
  PHP-WASM sandbox can’t see `E:`, so we **develop on E: and deploy to C:** with `sync.ps1`.
- **Build & deploy:**
  ```powershell
  npm install            # once
  npm run build          # bundles src/ → brand-alchemy/assets/dist/ (+ manifest)
  ./sync.ps1             # robocopy theme → Studio
  ```
  After JS/CSS changes: `npm run build` → `./sync.ps1`. After PHP/template-only changes: `./sync.ps1` alone.
- **Theme shape:** custom block theme. Layout/copy in `templates/front-page.html` (block markup);
  visual design in the Vite-built CSS (`src/styles/`); 3D in `src/three/` (vanilla Three.js, deferred);
  scroll/animation in `src/scroll.js` (GSAP + Lenis, desktop only).
- **SEO/schema/tracking:** `inc/seo.php`, `inc/schema.php`, `inc/tracking.php`. **If FAQ copy changes in the
  Front Page, mirror it in the `$faqs` array in `inc/schema.php`** (keeps FAQPage JSON-LD accurate).
- **Performance:** critical CSS is inlined; Three.js/GSAP load after first paint; bloom (postprocessing)
  loads only on desktop. Run PageSpeed Insights on the deployed URL and record results in `log.md`.
- **Still on the `html`-block list (optional future polish):** the Problem/Process/Concept-Work/Proof/
  Boundary card grids are `core/html`; convert to `core/group`+`heading`/`paragraph`/`list` for full
  Site-Editor editability when convenient (see `log.md` Phase 3/7 notes).
