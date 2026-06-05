import * as THREE from 'three'
import { EffectComposer, EffectPass, RenderPass, BloomEffect, KernelSize } from 'postprocessing'
import { NOISE_GLSL } from './glsl.js'

/**
 * The Alchemy Nebula.
 *
 * A luminous cloud of points distributed on a sphere shell and flowed along a
 * curl-noise field, so it swirls like a slow galaxy of golden energy being
 * transmuted into green. Additive-blended with a subtle bloom so dense regions
 * glow. Gold (top) → green (bottom) gradient = the brand's transmutation.
 *
 * It begins as a crisp, slightly smaller sphere and expands outward into the full
 * swirling nebula as the hero scrolls — the expansion (uIntro in the shader) is
 * scrubbed by setScroll on the desktop "full" tier. On the "lite" tier (no scroll
 * layer) it auto-blooms once over time so it still animates.
 *
 * Returns a controller: { setScroll(0..1), setHover(0..1), destroy() }.
 *
 * Tiers (chosen by the caller from device capability):
 *   'full' — desktop: ~5000 points, bloom, DPR ≤ 2
 *   'lite' — capable mobile: ~1000 points, no bloom, DPR 1
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
  // Dark gold/green atmosphere baked into the scene so additive points + bloom
  // composite over a stable backdrop (matches the CSS gradient fallback).
  scene.background = buildBackdrop()

  const camera = new THREE.PerspectiveCamera(36, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.set(0, 0, 3.6)

  // --- Build the point cloud (Fibonacci sphere shell) -----------------------
  // `position` stores the UNIT direction on the sphere; the shell thickness
  // (jitter) rides in a separate attribute so the entrance can begin as a crisp
  // unit sphere and thicken into a cloud as it blooms (see uIntro in the shader).
  const COUNT = isFull ? 5000 : 1000
  const positions = new Float32Array(COUNT * 3)
  const rands = new Float32Array(COUNT)
  const jitters = new Float32Array(COUNT)
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < COUNT; i++) {
    const y = 1 - (i / (COUNT - 1)) * 2 // 1 → -1
    const r = Math.sqrt(1 - y * y)
    const theta = golden * i
    positions[i * 3 + 0] = Math.cos(theta) * r
    positions[i * 3 + 1] = y
    positions[i * 3 + 2] = Math.sin(theta) * r
    jitters[i] = 0.82 + pseudoRandom(i) * 0.34 // shell thickness (faded in during the intro)
    rands[i] = pseudoRandom(i * 7.13 + 2.0)
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('aRand', new THREE.BufferAttribute(rands, 1))
  geometry.setAttribute('aJitter', new THREE.BufferAttribute(jitters, 1))

  const uniforms = {
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uHover: { value: 0 },
    uIntro: { value: 0 },        // entrance: 0 = crisp small sphere → 1 = full nebula
    uIntroStart: { value: 0.6 }, // initial radius scale (smaller → it expands for longer)
    uFlow: { value: 0.2 },
    uFreq: { value: 0.85 },
    uSize: { value: isFull ? 26 : 30 },
    uPixelRatio: { value: pixelRatio },
    uColorA: { value: new THREE.Color(0xffb15c) }, // warm gold
    uColorB: { value: new THREE.Color(0x18e08a) }, // emerald
  }

  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      uniform float uTime, uScroll, uHover, uIntro, uIntroStart, uFlow, uFreq, uSize, uPixelRatio;
      attribute float aRand;
      attribute float aJitter;
      varying float vMix;
      varying float vAlpha;
      ${NOISE_GLSL}
      void main(){
        vec3 dir = position; // unit direction on the sphere shell

        // Entrance: start as a crisp, slightly smaller sphere, then bloom outward.
        // Shell thickness and overall radius fade in with uIntro, so the first
        // frames read as a defined sphere before it opens into the nebula.
        float shell = mix(1.0, aJitter, uIntro);
        float radius = mix(uIntroStart, 1.0, uIntro);
        vec3 base = dir * shell * radius;

        // swirl along the curl-noise field; gated by uIntro² so the sphere stays
        // defined at first and only swirls as it expands. Speed varies per point.
        vec3 flow = ba_curl(dir * uFreq + uTime * 0.045);
        float amp = uFlow * (1.0 + uHover * 0.6) * (uIntro * uIntro);
        vec3 pos = base + flow * amp;
        // gentle breathing (eases in with the bloom)
        pos *= 1.0 + 0.05 * sin(uTime * 0.5 + aRand * 6.2831) * uIntro;
        // scroll: disperse outward + fade as the hero leaves
        pos += dir * uScroll * 1.5;

        vMix = clamp(pos.y * 0.5 + 0.55, 0.0, 1.0);
        vAlpha = 1.0 - uScroll * 0.92;

        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mv;
        float size = uSize * (0.45 + aRand) * uPixelRatio;
        gl_PointSize = size * (1.0 / -mv.z);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColorA, uColorB;
      varying float vMix;
      varying float vAlpha;
      void main(){
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        if (d > 0.5) discard;
        float soft = smoothstep(0.5, 0.0, d);
        vec3 col = mix(uColorB, uColorA, vMix);
        col += pow(max(1.0 - d * 2.0, 0.0), 3.0) * 0.7; // bright core → feeds bloom
        gl_FragColor = vec4(col * soft * vAlpha, 1.0);
      }
    `,
  })

  const points = new THREE.Points(geometry, material)
  scene.add(points)

  // --- Postprocessing (bloom on the full tier only) -------------------------
  let composer = null
  if (isFull) {
    composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    const bloom = new BloomEffect({
      intensity: 0.7,
      luminanceThreshold: 0.5,
      luminanceSmoothing: 0.4,
      mipmapBlur: true,
      kernelSize: KernelSize.LARGE,
    })
    composer.addPass(new EffectPass(camera, bloom))
  }

  // --- Layout: keep the nebula centred on screen ----------------------------
  // The orb sits on the screen's vertical axis (x = 0) at every aspect ratio, so
  // it reads as a centred bloom behind the centred hero copy — no dead space on
  // the left. Only the camera distance adapts so the sphere stays fully framed
  // on narrow (portrait) viewports.
  function layout() {
    const w = window.innerWidth
    const h = window.innerHeight
    const aspect = w / h
    camera.aspect = aspect
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
    if (composer) composer.setSize(w, h)
    points.position.x = 0
    camera.position.z = aspect < 0.85 ? 4.6 : 3.6
  }
  layout()

  // --- Interaction ----------------------------------------------------------
  const pointer = { x: 0, y: 0 }
  const pointerSmooth = { x: 0, y: 0 }
  let hoverTarget = 0
  let scrollTarget = 0

  function onPointerMove(e) {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1
    hoverTarget = 1
  }
  window.addEventListener('pointermove', onPointerMove, { passive: true })

  // --- Render loop ----------------------------------------------------------
  const clock = new THREE.Clock()
  const INTRO_DURATION = 6.5 // seconds — slow, graceful bloom from sphere to nebula
  let introElapsed = 0
  let raf = 0
  let running = true

  function frame() {
    if (!running) return
    raf = requestAnimationFrame(frame)
    const dt = Math.min(clock.getDelta(), 0.05)
    uniforms.uTime.value += dt

    // Expansion: on desktop 'full' tier, we scrub uIntro by scroll progress.
    // On mobile 'lite' tier, it auto-blooms once on mount over time.
    if (isFull) {
      uniforms.uIntro.value += (scrollTarget - uniforms.uIntro.value) * 0.08
    } else {
      if (introElapsed < INTRO_DURATION) {
        introElapsed = Math.min(INTRO_DURATION, introElapsed + dt)
        const t = introElapsed / INTRO_DURATION
        uniforms.uIntro.value = t * t * t * (t * (t * 6.0 - 15.0) + 10.0)
      }
    }

    pointerSmooth.x += (pointer.x - pointerSmooth.x) * 0.045
    pointerSmooth.y += (pointer.y - pointerSmooth.y) * 0.045
    uniforms.uHover.value += (hoverTarget - uniforms.uHover.value) * 0.05
    uniforms.uScroll.value += (scrollTarget - uniforms.uScroll.value) * 0.08
    hoverTarget *= 0.96

    points.rotation.y = uniforms.uTime.value * 0.05 + pointerSmooth.x * 0.4
    points.rotation.x = -pointerSmooth.y * 0.3

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
    setHover(v) { hoverTarget = Math.max(hoverTarget, v) },
    destroy() {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('visibilitychange', onVisibility)
      geometry.dispose()
      material.dispose()
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

/* Dark backdrop with a soft gold (top-right) + green (bottom-left) glow,
   matching the CSS atmosphere so the canvas reads consistently. */
function buildBackdrop() {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 512
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#0a0a0f'
  ctx.fillRect(0, 0, 512, 512)
  let g = ctx.createRadialGradient(370, 150, 0, 370, 150, 360)
  g.addColorStop(0, 'rgba(255,153,51,0.22)')
  g.addColorStop(1, 'rgba(255,153,51,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 512, 512)
  g = ctx.createRadialGradient(120, 410, 0, 120, 410, 340)
  g.addColorStop(0, 'rgba(0,210,106,0.14)')
  g.addColorStop(1, 'rgba(0,210,106,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 512, 512)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}
