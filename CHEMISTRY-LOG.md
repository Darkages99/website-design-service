# Brand-Alchemy → Chemistry Lab — Branch Log

> Running status for the `chemistry-lab` branch. Newest entry on top. Pairs with `CHEMISTRY-PLAN.md`
> (the map). Update at every phase boundary and whenever something breaks or a decision changes.
> **`main` is never touched.**

**Current phase:** Phase 0 ✅ → starting Phase 1 (content edits).
**Branch:** `chemistry-lab` (off `main`). **Live site:** `http://localhost:8881` (Studio `Brand-alchemy.info`).
**Deploy target (this branch):** Studio theme folder `brand-alchemy-chem` (separate from the original
`brand-alchemy`, which stays untouched — activate either to compare).

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
