import * as THREE from 'three'
import { EffectComposer, EffectPass, RenderPass, BloomEffect, KernelSize } from 'postprocessing'
import {
  VERTEX_COMMON,
  BEGINNORMAL,
  BEGINVERTEX,
  FRAGMENT_COMMON,
  FRAGMENT_EMISSIVE,
} from './glsl.js'

/**
 * The Alchemy Sphere.
 *
 * A high-detail icosahedron whose surface is morphed by a 4-octave simplex
 * noise field (GLSL, injected into a real MeshStandardMaterial so we keep PBR
 * metalness + env-map reflections). Lit with a 3-point rig + a procedural
 * gold→green environment map, with a subtle bloom on the gold peaks.
 *
 * Returns a controller: { setScroll(0..1), setHover(0..1), destroy() }.
 *
 * Tiers (decided by the caller from device capability):
 *   'full' — desktop: detail 64, bloom, DPR ≤ 2
 *   'lite' — capable mobile: detail 32, no bloom, DPR 1
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
    // WebGL unavailable — leave the CSS gradient fallback in place.
    console.warn('[Brand-Alchemy] WebGL init failed; keeping static background.', err)
    return null
  }

  const DPR_CAP = isFull ? 2 : 1
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPR_CAP))
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setClearAlpha(0) // composite over the CSS radial-gradient atmosphere
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05

  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.set(0, 0, 3.6)

  const BASE_SCALE = 0.78 // refined orb, not a viewport-filling blob

  // --- Procedural environment map (gold → dark → green) ---------------------
  // Drawn to a canvas, treated as an equirect reflection map, PMREM-processed
  // so MeshStandardMaterial gets correct roughness-aware reflections. No HDR
  // download, and the reflections stay on-brand.
  const envTexture = buildGradientEnv()
  const pmrem = new THREE.PMREMGenerator(renderer)
  const envRT = pmrem.fromEquirectangular(envTexture)
  scene.environment = envRT.texture
  envTexture.dispose()
  pmrem.dispose()

  // --- The sphere -----------------------------------------------------------
  const detail = isFull ? 64 : 32
  const geometry = new THREE.IcosahedronGeometry(1, detail)

  const uniforms = {
    uTime: { value: 0 },
    uAmp: { value: 0.18 },
    uFreq: { value: 1.3 },
    uSpeed: { value: 0.2 },
    uScroll: { value: 0 },
    uHover: { value: 0 },
    uColorA: { value: new THREE.Color(0xff9933) }, // gold (brand)
    uColorB: { value: new THREE.Color(0x00d26a) }, // green (brand)
    uEmissive: { value: 0.3 },
  }

  const material = new THREE.MeshStandardMaterial({
    color: 0x9a6322,
    metalness: 1.0,
    roughness: 0.3,
    envMapIntensity: 1.1,
    emissive: 0x000000,
  })

  material.onBeforeCompile = (shader) => {
    for (const key in uniforms) shader.uniforms[key] = uniforms[key]

    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\n' + VERTEX_COMMON)
      .replace('#include <beginnormal_vertex>', BEGINNORMAL)
      .replace('#include <begin_vertex>', BEGINVERTEX)

    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\n' + FRAGMENT_COMMON)
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n' + FRAGMENT_EMISSIVE)
  }

  const sphere = new THREE.Mesh(geometry, material)
  scene.add(sphere)

  // --- 3-point lighting rig (env map does most of the reflective work) ------
  const key = new THREE.DirectionalLight(0xfff0dd, 2.2)
  key.position.set(3, 2.5, 4)
  const fill = new THREE.DirectionalLight(0x88ccff, 0.7)
  fill.position.set(-4, -1, 2)
  const rim = new THREE.DirectionalLight(0x00d26a, 1.1)
  rim.position.set(-2, 3, -4)
  scene.add(key, fill, rim)
  scene.add(new THREE.AmbientLight(0x202028, 0.6))

  // --- Postprocessing (bloom only on the full tier) -------------------------
  let composer = null
  if (isFull) {
    composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    const bloom = new BloomEffect({
      intensity: 0.32,
      luminanceThreshold: 0.85,
      luminanceSmoothing: 0.32,
      mipmapBlur: true,
      kernelSize: KernelSize.MEDIUM,
    })
    composer.addPass(new EffectPass(camera, bloom))
  }

  // --- Layout: shift the sphere toward center-right on wide screens ---------
  function layout() {
    const w = window.innerWidth
    const h = window.innerHeight
    const aspect = w / h
    camera.aspect = aspect
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
    if (composer) composer.setSize(w, h)

    // Wide screens: push the sphere right so hero copy breathes on the left.
    const offsetX = aspect > 1 ? THREE.MathUtils.clamp((aspect - 1) * 1.15, 0, 1.7) : 0
    sphere.position.x = offsetX
    // Smaller / portrait viewports: pull the camera back so the orb always fits.
    camera.position.z = aspect < 0.85 ? 4.7 : 3.6
  }
  layout()

  // --- Interaction state ----------------------------------------------------
  const pointer = { x: 0, y: 0 }       // target, normalized -1..1
  const pointerSmooth = { x: 0, y: 0 } // eased
  let hoverTarget = 0
  let scrollTarget = 0

  function onPointerMove(e) {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1
    hoverTarget = 1
  }
  // Only wire pointer reactivity on fine pointers (desktop).
  const finePointer = window.matchMedia('(pointer: fine)').matches
  if (finePointer) window.addEventListener('pointermove', onPointerMove, { passive: true })

  // --- Render loop ----------------------------------------------------------
  const clock = new THREE.Clock()
  let raf = 0
  let running = true
  const baseRotY = 0

  function frame() {
    if (!running) return
    raf = requestAnimationFrame(frame)
    const dt = Math.min(clock.getDelta(), 0.05)
    uniforms.uTime.value += dt

    // ease interaction values
    pointerSmooth.x += (pointer.x - pointerSmooth.x) * 0.045
    pointerSmooth.y += (pointer.y - pointerSmooth.y) * 0.045
    uniforms.uHover.value += (hoverTarget - uniforms.uHover.value) * 0.05
    uniforms.uScroll.value += (scrollTarget - uniforms.uScroll.value) * 0.08
    hoverTarget *= 0.96 // hover energy decays when the cursor stops

    // idle drift + cursor parallax + drift up & shrink as the hero scrolls away
    const s = uniforms.uScroll.value
    sphere.rotation.y = baseRotY + uniforms.uTime.value * 0.06 + pointerSmooth.x * 0.35
    sphere.rotation.x = -pointerSmooth.y * 0.28 + s * 0.2
    sphere.scale.setScalar(BASE_SCALE * (1 - s * 0.28))
    sphere.position.y = s * 0.9
    material.opacity = 1
    material.envMapIntensity = 1.15 * (1 - s * 0.5)

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
      clock.getDelta() // discard the long gap
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
      envRT.dispose()
      if (composer) composer.dispose()
      renderer.dispose()
    },
  }
}

/* Gold → dark → green vertical gradient as an equirectangular reflection map. */
function buildGradientEnv() {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 256
  const ctx = c.getContext('2d')
  const g = ctx.createLinearGradient(0, 0, 0, 256)
  g.addColorStop(0.0, '#ffd9a0') // warm sky highlight
  g.addColorStop(0.32, '#ff9933') // gold band
  g.addColorStop(0.55, '#0a0a0f') // dark horizon
  g.addColorStop(0.8, '#06241a') // deep green floor
  g.addColorStop(1.0, '#00d26a') // green rim
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 512, 256)
  // a couple of soft "studio" highlights for livelier metal reflections
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.beginPath(); ctx.ellipse(150, 70, 60, 26, 0, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = 'rgba(255,210,150,0.7)'
  ctx.beginPath(); ctx.ellipse(380, 95, 44, 20, 0, 0, Math.PI * 2); ctx.fill()

  const tex = new THREE.CanvasTexture(c)
  tex.mapping = THREE.EquirectangularReflectionMapping
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}
