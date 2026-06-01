# Brand-Alchemy → Chemistry Lab — Branch Log

> Running status for the `chemistry-lab` branch. Newest entry on top. Pairs with `CHEMISTRY-PLAN.md`
> (the map). Update at every phase boundary and whenever something breaks or a decision changes.
> **`main` is never touched.**

**Current phase:** Phase 8 ✅ — **de-glassed** all surfaces (solid panels); background concept TBD (user choosing).

## 2026-06-01 — Phase 8: remove glassmorphism (solid surfaces) ✅

User: "I really don't like the glass thing so remove that." Removed ALL frosted/translucent glass:
- `--glass-bg` → solid `#14161d`; dropped `--glass-blur`; `--glass-border` → plain hairline `rgba(255,255,255,0.08)`.
- Removed every `backdrop-filter: blur()` — `.ba-card`, `.ba-nav` (now solid `#0b0c12`), `.ba-final__inner`.
- Form fields → solid fills (`#181b24` / focus `#1d212c`). Verified: **no `backdrop-filter` in output**, no PHP errors,
  cards render as solid opaque panels (screenshot). Background still Liquid Gold for now (user is picking a new one).



## 2026-06-01 — Phase 7: background → Liquid Gold / Mercury Flow ✅

User feedback: the Catalytic Surface was **too mouse-sensitive** — moving the cursor triggered a
field-wide conversion "cascade" that felt disorienting. Asked to preserve it but switch `scene.js` to a
calmer "wow-factor" background (suggested the Meniscus or any other).

**Done**
- **Preserved** the Catalytic Surface verbatim at `src/three/scene-catalytic-surface.js` (not imported, so
  not bundled). **Restore it** by copying that file back over `src/three/scene.js` + `npm run build` + `./sync.ps1`.
  (The earlier molecular-bond-network background remains recoverable from git commit `9fd341c`.)
- **New `src/three/scene.js` = Liquid Gold / Mercury Flow:** a pool of molten metal anchored along the
  bottom of the viewport — viscous slow waves, drifting specular streaks, a glowing meniscus line, gold
  transmuting toward emerald/cyan. Built as ONE full-screen fragment shader (a 2-D height-field on a
  clip-space quad, ortho camera) — cheap, steady, and with **no per-pixel cursor cascade**. The cursor only
  leaves a single soft, heavily-eased dimple (lerp 0.05, hover-gated) that fills back in.
  - Kept the controller contract `{setScroll,setReaction,setHover,destroy}` → `main.js`/`scroll.js` unchanged.
    `setScroll` raises the liquid level + reflectivity (hero→page); `setReaction` (final CTA) shifts it
    green/cyan + glows. Bloom full-tier only (intensity 0.7). `buildBackdrop()` = near-black with a faint
    bottom floor-glow. Readability: liquid is bottom-anchored, upper screen stays dark → headline crisp.
- Why this concept: user wanted "wow"; their own brief calls Liquid Gold the "premium, heavy, expensive"
  option, and bottom-anchoring + a single gentle dimple directly fixes the cascade complaint.

**Verified**
- Forced-tier desktop screenshot: molten-gold pool with a glowing wavy meniscus along the bottom of the
  hero, headline crisp above it — clear wow, no clutter. Reverted the forced-tier hack + rebuilt/synced.
- HTTP 200, no PHP errors, content unchanged (this was a background-only swap — all Phase 6 content stands).
- `scene-catalytic-surface.js` present; `scene.js` forced-tier hack reverted.

**Notes**
- Liquid params (level 0.15 + scroll·0.20, wave amps, streak freq 22, bloom 0.7, dimple amp 0.020/ease 0.05)
  are first-pass — easy to tune. Live motion only on a real desktop browser (Studio screenshot = reduced-motion).
- Backgrounds now available to swap into `scene.js`: Liquid Gold (current), Catalytic Surface
  (`scene-catalytic-surface.js`), Molecular Bond Network (git `9fd341c`).

---

**Branch:** `chemistry-lab` (off `main`). **Live site:** `http://localhost:8881` (Studio `Brand-alchemy.info`).
**Active theme now:** `brand-alchemy-chem` (this branch). Revert to original look = activate `brand-alchemy`.
**Deploy target (this branch):** Studio theme folder `brand-alchemy-chem` (separate from the original
`brand-alchemy`, which stays untouched — activate either to compare).

---

## 2026-06-01 — Phase 6: background → Catalytic Surface + content/layout fixes ✅

User picked from 8 proposed concepts and asked me to choose + implement, plus several edits.

**Background — replaced the molecular bond network with THE CATALYTIC SURFACE** (`src/three/scene.js`):
- A low-contrast crystalline grid plane viewed at a downward angle fills the LOWER viewport (horizon
  mid-screen, upper area kept dark = headline-safe). Grid flows toward the camera (uTime + uScroll) so it
  reads as travelling along the surface.
