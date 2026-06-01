# Brand-Alchemy → Chemistry Lab — Branch Plan

> **Continuity doc for the `chemistry-lab` git branch.** If an agent or dev picks this up cold
> (e.g. credits ran out mid-build): read this file top to bottom, then check `CHEMISTRY-LOG.md`
> for what's done / in progress. The original build map is `plan.md`; the original status is `log.md`.
> **`main` must stay untouched** — all work happens on the `chemistry-lab` branch.

---

## 0. What this branch is

An **experiment**: re-skin the finished Brand-Alchemy portfolio site with a **chemistry-lab**
interpretation of its existing alchemy theme, while **fixing the glassmorphism readability problem**
(text over the animated background was sometimes low-contrast). User's words: *"Prioritise
functionality over aesthetic."*

**Scope is deliberately tight — change three things, keep everything else identical:**
1. **Background** — swap the gold→green particle *nebula* for a **molecular bond network** (atoms + bonds).
2. **Scroll** — re-cast the hero→CTA motion as a **chemical reaction progressing** (reactants → product).
3. **Readability** — replace translucent glass cards with **frosted-but-opaque** panels; quiet the
   background behind the content column.
Plus a **hybrid palette** nudge (keep gold, brighten green, add cyan) and the **content edits** in §3.

All section structure, layout, copy (except the §3 edits), SEO/schema/tracking, forms, and the brand
name "Brand-Alchemy" stay **byte-for-byte the same**.

---

## 1. Isolation — how `main` and the live site stay safe

- **Git:** all commits land on `chemistry-lab`. Never commit to `main`. To compare, `git checkout main`.
- **Studio deploy:** the branch `sync.ps1` deploys to a **separate theme folder** in Studio:
  `…\Studio\brand-alchemyinfo\wp-content\themes\**brand-alchemy-chem**\`
  (Theme Name *"Brand-Alchemy — Chemistry Lab"* via `brand-alchemy/style.css` on this branch).
  The original `brand-alchemy` theme stays installed and is untouched → flip between the two by
  activating either theme at `http://localhost:8881/wp-admin → Appearance → Themes`.
  `functions.php` uses `get_theme_file_path()/_uri()`, so the renamed folder resolves all asset URLs
  correctly — no code change needed for the rename.
- **Revert the live site to the original look:** activate the `brand-alchemy` theme (MCP
  `wp_cli "theme activate brand-alchemy"`).

---

## 2. Dev workflow (same as main, different deploy target)

```powershell
npm run build                 # vite → brand-alchemy/assets/dist/ (if JS/CSS changed)
./sync.ps1                    # robocopy brand-alchemy/ → Studio …/themes/brand-alchemy-chem/
# first run: mcp wp_cli "theme activate brand-alchemy-chem"
# preview http://localhost:8881  · screenshot via mcp take_screenshot
```
**Golden rule:** `npm run build` (if JS/CSS changed) → `./sync.ps1` → screenshot before trusting it.
PHP/template-only change → `./sync.ps1` alone.

---

## 3. Content edits (requested with the "go") — apply in `templates/front-page.html` (+ mirror in `inc/schema.php`)

1. **About (§8)** — remove the "salesperson / closer / years in sales" framing. The founder is a
   **student**, not a salesperson. Reframe: student who pairs an AI build stack with hands-on care;
   honest, lean, no big-agency overhead. Heading "Built by a closer, powered by AI." → reworded
   (no "closer"). Keep it humble + credible.
2. **SEO referral promise — remove it.** We no longer claim to refer off-page SEO to "vetted/trusted
   partners" (we don't have one we trust yet). Tell the client **they handle off-page SEO themselves
   for now**. Touch points:
   - §5 Boundary: right column header + the radical-honesty note.
   - §9 FAQ: "Do you guarantee Google rankings?" and "Do you handle ongoing SEO and backlinks?" answers.
   - `inc/schema.php` FAQPage answers (mirror the on-page FAQ).
3. **Services (§4):** 
   - **Remove the "Most Popular" badge** on the Lead Generation tier (keep "Coming Soon").
   - **Price the base service at ₹4,999** (was ₹35,000–₹75,000). Mirror in FAQ "What does it cost?"
     and `inc/schema.php` PriceSpecification (INR 4999).
   - **Curated feature list** (see §3a) — pulled from the two reference pricing pages, most-appealing only.
4. **Problem (§2):** card **02 "Months of waiting, lakhs spent"** — its title collides with the big
   "02" watermark numeral. Fix the layout so the title never overlaps the number (give the title
   right-padding / reflow the numeral). Content of the card stays.
