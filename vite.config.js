import { defineConfig } from 'vite'

// Standalone static build — no WordPress.
//
// `vite build` processes the root index.html, bundles src/ (JS, CSS, Three.js,
// GSAP, Lenis) into hashed assets, and writes a self-contained site to dist/
// that can be hosted on ANY static host (Netlify, Vercel, GitHub Pages, S3,
// Cloudflare Pages…). `npm run dev` serves the same index.html with HMR.
//
// base: './' keeps every asset reference relative, so dist/ works whether it is
// served from a domain root or a sub-path.
export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2020',
  },
})
