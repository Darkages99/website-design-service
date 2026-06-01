/**
 * The Self-Building Blueprint.
 *
 * The page engineers itself, section by section. A faint drafting grid sits behind
 * everything (CSS on #alchemy-bg); then, as each real card / block scrolls into
 * view, a blueprint frame *constructs* around it: an outline rectangle draws itself
 * on (stroke-dashoffset), corner registration brackets snap in, and corner nodes
 * light up — like the site is being drafted live around the reader. The active
 * Services tier frames in gold; the final CTA frames in green ("build complete").
 *
 * Pure SVG + IntersectionObserver — no Three.js, no GSAP — so it's light and runs
 * everywhere. Frames are drawn just OUTSIDE each element and sit BEHIND the content
 * (z-0), so they live in the gutters/gaps and never cover text. Geometry uses the
 * offsetParent chain (layout coords), so the scroll-reveal transforms never offset it.
 * Reduced-motion → every frame is shown already built (no animation).
 */
const NS = 'http://www.w3.org/2000/svg'
const PAD = 6   // how far the frame sits outside the element
const ARM = 14  // corner-bracket arm length

export function initBlueprint() {
  const main = document.querySelector('.ba-main')
  if (!main) return
  const targets = Array.from(
    main.querySelectorAll('.ba-hero__inner, .ba-card, .ba-faq__item, .ba-final__inner')
  )
  if (!targets.length) return

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const svg = el('svg', { class: 'ba-bp', 'aria-hidden': 'true', preserveAspectRatio: 'none' })
  document.body.appendChild(svg)

  let io = null
  const map = new WeakMap() // source element → its frame group

  function build() {
    const W = window.innerWidth
    const docH = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)
    svg.setAttribute('width', W)
    svg.setAttribute('height', docH)
    svg.setAttribute('viewBox', `0 0 ${W} ${docH}`)
    svg.textContent = ''
    if (io) io.disconnect()

    for (const src of targets) {
      const r = absRect(src)
      if (!r.w || !r.h) continue
      const x0 = r.x - PAD
      const y0 = r.y - PAD
      const x1 = r.x + r.w + PAD
      const y1 = r.y + r.h + PAD
      const w = x1 - x0
      const h = y1 - y0

      let cls = 'ba-bp__frame'
      if (src.classList.contains('ba-tier--active')) cls += ' is-active'
      if (src.classList.contains('ba-final__inner')) cls += ' is-final'
      if (reduce) cls += ' is-built'
      const g = el('g', { class: cls })

      const rect = el('rect', { x: x0, y: y0, width: w, height: h, rx: 8, pathLength: '1' })
      g.appendChild(rect)

      // corner registration brackets
      g.appendChild(el('path', { class: 'ba-bp__bk', d: `M ${x0} ${y0 + ARM} L ${x0} ${y0} L ${x0 + ARM} ${y0}` }))
      g.appendChild(el('path', { class: 'ba-bp__bk', d: `M ${x1 - ARM} ${y0} L ${x1} ${y0} L ${x1} ${y0 + ARM}` }))
      g.appendChild(el('path', { class: 'ba-bp__bk', d: `M ${x0} ${y1 - ARM} L ${x0} ${y1} L ${x0 + ARM} ${y1}` }))
      g.appendChild(el('path', { class: 'ba-bp__bk', d: `M ${x1 - ARM} ${y1} L ${x1} ${y1} L ${x1} ${y1 - ARM}` }))

      // corner nodes
      for (const [cx, cy] of [[x0, y0], [x1, y0], [x0, y1], [x1, y1]]) {
        g.appendChild(el('circle', { class: 'ba-bp__dot', cx, cy, r: 2.4 }))
      }

      svg.appendChild(g)
      map.set(src, g)
    }

    if (reduce) return

    io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        const g = map.get(e.target)
        if (g) g.classList.add('is-built')
        io.unobserve(e.target)
      }
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' })
    for (const src of targets) io.observe(src)
  }

  // --- rebuild on layout changes (debounced) --------------------------------
  let pending = false
  function scheduleBuild() {
    if (pending) return
    pending = true
    requestAnimationFrame(() => { build(); pending = false })
  }
  window.addEventListener('resize', scheduleBuild, { passive: true })
  window.addEventListener('load', scheduleBuild, { once: true })
  if ('ResizeObserver' in window) new ResizeObserver(scheduleBuild).observe(main)

  build()

  return {
    destroy() {
      if (io) io.disconnect()
      window.removeEventListener('resize', scheduleBuild)
      svg.remove()
    },
  }
}

/* helpers */
function el(name, attrs) {
  const node = document.createElementNS(NS, name)
  for (const k in attrs) node.setAttribute(k, attrs[k])
  return node
}
/* Layout-space rect via the offsetParent chain — immune to CSS transforms
   (the scroll-reveal animations translate the sections, getBoundingClientRect
   would pick that up; offsetTop/offsetLeft do not). */
function absRect(node) {
  let x = 0
  let y = 0
  let n = node
  while (n) {
    x += n.offsetLeft
    y += n.offsetTop
    n = n.offsetParent
  }
  return { x, y, w: node.offsetWidth, h: node.offsetHeight }
}
