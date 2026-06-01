# Brand-Alchemy → Chemistry Lab — Branch Log

> Running status for the `chemistry-lab` branch. Newest entry on top. Pairs with `CHEMISTRY-PLAN.md`
> (the map). Update at every phase boundary and whenever something breaks or a decision changes.
> **`main` is never touched.**

**Current phase:** Phases 0–5 ✅ — **chemistry-lab re-theme is feature-complete and verified.**
**Branch:** `chemistry-lab` (off `main`). **Live site:** `http://localhost:8881` (Studio `Brand-alchemy.info`).
**Active theme now:** `brand-alchemy-chem` (this branch). Revert to original look = activate `brand-alchemy`.
**Deploy target (this branch):** Studio theme folder `brand-alchemy-chem` (separate from the original
`brand-alchemy`, which stays untouched — activate either to compare).

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