5. **Concept Work (§6):** heading **"Concept builds. Your brand here next."** doesn't land — reword to
   something that clearly says *"these are sample builds; yours could be the real one."*
   Chosen: **"See what we'd build for a business like yours."** (intro line already clarifies they're concepts).
6. **Proof / Standards (§7):**
   - Heading must itself convey the **money-back guarantee**: chosen **"We hit these standards — or your money back."**
   - Third metric: change to **"90 days of help"** (post-launch support) **+ the ability to edit their
     own site content** (WordPress CMS). (Was "90-day launch guarantee".)

### 3a. Essential Web Presence — curated features (₹4,999, "for now"/intro price)
Sourced from thegreendigital.in (free domain+hosting+SSL, business email) + creatorswebindia.com
(static pages, enquiry form) + our existing conversion features. **6 bullets, most-appealing only:**
1. Free domain, hosting & SSL — 1 year
2. 5-page responsive, mobile-friendly website
3. WhatsApp chat + click-to-call buttons
4. Enquiry form with lead tracking
5. Google Business Profile + on-page SEO setup
6. 5 business email IDs

> Note: aggressive inclusions at ₹4,999 — intentional intro pricing per user ("for now"). Domain/hosting
> renew annually after year 1 (kept implicit; not over-promised as "free forever").

---

## 4. Visual re-theme — files & approach

- **`src/styles/tokens.css`** — hybrid palette: `--bg #0a0a0f` (keep), `--gold #ff9933` (keep, CTA/catalyst),
  `--green #1fe08a` (brighter "reagent"), **add `--cyan #38e1ff`** (glassware/bonds). Replace glass tokens:
  `--glass-bg` → near-opaque panel (~`rgba(18,20,28,0.86)`), stronger `--glass-border`; keep a *hint* of blur.
  Add a `--panel-scrim` for the content-band dimmer.
- **`brand-alchemy/theme.json`** — mirror the palette (rename Emerald→Reagent green value, add Cyan slug).
- **`src/styles/main.css`** — (a) cards: opaque panel fill, reduced blur, AA-safe text; (b) a darker
  scrim band behind `.ba-main` content sections so contrast never depends on the animation;
  (c) re-tint `#alchemy-bg` CSS fallback gradient + accents to the hybrid palette; (d) bonds/atom accents
  where decorative (e.g. metric/number gradients gold→cyan→green).
- **`src/three/scene.js`** — replace the Points *nebula* with a **molecular bond network**: keep the
  WebGLRenderer/tier/DPR/bloom/visibility/destroy plumbing and the `{setScroll,setHover,destroy}`
  controller interface **unchanged** (so `main.js`/`scroll.js` need no rewiring). Atoms = points drifting
  on the existing curl-noise field; **bonds = `THREE.LineSegments`** between near neighbours (precomputed
  pairs; opacity by live distance). Colour atoms gold↔green by height, bonds faint cyan. Lite tier: fewer
  atoms, skip/trim bonds. `buildBackdrop()` re-tinted to the hybrid palette.
- **`src/three/glsl.js`** — reuse the curl-noise as-is (no change expected).
- **`src/scroll.js`** — keep all reveal/stagger/tilt/count-up behaviour. Re-map the nebula hooks to the
  reaction narrative via `setScroll`/`setHover` (already drives bond formation + colour shift in the
  shader). Optional thin scroll-progress "reaction" line — keep minimal or drop.

**Controller contract (must not break):** `mountScene(canvas,{tier})` returns
`{ setScroll(0..1), setHover(0..1), destroy() }`. `main.js` calls `setScroll` from hero+contact progress.

---

## 5. Phased steps (update CHEMISTRY-LOG.md at each boundary)

- **Phase 0 — Branch & continuity** — create `chemistry-lab`, write this + `CHEMISTRY-LOG.md`,
  retarget `sync.ps1` to `brand-alchemy-chem`, set Theme Name. Commit. **Accept:** branch + docs committed.
- **Phase 1 — Content edits** (§3) — front-page.html + schema.php. **Accept:** copy reads correctly,
  price ₹4,999 everywhere, no SEO-referral promise, no "Most Popular", student About, reworded headings,
  schema mirrors FAQ + price; `validate_blocks` no worse than main.
- **Phase 2 — Palette + readability** — tokens.css, theme.json, main.css. Build → sync → screenshot.
  **Accept:** cards opaque + AA-legible over the animation; palette shifted; nothing else moved.
- **Phase 3 — Molecular background** — scene.js (+glsl if needed). **Accept:** atoms+bonds render
  (forced-tier screenshot), controller interface intact, lite/reduced-motion fallbacks OK.
- **Phase 4 — Reaction scroll** — scroll.js / main.js hook mapping. **Accept:** scrolling forms bonds +
  shifts colour; final CTA "stabilises + glows"; reveals/count-ups still work; reduced-motion static.
- **Phase 5 — Verify & log** — AA contrast spot-check, mobile/reduced-motion fallback, no PHP notices,
  record results + screenshots in CHEMISTRY-LOG.md. Tell user how to flip themes.

---

## 6. Open items / inherited placeholders

- Inherited from `main` (still placeholders): WhatsApp number, Calendly URL, Formspree endpoint,
  GA4/GTM/Pixel IDs, founder photo, logo/og-image, real domain, address. See `HANDOFF.md` Part 2.
- This branch adds: **₹4,999 is an intro price ("for now")** — revisit. **Off-page SEO referral** is
  intentionally removed until a trusted partner exists — revisit when one is found.
- **FAQ ↔ schema sync rule still applies:** edit copy in BOTH `templates/front-page.html` and `inc/schema.php`.
