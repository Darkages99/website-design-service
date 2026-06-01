import * as THREE from 'three'
// `postprocessing` (bloom) is imported dynamically below, ONLY on the full tier,
// so mobile/lite never downloads or parses it.

/**
 * The Molecular Bond Network (chemistry-lab branch).
 *
 * A sparse lattice of glowing "atoms" (points) joined by faint "bonds" (line
 * segments), drifting and rotating slowly like a molecule suspended in solution.
 * Atoms are animated on the CPU (the count is small, ~90) so the bonds can track
 * their endpoints every frame. Additive-blended with a subtle bloom so atoms and
 * bonds glow. A gold→green height gradient = "reactants"; as the reaction
 * progresses (setReaction → 1) the molecule shifts toward green/cyan = "product".
 *
 * Returns a controller: { setScroll(0..1), setReaction(0..1), setHover(0..1), destroy() }.
 *   - setScroll:  disperses + fades the molecule as the hero leaves; re-gathers at the final CTA.
 *   - setReaction: gold(reactant) → green/cyan(product) colour + brighter bonds (driven at the CTA).
 *
 * Tiers (chosen by the caller from device capability):
 *   'full' — desktop: ~90 atoms, bonds, bloom, DPR ≤ 2
 *   'lite' — capable mobile: ~42 atoms, bonds, no bloom, DPR 1
 */
