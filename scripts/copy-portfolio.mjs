// Postbuild: assemble a complete, deployable static site in dist/.
//
// `vite build` only emits the main Brand-Alchemy site. The homepage links to two
// portfolio sites, so we copy their deployable form into dist/portfolio/ here —
// giving one self-contained folder that any static host can serve, with no
// WordPress and no dev server in the loop.
//
//   • mac-studio-fitness   — a plain static HTML site (relative asset paths);
//                            ship the folder as-is, minus node_modules.
//   • ancient-combat-evolution — a Vite app; its root index.html is the DEV entry
//                            (/src/main.jsx), so we ship its built dist/ instead.

import { cpSync, existsSync } from 'node:fs'
import { join, sep } from 'node:path'

const root = process.cwd()
const out = join(root, 'dist', 'portfolio')

const macSrc = join(root, 'portfolio', 'mac-studio-fitness')

const jobs = [
  {
    name: 'mac-studio-fitness',
    dest: join(out, 'mac-studio-fitness'),
    // Plain static site — but the folder also holds source images and a separate
    // hyperframes video-render project the live page never loads. Ship only the
    // files the page actually serves: index.html + assets/.
    items: [
      { src: join(macSrc, 'index.html'), dest: join(out, 'mac-studio-fitness', 'index.html') },
      { src: join(macSrc, 'assets'), dest: join(out, 'mac-studio-fitness', 'assets') },
    ],
  },
  {
    // Vite app — ship its built dist/ (run `npm run build` inside the folder first).
    name: 'ancient-combat-evolution',
    dest: join(out, 'ancient-combat-evolution'),
    items: [
      {
        src: join(root, 'portfolio', 'ancient-combat-evolution', 'dist'),
        dest: join(out, 'ancient-combat-evolution'),
      },
    ],
  },
]

const skip = (p) =>
  p.includes(`${sep}node_modules`) || p.includes(`${sep}.git`)

let ok = true
for (const { name, items } of jobs) {
  for (const { src, dest } of items) {
    if (!existsSync(src)) {
      console.warn(`[copy-portfolio] SKIP ${name}: missing ${src}`)
      if (name === 'ancient-combat-evolution') {
        console.warn('  → run "npm run build" inside portfolio/ancient-combat-evolution first.')
      }
      ok = false
      continue
    }
    cpSync(src, dest, { recursive: true, filter: (s) => !skip(s) })
  }
  console.log(`[copy-portfolio] ${name} → dist/portfolio/${name}`)
}

if (!ok) {
  console.warn('[copy-portfolio] Some portfolio sites were missing; dist/ is incomplete.')
}
