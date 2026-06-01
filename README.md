# Brand-Alchemy — Portfolio Website

A 3D/interactive single-page portfolio for **Brand-Alchemy**, an AI-powered web-design agency for
Chennai/Tamil Nadu SMBs. Built as a custom **WordPress block theme** with a vanilla **Three.js** 3D layer,
**GSAP ScrollTrigger** + **Lenis** smooth scroll, bundled with **Vite**.

## Read these first
- **`plan.md`** — the full build plan, architecture, design system, section specs, phases. Source of truth.
- **`log.md`** — running status: what's done, what's in progress, what's broken.

## Where things live
- **Source / repo (edit here):** `E:\Website design service\`
  - Theme: `brand-alchemy/` · 3D & JS & CSS: `src/`
- **Runs in:** WordPress Studio site `Brand-alchemy.info` → `http://localhost:8881`
  (theme synced into `C:\Users\SARANG RAJGOPAUL\Studio\brand-alchemyinfo\wp-content\themes\brand-alchemy\`).
- The live runtime is sandboxed PHP-WASM and can't read `E:`, so we **sync** the theme to `C:` with `sync.ps1`.

## Dev workflow
```powershell
npm install          # one-time
npm run build        # vite → brand-alchemy/assets/dist/ (+ manifest)
./sync.ps1           # deploy theme into the Studio site
# activate once via the WordPress Studio MCP: wp_cli "theme activate brand-alchemy"
# preview http://localhost:8881
```
**Golden rule:** `npm run build` (if JS/CSS changed) → `./sync.ps1` → screenshot, before trusting the result.

## WordPress notes
- This is a **block theme** (Studio requires it). Use the **WordPress Studio MCP** tools for WP-CLI/screenshots,
  or prefix terminal commands with `studio wp`. Never edit WP core. SQLite backend.
