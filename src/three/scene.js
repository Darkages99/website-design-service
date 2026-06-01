import * as THREE from 'three'
import { NOISE_GLSL } from './glsl.js'
// `postprocessing` (bloom) is imported dynamically below, ONLY on the full tier,
// so mobile/lite never downloads or parses it.

/**
 * The Alchemy Nebula — continuously scroll-reactive.
 *
 * A luminous cloud of points on a sphere shell, flowed along a curl-noise field so
 * it swirls like a slow galaxy, additive-blended with bloom so dense regions glow.
 * It drifts with the cursor (parallax) and BURSTS with scroll energy.
 *
 * The fix vs. the original: the old build drove a one-shot "disperse + fade" from a
 * hero-only scroll trigger, so it went inert after the first viewport. This version
 * listens to the page scroll itself and keeps a decaying ENERGY value — every scroll
 * gesture, anywhere on the page, pushes the points outward (proportional to scroll
 * speed) and brightens them; they ease back when you stop. Overall scroll PROGRESS
 * also tints the cloud gold → green as you move down the page. So it never stops.
 *
 * Returns { setHover(v), destroy() }. Tiers: 'full' = ~5000 pts + bloom, DPR ≤ 2;
 * 'lite' = ~1000 pts, no bloom, DPR 1.
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
  scene.background = buildBackdrop()

  const camera = new THREE.PerspectiveCamera(36, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.set(0, 0, 3.6)

  // --- Point cloud (Fibonacci sphere shell) ---------------------------------
  const COUNT = isFull ? 5000 : 1000
  const positions = new Float32Array(COUNT * 3)
  const rands = new Float32Array(COUNT)
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < COUNT; i++) {
    const y = 1 - (i / (COUNT - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const theta = golden * i
    const jitter = 0.82 + pseudoRandom(i) * 0.34
    positions[i * 3 + 0] = Math.cos(theta) * r * jitter
    positions[i * 3 + 1] = y * jitter
    positions[i * 3 + 2] = Math.sin(theta) * r * jitter
    rands[i] = pseudoRandom(i * 7.13 + 2.0)
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('aRand', new THREE.BufferAttribute(rands, 1))

  const uniforms = {
    uTime: { value: 0 },
    uEnergy: { value: 0 },     // scroll-burst energy (decays); keeps it alive on every scroll
    uProgress: { value: 0 },   // overall page scroll progress → colour shift
    uHover: { value: 0 },
    uFlow: { value: 0.2 },
    uFreq: { value: 0.85 },
    uSize: { value: isFull ? 26 : 30 },
    uPixelRatio: { value: pixelRatio },
    uColorA: { value: new THREE.Color(0xffb15c) }, // gold
    uColorB: { value: new THREE.Color(0x1fe08a) }, // reagent green
    uColorC: { value: new THREE.Color(0x38e1ff) }, // aqua cyan (sparkle)
  }

  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      uniform float uTime, uEnergy, uProgress, uHover, uFlow, uFreq, uSize, uPixelRatio;
      attribute float aRand;
      varying float vMix;
      varying float vAlpha;
      varying float vProg;
      ${NOISE_GLSL}
      void main(){
        vec3 base = position;
        // swirl along the curl-noise field; energy + hover widen the swirl
        vec3 flow = ba_curl(base * uFreq + uTime * 0.05);
        float amp = uFlow * (1.0 + uHover * 0.6 + uEnergy * 1.3);
        vec3 pos = base + flow * amp;
        // gentle breathing
        pos *= 1.0 + 0.05 * sin(uTime * 0.5 + aRand * 6.2831);
        // CONTINUOUS scroll burst: every scroll pushes points outward, returns on ease-out
        pos += normalize(base) * uEnergy * (0.55 + aRand * 0.9);

        vMix = clamp(pos.y * 0.5 + 0.55, 0.0, 1.0);
        vProg = uProgress;
        // stays bright the whole page; brightens on scroll bursts
        vAlpha = clamp(0.82 + uEnergy * 0.5, 0.0, 1.4);

        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mv;
        float size = uSize * (0.45 + aRand) * uPixelRatio * (1.0 + uEnergy * 0.6);
        gl_PointSize = size * (1.0 / -mv.z);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColorA, uColorB, uColorC;
      varying float vMix;
      varying float vAlpha;
      varying float vProg;
      void main(){
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        if (d > 0.5) discard;
        float soft = smoothstep(0.5, 0.0, d);
        vec3 col = mix(uColorB, uColorA, vMix);   // green(low) → gold(high)
        col = mix(col, uColorC, vProg * 0.28);     // tinge cyan as you scroll down
        col += pow(max(1.0 - d * 2.0, 0.0), 3.0) * 0.7; // bright core → feeds bloom
        gl_FragColor = vec4(col * soft * vAlpha, 1.0);
      }
    `,
  })

  const points = new THREE.Points(geometry, material)
  scene.add(points)

  // --- Bloom (full tier only, loaded on demand) -----------------------------
  let composer = null
  if (isFull) {
    import('postprocessing')
      .then(({ EffectComposer, EffectPass, RenderPass, BloomEffect, KernelSize }) => {
        const c = new EffectComposer(renderer)
        c.addPass(new RenderPass(scene, camera))
        c.addPass(new EffectPass(camera, new BloomEffect({
          intensity: 0.7,
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

  // --- Layout: bias the nebula center-right on wide screens -----------------
  function layout() {
    const w = window.innerWidth
    const h = window.innerHeight
    const aspect = w / h
    camera.aspect = aspect
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
    if (composer) composer.setSize(w, h)
    const offsetX = aspect > 1 ? THREE.MathUtils.clamp((aspect - 1) * 1.2, 0, 1.7) : 0
    points.position.x = offsetX
    camera.position.z = aspect < 0.85 ? 4.6 : 3.6
  }
  layout()

  // --- Interaction: cursor parallax + continuous scroll energy --------------
  const pointer = { x: 0, y: 0 }
  const pointerSmooth = { x: 0, y: 0 }
  let hoverTarget = 0

  function onPointerMove(e) {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1
    hoverTarget = 1
  }
  const finePointer = window.matchMedia('(pointer: fine)').matches
  if (finePointer) window.addEventListener('pointermove', onPointerMove, { passive: true })

  // Scroll → energy. Accumulate per-event impulse from scroll distance; the frame
  // loop decays it, so holding a scroll keeps energy up and stopping eases it down.
  let lastY = window.scrollY || 0
  let impulse = 0
  let energy = 0
  let progressTarget = 0
  function maxScroll() {
    return Math.max(1, (document.documentElement.scrollHeight || document.body.scrollHeight) - window.innerHeight)
  }
  function onScroll() {
    const y = window.scrollY || window.pageYOffset || 0
    impulse += Math.min(Math.abs(y - lastY) / 38, 0.7)
    lastY = y
    progressTarget = THREE.MathUtils.clamp(y / maxScroll(), 0, 1)
  }
  window.addEventListener('scroll', onScroll, { passive: true })

  // --- Render loop ----------------------------------------------------------
  const clock = new THREE.Clock()
  let raf = 0
  let running = true

  function frame() {
    if (!running) return
    raf = requestAnimationFrame(frame)
    const dt = Math.min(clock.getDelta(), 0.05)
    uniforms.uTime.value += dt

    // energy: add impulse, then decay → continuous reactivity that settles when idle
    energy += impulse
    impulse = 0
    energy *= 0.90
    energy = Math.min(energy, 1.5)
    uniforms.uEnergy.value += (energy - uniforms.uEnergy.value) * 0.25
    uniforms.uProgress.value += (progressTarget - uniforms.uProgress.value) * 0.06

    pointerSmooth.x += (pointer.x - pointerSmooth.x) * 0.045
    pointerSmooth.y += (pointer.y - pointerSmooth.y) * 0.045
    uniforms.uHover.value += (hoverTarget - uniforms.uHover.value) * 0.05
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
    setHover(v) { hoverTarget = Math.max(hoverTarget, v) },
    destroy() {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('scroll', onScroll)
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

/* Dark backdrop with a soft gold (top-right) + green (bottom-left) glow + a faint
   cyan center, matching the CSS atmosphere so the canvas reads consistently. */
function buildBackdrop() {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 512
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#0a0a0f'
  ctx.fillRect(0, 0, 512, 512)
  let g = ctx.createRadialGradient(370, 140, 0, 370, 140, 360)
  g.addColorStop(0, 'rgba(255,153,51,0.22)')
  g.addColorStop(1, 'rgba(255,153,51,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 512, 512)
  g = ctx.createRadialGradient(120, 410, 0, 120, 410, 340)
  g.addColorStop(0, 'rgba(31,224,138,0.15)')
  g.addColorStop(1, 'rgba(31,224,138,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 512, 512)
  g = ctx.createRadialGradient(256, 270, 0, 256, 270, 300)
  g.addColorStop(0, 'rgba(56,225,255,0.06)')
  g.addColorStop(1, 'rgba(56,225,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 512, 512)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}