export function mountScene(canvas, { tier = 'full' } = {}) {
  const isFull = tier === 'full'

  let renderer
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: isFull,
      alpha: true,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: false,
    })
  } catch (err) {
    console.warn('[Brand-Alchemy] WebGL init failed; keeping static background.', err)
    return null
  }

  const DPR_CAP = isFull ? 2 : 1
  const pixelRatio = Math.min(window.devicePixelRatio || 1, DPR_CAP)
  renderer.setPixelRatio(pixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setClearAlpha(0)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.0

  const scene = new THREE.Scene()
  // Dark gold/green/cyan atmosphere baked into the scene so additive atoms + bloom
  // composite over a stable backdrop (matches the CSS gradient fallback).
  scene.background = buildBackdrop()

  const camera = new THREE.PerspectiveCamera(36, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.set(0, 0, 3.6)

  // A group holds atoms + bonds so a single rotation spins the whole molecule;
  // atom positions are computed in this local (un-rotated) space so the bonds
  // can reuse them directly each frame.
  const group = new THREE.Group()
  scene.add(group)

  // --- Atom layout (Fibonacci sphere shell, sparse) -------------------------
  const COUNT = isFull ? 90 : 42
  const base = new Float32Array(COUNT * 3) // resting positions (local space)
  const rands = new Float32Array(COUNT)
  const phase = new Float32Array(COUNT * 3) // per-axis drift phases
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < COUNT; i++) {
    const y = 1 - (i / (COUNT - 1)) * 2 // 1 → -1
    const r = Math.sqrt(1 - y * y)
    const theta = golden * i
    const jitter = 0.78 + pseudoRandom(i) * 0.42 // shell thickness
    base[i * 3 + 0] = Math.cos(theta) * r * jitter
    base[i * 3 + 1] = y * jitter
    base[i * 3 + 2] = Math.sin(theta) * r * jitter
    rands[i] = pseudoRandom(i * 7.13 + 2.0)
    phase[i * 3 + 0] = pseudoRandom(i * 1.7 + 0.3) * 6.2831
    phase[i * 3 + 1] = pseudoRandom(i * 3.1 + 1.1) * 6.2831
    phase[i * 3 + 2] = pseudoRandom(i * 5.9 + 2.7) * 6.2831
  }

  // --- Bonds: connect each atom to its nearest neighbours within a radius ----
  const BOND_RADIUS = 0.62
  const MAX_BONDS_PER_ATOM = 3
  const pairs = []
  const bondCount = new Int8Array(COUNT)
  for (let i = 0; i < COUNT; i++) {
    // gather candidate neighbours sorted by distance
    const cand = []
    for (let j = i + 1; j < COUNT; j++) {
      const dx = base[i * 3] - base[j * 3]
      const dy = base[i * 3 + 1] - base[j * 3 + 1]
      const dz = base[i * 3 + 2] - base[j * 3 + 2]
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz)
      if (d < BOND_RADIUS) cand.push([d, j])
    }
    cand.sort((a, b) => a[0] - b[0])
    for (const [, j] of cand) {
      if (bondCount[i] >= MAX_BONDS_PER_ATOM) break
      if (bondCount[j] >= MAX_BONDS_PER_ATOM) continue
      pairs.push(i, j)
      bondCount[i]++
      bondCount[j]++
    }
  }

  // --- Atom points geometry + shader ----------------------------------------
  const positions = new Float32Array(COUNT * 3)
  positions.set(base)
  const geometry = new THREE.BufferGeometry()
  const posAttr = new THREE.BufferAttribute(positions, 3)
  posAttr.setUsage(THREE.DynamicDrawUsage)
  geometry.setAttribute('position', posAttr)
  geometry.setAttribute('aRand', new THREE.BufferAttribute(rands, 1))

  const uniforms = {
    uScroll: { value: 0 },
    uReaction: { value: 0 },
    uSize: { value: isFull ? 30 : 34 },
    uPixelRatio: { value: pixelRatio },
    uColorA: { value: new THREE.Color(0xffb15c) }, // warm gold  (reactant, top)
    uColorB: { value: new THREE.Color(0x1fe08a) }, // reagent green (mid/bottom)
    uColorC: { value: new THREE.Color(0x38e1ff) }, // aqua cyan  (product, top)
  }

  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      uniform float uScroll, uSize, uPixelRatio;
      attribute float aRand;
      varying float vMix;
      varying float vAlpha;
      void main(){
        vec3 pos = position; // already drifted + dispersed on the CPU
        vMix = clamp(pos.y * 0.42 + 0.5, 0.0, 1.0);
        vAlpha = 1.0 - uScroll * 0.9;
        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mv;
        float size = uSize * (0.55 + aRand) * uPixelRatio;
        gl_PointSize = size * (1.0 / -mv.z);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColorA, uColorB, uColorC;
      uniform float uReaction;
      varying float vMix;
      varying float vAlpha;
      void main(){
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        if (d > 0.5) discard;
        float soft = smoothstep(0.5, 0.0, d);
        vec3 reactant = mix(uColorB, uColorA, vMix); // green → gold (top)
        vec3 product  = mix(uColorB, uColorC, vMix); // green → cyan (top)
        vec3 col = mix(reactant, product, uReaction);
        col += pow(max(1.0 - d * 2.0, 0.0), 3.0) * 0.8; // bright core → feeds bloom
        gl_FragColor = vec4(col * soft * vAlpha, 1.0);
      }
    `,
  })

  const points = new THREE.Points(geometry, material)
  group.add(points)

  // --- Bond line segments ---------------------------------------------------
  const linePositions = new Float32Array(pairs.length * 3)
  const lineGeo = new THREE.BufferGeometry()
  const lineAttr = new THREE.BufferAttribute(linePositions, 3)
  lineAttr.setUsage(THREE.DynamicDrawUsage)
  lineGeo.setAttribute('position', lineAttr)
  const lineMat = new THREE.LineBasicMaterial({
    color: new THREE.Color(0x2bd6d0),
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  const bondColorReactant = new THREE.Color(0x2bbad6) // cool cyan (reactant bonds)
  const bondColorProduct = new THREE.Color(0x4dffb0) // bright green-cyan (product bonds)
  const lines = new THREE.LineSegments(lineGeo, lineMat)
  group.add(lines)

  // --- Postprocessing (bloom on the full tier only, loaded on demand) -------
  let composer = null
  if (isFull) {
    import('postprocessing')
      .then(({ EffectComposer, EffectPass, RenderPass, BloomEffect, KernelSize }) => {
        const c = new EffectComposer(renderer)
        c.addPass(new RenderPass(scene, camera))
        c.addPass(new EffectPass(camera, new BloomEffect({
          intensity: 0.62,
          luminanceThreshold: 0.5,
          luminanceSmoothing: 0.4,
          mipmapBlur: true,
          kernelSize: KernelSize.LARGE,
        })))
        c.setSize(window.innerWidth, window.innerHeight)
        composer = c
      })
      .catch((err) => console.warn('[Brand-Alchemy] bloom unavailable:', err))
  }

  // --- Layout: bias the molecule toward center-right on wide screens --------
  function layout() {
    const w = window.innerWidth
    const h = window.innerHeight
    const aspect = w / h
    camera.aspect = aspect
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
    if (composer) composer.setSize(w, h)
    const offsetX = aspect > 1 ? THREE.MathUtils.clamp((aspect - 1) * 1.2, 0, 1.7) : 0
    group.position.x = offsetX
    camera.position.z = aspect < 0.85 ? 4.6 : 3.6
  }
  layout()

  // --- Interaction ----------------------------------------------------------
  const pointer = { x: 0, y: 0 }
  const pointerSmooth = { x: 0, y: 0 }
  let hoverTarget = 0
  let scrollTarget = 0
  let reactionTarget = 0

  function onPointerMove(e) {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1
    hoverTarget = 1
  }
  const finePointer = window.matchMedia('(pointer: fine)').matches
  if (finePointer) window.addEventListener('pointermove', onPointerMove, { passive: true })

  // --- Render loop ----------------------------------------------------------
  const clock = new THREE.Clock()
  let raf = 0
  let running = true
  let hoverEased = 0

  function frame() {
    if (!running) return
    raf = requestAnimationFrame(frame)
    const dt = Math.min(clock.getDelta(), 0.05)
    const t = clock.elapsedTime

    pointerSmooth.x += (pointer.x - pointerSmooth.x) * 0.045
    pointerSmooth.y += (pointer.y - pointerSmooth.y) * 0.045
    hoverEased += (hoverTarget - hoverEased) * 0.05
    uniforms.uScroll.value += (scrollTarget - uniforms.uScroll.value) * 0.08
    uniforms.uReaction.value += (reactionTarget - uniforms.uReaction.value) * 0.06
    hoverTarget *= 0.96

    // Disperse outward with scroll; the molecule also "tightens" a touch as the
    // reaction completes (product is more compact than the loose reactants).
    const scroll = uniforms.uScroll.value
    const react = uniforms.uReaction.value
    const spread = 1.0 + scroll * 1.5 - react * 0.12
    const driftAmp = 0.06 * (1.0 + hoverEased * 0.5)
    for (let i = 0; i < COUNT; i++) {
      const dx = Math.sin(t * 0.6 + phase[i * 3]) * driftAmp
      const dy = Math.sin(t * 0.5 + phase[i * 3 + 1]) * driftAmp
      const dz = Math.sin(t * 0.7 + phase[i * 3 + 2]) * driftAmp
      positions[i * 3] = base[i * 3] * spread + dx
      positions[i * 3 + 1] = base[i * 3 + 1] * spread + dy
      positions[i * 3 + 2] = base[i * 3 + 2] * spread + dz
    }
    posAttr.needsUpdate = true

    // Bonds follow their atom endpoints; fade out as the molecule disperses so
    // long stretched lines never clutter the scrolled-past sections.
    for (let p = 0; p < pairs.length; p += 2) {
      const a = pairs[p] * 3
      const b = pairs[p + 1] * 3
      const o = p * 3
      linePositions[o] = positions[a]
      linePositions[o + 1] = positions[a + 1]
      linePositions[o + 2] = positions[a + 2]
      linePositions[o + 3] = positions[b]
      linePositions[o + 4] = positions[b + 1]
      linePositions[o + 5] = positions[b + 2]
    }
    lineAttr.needsUpdate = true
    lineMat.opacity = 0.5 * (1 - scroll * 0.92) * (0.8 + react * 0.5)
    lineMat.color.copy(bondColorReactant).lerp(bondColorProduct, react)

    // Slow spin + cursor parallax on the whole molecule.
    group.rotation.y = t * 0.05 + pointerSmooth.x * 0.4
    group.rotation.x = -pointerSmooth.y * 0.3

    if (composer) composer.render()
    else renderer.render(scene, camera)
  }
  frame()

  // --- Lifecycle ------------------------------------------------------------
  function onResize() { layout() }
  window.addEventListener('resize', onResize, { passive: true })

  function onVisibility() {
    if (document.hidden) {
      running = false
      cancelAnimationFrame(raf)
    } else if (!running) {
      running = true
      clock.getDelta()
      frame()
    }
  }
  document.addEventListener('visibilitychange', onVisibility)

  return {
    setScroll(p) { scrollTarget = THREE.MathUtils.clamp(p, 0, 1) },
    setReaction(p) { reactionTarget = THREE.MathUtils.clamp(p, 0, 1) },
    setHover(v) { hoverTarget = Math.max(hoverTarget, v) },
    destroy() {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('visibilitychange', onVisibility)
      geometry.dispose()
      material.dispose()
      lineGeo.dispose()
      lineMat.dispose()
      if (scene.background && scene.background.dispose) scene.background.dispose()
      if (composer) composer.dispose()
      renderer.dispose()
    },
  }
}

/* Deterministic per-index pseudo-random (no Math.random at module scope). */
function pseudoRandom(n) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return s - Math.floor(s)
}

/* Dark backdrop with a soft gold (top-right) + green (bottom-left) glow plus a
   faint cyan center, matching the CSS atmosphere so the canvas reads consistently. */
function buildBackdrop() {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 512
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#0a0a0f'
  ctx.fillRect(0, 0, 512, 512)
  let g = ctx.createRadialGradient(370, 145, 0, 370, 145, 360)
  g.addColorStop(0, 'rgba(255,153,51,0.20)')
  g.addColorStop(1, 'rgba(255,153,51,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 512, 512)
  g = ctx.createRadialGradient(120, 410, 0, 120, 410, 340)
  g.addColorStop(0, 'rgba(31,224,138,0.15)')
  g.addColorStop(1, 'rgba(31,224,138,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 512, 512)
  g = ctx.createRadialGradient(256, 285, 0, 256, 285, 300)
  g.addColorStop(0, 'rgba(56,225,255,0.07)')
  g.addColorStop(1, 'rgba(56,225,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 512, 512)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}
