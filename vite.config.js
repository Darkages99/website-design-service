import { defineConfig } from 'vite'

// Builds src/ into the theme's assets/dist with a manifest.
// functions.php (inc/enqueue.php) reads the manifest and enqueues the hashed files.
// We deploy by syncing brand-alchemy/ into the Studio site (see sync.ps1) — no dev server needed.
export default defineConfig({
  base: './',
  build: {
    outDir: 'brand-alchemy/assets/dist',
    emptyOutDir: true,
    manifest: true,
    target: 'es2020',
    rollupOptions: {
      input: {
        main: 'src/main.js',
      },
    },
  },
})