- GPU particle lifecycle (one `THREE.Points`, `frustumCulled=false`, ~900 full / 320 lite): "reactant"
  gray particles drift across, FLASH at a conversion threshold, become "product" (gold↔green, → cyan with
  reaction) and rise + fade before reaching the headline zone (readability safeguard). No per-frame CPU loops.
- **Cursor = catalyst hotspot**: pointer→plane raycast feeds `uMouse`; nearby reactants convert early + flare.
- Kept the controller contract `{setScroll,setReaction,setHover,destroy}` — so `main.js`/`scroll.js`
  (reaction-progress scroll + bar) needed NO changes. `setScroll`→reaction rate + grid brightness;
  `setReaction` (final CTA)→product greener/cyan + glow. Bloom full-tier only. `buildBackdrop()` re-tinted
  (dark top, low glow). Chose vanilla Three.js (not R3F) to keep the bundle light — scene chunk ~3 kB gz.
  Why this concept: user's #1 rec; visualises reactant→product = visitor→lead; pairs with the reaction scroll.

**Content / layout fixes (front-page.html + theme-setup.php + schema.php + main.css):**
- **WhatsApp number → 9940140907** → `wa.me/919940140907` on the hero button, final-CTA button, and the
  floating FAB (`theme-setup.php`); also added `telephone +919940140907` to the LocalBusiness JSON-LD.
- **About → "we", two students:** heading "Built by students, powered by AI."; lead rewritten to
  "We're two Chennai-based students — me and a friend — …".
- **Removed pricing from the two Coming-Soon tiers** (Lead Generation, Digital Growth) — price groups deleted;
  name → features → lock only. Essential stays ₹4,999.
