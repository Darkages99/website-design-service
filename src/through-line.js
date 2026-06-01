/**
 * The Through-Line.
 *
 * A single luminous thread (gold → cyan → green) drawn down the page that stitches
 * every section into the "click → customer" story. It lives just left of the
 * content column and sits BEHIND the (solid) content, so it's always text-safe by
 * z-order — solid cards simply occlude it, leaving the thread visible in the gutter
 * and in the gaps between sections.
 *
 * It is drawn progressively as you scroll (stroke-dashoffset = scroll progress),
 * with a glowing head at the tip and a node at each section that lights up when the
 * line reaches it. Multi-card sections get a small node cluster (Problem ×3,
 * Process ×4, Services ×3, Proof ×3), the active Services node is gold, the Boundary
 * node forks green/dim, and the final CTA is a bright green "customer" node with a halo.
 *
 * Pure SVG + native scroll — no Three.js, no GSAP — so it is tiny and runs on every
 * device. Reduced-motion → the thread is drawn fully and statically (no animation).
 *
 * Section Y positions use offsetTop/offsetHeight (layout coords) so the scroll-reveal
 * transforms on the sections never throw the nodes off.
 */
const NS = 'http://www.w3.org/2000/svg'
const GOLD = [255, 153, 51]
const CYAN = [56, 225, 255]
const GREEN = [31, 224, 138]

export function initThroughLine() {
  const main = document.querySelector('.ba-main')
  if (!main) return
  const sections = Array.from(main.querySelectorAll(':scope > .ba-section'))
  if (!sections.length) return

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const svg = el('svg', { class: 'ba-thread', 'aria-hidden': 'true', preserveAspectRatio: 'none' })
  svg.innerHTML =
    '<defs><linearGradient id="baThreadGrad" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">' +
    '<stop offset="0" stop-color="#ff9933"/><stop offset="0.5" stop-color="#38e1ff"/>' +
    '<stop offset="1" stop-color="#1fe08a"/></linearGradient></defs>'

  const spine = el('path', { class: 'ba-thread__spine', fill: 'none', stroke: 'url(#baThreadGrad)' })
  const nodesG = el('g', {})
  const head = el('circle', { class: 'ba-thread__head', r: '6', fill: '#ffe0b0' })
  svg.append(spine, nodesG, head)
  document.body.appendChild(svg)

  let nodes = []
  let len = 0
  let docH = 0

  function build() {
    docH = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)
    const W = window.innerWidth
    svg.setAttribute('width', W)
    svg.setAttribute('height', docH)
    svg.setAttribute('viewBox', `0 0 ${W} ${docH}`)

    const contentW = Math.min(W - 32, 1200)
    const baseX = Math.max(16, (W - contentW) / 2 - 26)
    const mainTop = main.getBoundingClientRect().top + window.scrollY

    // node anchor points (layout coords — immune to reveal transforms)
    const pts = sections.map((s, i) => {
      const yMid = mainTop + s.offsetTop + s.offsetHeight / 2
      return [baseX + Math.sin(i * 1.3) * 10, yMid]
    })

    // spine path: from the top of the hero, down through every section mid
    let d = `M ${pts[0][0]} ${mainTop + sections[0].offsetTop + 48} L ${pts[0][0]} ${pts[0][1]}`
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1]
      const [x1, y1] = pts[i]
      const my = (y0 + y1) / 2
      d += ` C ${x0} ${my}, ${x1} ${my}, ${x1} ${y1}`
    }
    spine.setAttribute('d', d)
    len = spine.getTotalLength()
    spine.style.strokeDasharray = len
    spine.style.strokeDashoffset = reduce ? 0 : len

    // nodes
    nodesG.textContent = ''
    nodes = []
    sections.forEach((s, i) => {
      const [x, y] = pts[i]
      const id = s.id || ''
      const isCTA = id === 'contact'
      const counts = { problem: 3, process: 4, services: 3, boundary: 2, proof: 3 }
      const count = counts[id] || 1

      const g = el('g', { class: 'ba-thread__node' + (reduce ? ' is-on' : '') })
      const tick = el('line', {
        x1: x, y1: y, x2: x + 22, y2: y,
        stroke: rgb(colorAt(y / docH)), 'stroke-width': '1.5', opacity: '0.6',
      })
      g.appendChild(tick)

      const spread = 10
      for (let k = 0; k < count; k++) {
        const cy = y + (k - (count - 1) / 2) * spread
        let fill = rgb(colorAt(cy / docH))
        let r = 3.8
        if (id === 'services' && k === 1) { fill = '#ff9933'; r = 5.4 }       // active tier
        else if (id === 'boundary') { fill = k === 0 ? '#1fe08a' : '#5b6472' } // we do / you handle
        else if (isCTA) { fill = '#1fe08a'; r = 8 }                            // the customer
        g.appendChild(el('circle', { cx: x, cy, r, fill }))
      }
      if (isCTA) {
        g.appendChild(el('circle', { class: 'ba-thread__halo', cx: x, cy: y, r: '15', fill: 'none', stroke: '#1fe08a', 'stroke-width': '1.5' }))
      }
      nodesG.appendChild(g)
      nodes.push({ el: g, y })
    })

    if (reduce) head.style.opacity = '0'
    update()
  }

  function update() {
    if (reduce) return
    const scrollable = docH - window.innerHeight
    const prog = scrollable > 0 ? clamp(window.scrollY / scrollable, 0, 1) : 1
    const drawn = len * prog
    spine.style.strokeDashoffset = String(len - drawn)

    if (drawn > 2 && drawn < len - 1) {
      const p = spine.getPointAtLength(drawn)
      head.setAttribute('cx', p.x)
      head.setAttribute('cy', p.y)
      head.style.opacity = '1'
    } else {
      head.style.opacity = '0'
    }

    const reached = window.scrollY + window.innerHeight * 0.62
    for (const n of nodes) n.el.classList.toggle('is-on', n.y <= reached)
  }

  // --- events (rAF-throttled scroll; debounced rebuild) ---------------------
  let scrollTick = false
  function onScroll() {
    if (scrollTick) return
    scrollTick = true
    requestAnimationFrame(() => { update(); scrollTick = false })
  }
  let buildTick = false
  function scheduleBuild() {
    if (buildTick) return
    buildTick = true
    requestAnimationFrame(() => { build(); buildTick = false })
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', scheduleBuild, { passive: true })
  window.addEventListener('load', scheduleBuild, { once: true })
  if ('ResizeObserver' in window) new ResizeObserver(scheduleBuild).observe(main)

  build()

  return {
    destroy() {
      window.removeEventListener('scroll', onScroll)
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
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)) }
function lerp(a, b, t) { return a + (b - a) * t }
function colorAt(f) {
  f = clamp(f, 0, 1)
  const [a, b] = f < 0.5 ? [GOLD, CYAN] : [CYAN, GREEN]
  const t = f < 0.5 ? f / 0.5 : (f - 0.5) / 0.5
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]
}
function rgb(c) { return `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})` }