- **Hero subtext alignment:** it was a narrow `max-width:36ch` column hugging the left (looked "off to the
  side"); widened to `54ch` so it flows as the heading's own paragraph. Lowered the `#alchemy-bg` CSS
  fallback glow to sit with the surface.
- **FAQ "What does it cost?"** on-page answer still said ₹35,000–₹75,000 (Phase 1 had only updated the schema
  copy) — fixed to ₹4,999. (Same FAQ↔schema sync gotcha as the SEO answers; both now match.)

**Verified**
- Forced-tier desktop screenshot: catalytic surface renders (perspective grid + horizon + particles),
  headline crisp over the dark upper area, hero subtext now reads as a paragraph under the heading. Reverted
  the forced-tier hack + rebuilt/synced (deployed theme has correct capability gating).
- Rendered-output audit: **0 old-price leftovers** (35,000/75,000/1,50,000/3,00,000/15,000/mo all gone),
  ₹4,999 present, money-back heading present, `919940140907` ×4 (2 buttons + FAB + schema tel),
  "Built by students" + "me and a friend" present, **no PHP errors**, HTTP 200.
- `validate_blocks` **100/110** — same 10 pre-existing `core/html` advisories (card grids + form); the lower
  total is the 6 blocks removed with the two price groups. No new invalid blocks / no regression.
- Note: the earlier "stale deploy" scare was a false alarm — the `ba-tier__amount` string double-counts
  (block comment + element); the real "75,000" was the FAQ answer, now fixed.

**Open / notes**
- Catalytic surface params (grid contrast/scale, particle count/size, bloom 0.55, rise height) are first-pass
  — tune to taste. Live motion + cursor-catalyst only on a real desktop browser (Studio screenshot = reduced-motion).
- Coming-Soon tiers now show no price; revisit when those services + their pricing are ready.
- ₹4,999 intro price + removed off-page-SEO referral are intentional "for now" decisions (see Phase 1).

---

## 2026-06-01 — Phases 2–5: visual re-theme + build/verify ✅

**Done**
- **Palette (hybrid)** — `tokens.css` + `theme.json`: kept `--gold #ff9933` (catalyst/CTA), brightened
  `--green` → `#1fe08a` (reagent), added `--cyan #38e1ff` (glassware/bonds). Re-tinted `#alchemy-bg`
  CSS gradient + the Three.js backdrop + the metric-number gradient (now gold→cyan→green).
- **Readability (frosted-but-opaque)** — `tokens.css`: `--glass-bg` → `rgba(18,20,28,0.88)`, blur cut to
  `6px` (hint only), cyan-tinted borders, card drop-shadow. Added feathered scrims behind `.ba-sec-head`,
  `.ba-section--about`, and `.ba-boundary__note` so over-canvas text stays AA-legible regardless of the
  animation. Fixed the Problem-card **02 watermark/title overlap** (`padding-right` on the title).
- **Background (molecular bond network)** — rewrote `src/three/scene.js`: ~90 atoms (full) / 42 (lite) on
  a Fibonacci shell, CPU-drifted so `THREE.LineSegments` **bonds** track endpoints each frame; nearest-
  neighbour bonds (≤3/atom, radius 0.62). Additive + bloom (full only). Kept the exact controller plumbing
  (renderer/DPR/visibility/resize/destroy) and **added `setReaction(0..1)`** for the gold→green/cyan shift.
  Re-tinted `buildBackdrop()`. Dropped the unused curl-noise import (scene chunk 145→6.7 kB).
- **Scroll (reaction progress)** — `main.js` now drives `setReaction(p)` from the final-CTA enter progress
  (molecule re-gathers, tightens, shifts gold→green = "product forms"); hero scroll still disperses/fades.
  Added a thin top **reaction-progress bar** (gold→cyan→green fill) in `scroll.js` (+CSS), desktop-tier only.
  All existing reveals/stagger/tilt/count-ups preserved.
- **On-page FAQ fix** — the two FAQ answers that still named SEO "specialists/partners" were updated to the
  new "you arrange it yourself" wording (schema.php had already been done in Phase 1; this re-syncs the
  visible accordion — the FAQ↔schema rule).

**Verified**
- `npm run build` clean (main 14.7 kB CSS / scene 6.7 kB / scroll 50.6 kB gz). `sync.ps1` → `brand-alchemy-chem`.
- **Forced-tier desktop screenshot:** molecular bond network renders in the hero (atoms + bonds), hero copy
  legible over it, count-ups run (caught "83 days" mid-count). Reverted the forced-tier hack + rebuilt/synced.
- **Static fallback (reduced-motion, as Studio's screenshot browser runs):** desktop + mobile render cleanly;
  opaque cards readable; all content edits visible; mobile stacks correctly.
- Homepage HTTP 200, **no PHP errors**; JSON-LD carries `"price":4999`; "Most Popular" gone; no SEO-referral
  promise on-page or in schema; "Built by a student" present; money-back standards heading present.
- `validate_blocks` **106/116** — the 10 flagged are the same pre-existing `core/html` lint advisories as
  `main` (card grids + contact form), not parser errors. No regression (main was 105/115; +1 = added feature bullet).

**How to flip themes (for the user / future agent)**
- Chemistry look: `wp_cli "theme activate brand-alchemy-chem"` (currently active).
- Original look: `wp_cli "theme activate brand-alchemy"`. Both live in the same Studio site; `main` git branch
  and the original theme files are untouched.

**Open / notes**
- 3D molecule is desktop-tier only (fine pointer, no reduced-motion, WebGL) — phones get the lite molecule or
  the static gradient; Studio's screenshot browser always shows the static path (reduced-motion). Confirm the
  live motion + reaction-scroll in a real desktop browser.
- Bloom/atom sizes (`uSize 30`, bloom intensity 0.62) and bond radius are first-pass values — tune to taste.
- Inherited placeholders unchanged (WhatsApp/Calendly/Formspree/analytics/logo/domain — HANDOFF Part 2).
- ₹4,999 is an intro price ("for now"); off-page SEO referral intentionally removed until a trusted partner exists.

---

## 2026-06-01 — Phase 0: Branch & continuity ✅

**Done**
- Created git branch `chemistry-lab` off a clean `main` (main was: all 7 phases complete, feature-complete).
- Wrote `CHEMISTRY-PLAN.md` (approved design + the requested content edits + phased steps + isolation notes)
  and this log.
- Confirmed `functions.php` uses `get_theme_file_path()/_uri()` → deploying under a renamed Studio folder
  (`brand-alchemy-chem`) is asset-URL-safe.
- Researched the two reference pricing pages for the curated service feature list:
  - **thegreendigital.in** — static ₹5,999 (domain+hosting+SSL); basic ₹9,999 (7 pages, WhatsApp chat,
    CTA button, social integration, admin panel, 5 emails, SSL, 6-mo support).
  - **creatorswebindia.com/pricing/static** — basic static ₹14,999 (4–5 pages, 1 enquiry form,
    responsive, live chat, 5 business emails, FTP, phone/email/chat support).
  - Curated → 6 most-appealing bullets for our ₹4,999 Essential (see CHEMISTRY-PLAN §3a).

**Design decisions locked (via brainstorming Q&A with user):**
- Background = **molecular bond network**; Readability = **frosted-but-opaque** cards; Palette =
  **hybrid** (gold + brighter reagent-green `#1fe08a` + cyan `#38e1ff`); Scroll = **reaction progress**.

**Next**
- Phase 1: content edits in `templates/front-page.html` + `inc/schema.php` (see CHEMISTRY-PLAN §3):
  student About, remove SEO-referral promise (client handles off-page), remove "Most Popular", price
  ₹4,999 + curated features, fix Problem-02 watermark overlap, reword Concept-Work + Standards headings,
  90-days-help + edit-your-own-content standard.

**Not working / open**
- None yet. Build/sync/activate not run on this branch yet (Phase 0 is docs-only).
