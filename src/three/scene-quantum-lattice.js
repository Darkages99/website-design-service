import * as THREE from 'three'
import { EffectComposer, EffectPass, RenderPass, BloomEffect, KernelSize } from 'postprocessing'
import { NOISE_GLSL } from './glsl.js'

/**
 * The Quantum Gravity Lattice.
 *
 * A 3D constellation grid of glowing chemical nodes and connection lines.
 * Wobbles under a Simplex curl field. The cursor acts as a quantum gravity well,
 * smoothly pulling and deforming the lattice in a localized bubble of gold glow.
 * Scrolling down sends a reaction wave through the lattice, dispersing it outward
 * to clear the text reading area while transmuting the color from Gold to Cyan and Reagent Green.
 *
 * Returns a controller: { setScroll(0..1), setHover(0..1), destroy() }.
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

  const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.set(0, 0, 3.8)

  // --- Grid Topology Generation ---------------------------------------------
  // We build a planar grid in 3D space, slightly curved, with connections.
  const GRID_W = isFull ? 18 : 10
  const GRID_H = isFull ? 18 : 10
  const totalNodes = GRID_W * GRID_H

  // Coordinates of grid points
  const nodes = []
  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      // Normalize to [-1.2, 1.2]
      const nx = ((x / (GRID_W - 1)) * 2 - 1) * 1.5
      const ny = ((y / (GRID_H - 1)) * 2 - 1) * 1.5
      const nz = (pseudoRandom(x * 12.3 + y * 7.9) - 0.5) * 0.15 // slight Z jitter
      nodes.push(new THREE.Vector3(nx, ny, nz))
    }
  }

  // --- Build Points Geometry ------------------------------------------------
  const nodePositions = new Float32Array(totalNodes * 3)
  const nodeRands = new Float32Array(totalNodes)
  for (let i = 0; i < totalNodes; i++) {
    nodePositions[i * 3 + 0] = nodes[i].x
    nodePositions[i * 3 + 1] = nodes[i].y
    nodePositions[i * 3 + 2] = nodes[i].z
    nodeRands[i] = pseudoRandom(i * 9.17 + 1.24)
  }

  const pointsGeometry = new THREE.BufferGeometry()
  pointsGeometry.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3))
  pointsGeometry.setAttribute('aRand', new THREE.BufferAttribute(nodeRands, 1))

  // --- Build Lines (Bonds) Geometry -----------------------------------------
  // Connect each grid node to its right and bottom neighbor
  const lineVertices = []
  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      const idx = y * GRID_W + x
      const nodeA = nodes[idx]

      // Connect right
      if (x < GRID_W - 1) {
        const nodeB = nodes[idx + 1]
        lineVertices.push(nodeA.x, nodeA.y, nodeA.z)
        lineVertices.push(nodeB.x, nodeB.y, nodeB.z)
      }
      // Connect down
      if (y < GRID_H - 1) {
        const nodeB = nodes[idx + GRID_W]
        lineVertices.push(nodeA.x, nodeA.y, nodeA.z)
        lineVertices.push(nodeB.x, nodeB.y, nodeB.z)
      }
    }
  }

  const linesPositions = new Float32Array(lineVertices)
  const linesGeometry = new THREE.BufferGeometry()
  linesGeometry.setAttribute('position', new THREE.BufferAttribute(linesPositions, 3))

  // Custom attributes for lines to pass a unique random per-vertex-pair for visual variance
  const linePairsCount = linesPositions.length / 6
  const lineRands = new Float32Array(linePairsCount * 2)
  for (let i = 0; i < linePairsCount; i++) {
    const r = pseudoRandom(i * 14.81 + 4.93)
    lineRands[i * 2 + 0] = r
    lineRands[i * 2 + 1] = r
  }
  linesGeometry.setAttribute('aRand', new THREE.BufferAttribute(lineRands, 1))

  // --- Shared Uniforms & Material Warp Formulas ----------------------------
  const uniforms = {
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uHover: { value: 0 },
    uMouse: { value: new THREE.Vector3(99, 99, 99) },
    uPixelRatio: { value: pixelRatio },
    uColorGold: { value: new THREE.Color(0xff9933) },  // gold
    uColorCyan: { value: new THREE.Color(0x38e1ff) },  // cyan
    uColorGreen: { value: new THREE.Color(0x1fe08a) }, // reagent green
  }

  // The vertex shader applied to BOTH points and lines in lockstep
  const sharedVertexShader = /* glsl */ `
    uniform float uTime, uScroll, uHover, uPixelRatio;
    uniform vec3 uMouse;
    attribute float aRand;
    varying float vMixY;
    varying float vMixScroll;
    varying float vGlow;
    varying float vAlpha;

    ${NOISE_GLSL}

    void main() {
      vec3 pos = position;

      // 1. Idle grid waving based on a combination of time and coordinates
      vec3 noise = ba_curl(pos * 0.65 + uTime * 0.05);
      pos += noise * 0.12;

      // 2. Quantum gravity well pull
      vec3 delta = pos - uMouse;
      float dist = length(delta);
      float radius = 1.35; // gravity radius
      float gravityForce = 0.0;
      if (dist < radius) {
        // Smooth gravity pull
        gravityForce = pow(1.0 - dist / radius, 2.0) * uHover;
        pos -= normalize(delta) * gravityForce * 0.38;
      }

      // 3. Scroll dispersion: particles explode outward and push to boundaries to leave content clear
      float scrollFactor = uScroll;
      // Disperse radially outward based on the normalized XY vector
      vec3 outward = vec3(pos.x, pos.y * 0.8, 0.0);
      float len = length(outward);
      if (len > 0.01) {
        pos += (outward / len) * scrollFactor * 1.6;
      }
      
      // Floating convection lift on scroll
      pos.y += scrollFactor * 0.25;

      // Outputs for the fragment shader
      vMixY = clamp((pos.y + 1.2) * 0.45, 0.0, 1.0);
      vMixScroll = scrollFactor;
      vGlow = gravityForce; // Feed gravity intensity into bloom/glow
      vAlpha = 1.0 - scrollFactor * 0.72; // fade slightly on scroll down

      vec4 mv = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mv;

      #ifdef IS_POINTS
        float size = 18.0 * (0.65 + aRand * 0.7) * uPixelRatio;
        // make nodes in gravity well bigger
        size *= (1.0 + gravityForce * 0.6);
        gl_PointSize = size * (1.0 / -mv.z);
      #endif
    }
  `

  // Points material
  const pointsMaterial = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    defines: { IS_POINTS: true },
    vertexShader: sharedVertexShader,
    fragmentShader: /* glsl */ `
      uniform vec3 uColorGold, uColorCyan, uColorGreen;
      varying float vMixY;
      varying float vMixScroll;
      varying float vGlow;
      varying float vAlpha;

      void main() {
        vec2 coord = gl_PointCoord - 0.5;
        float d = length(coord);
        if (d > 0.5) discard;
        float soft = smoothstep(0.5, 0.0, d);

        // Core base color: gold at the top, transmuting to cyan and green at the bottom
        vec3 col = mix(uColorGreen, uColorCyan, vMixY);
        col = mix(col, uColorGold, pow(vMixY, 1.4));

        // When scrolled, shift the lattice into a pure emerald/cyan reaction state
        col = mix(col, mix(uColorCyan, uColorGreen, 0.5), vMixScroll * 0.6);

        // Highlight nodes in the gravity well
        col = mix(col, uColorGold * 1.5, vGlow * 0.85);

        // Additive central glow spike
        col += pow(max(1.0 - d * 2.0, 0.0), 3.0) * (0.55 + vGlow * 1.5);

        gl_FragColor = vec4(col * soft * vAlpha, 1.0);
      }
    `
  })

  // Lines material
  const linesMaterial = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: sharedVertexShader,
    fragmentShader: /* glsl */ `
      uniform vec3 uColorGold, uColorCyan, uColorGreen;
      varying float vMixY;
      varying float vMixScroll;
      varying float vGlow;
      varying float vAlpha;

      void main() {
        // Core line color follows node scheme but is much softer to avoid cluttering
        vec3 col = mix(uColorGreen, uColorCyan, vMixY);
        col = mix(col, uColorGold, pow(vMixY, 1.4));

        // Shift color on scroll
        col = mix(col, uColorCyan, vMixScroll * 0.5);

        // Glowing gravity well highlight
        col = mix(col, uColorGold * 1.3, vGlow * 0.7);

        gl_FragColor = vec4(col * (0.16 + vGlow * 0.6) * vAlpha, 1.0);
      }
    `
  })

  const pointsMesh = new THREE.Points(pointsGeometry, pointsMaterial)
  const linesMesh = new THREE.LineSegments(linesGeometry, linesMaterial)

  scene.add(pointsMesh)
  scene.add(linesMesh)

  // --- Postprocessing (bloom on the full tier only) -------------------------
  let composer = null
  if (isFull) {
    composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    const bloom = new BloomEffect({
      intensity: 0.95, // Higher bloom for awesome neon grid lines!
      luminanceThreshold: 0.12,
      luminanceSmoothing: 0.5,
      mipmapBlur: true,
      kernelSize: KernelSize.LARGE,
    })
    composer.addPass(new EffectPass(camera, bloom))
  }

  // --- Layout: bias the lattice toward center-right on wide screens ----------
  function layout() {
    const w = window.innerWidth
    const h = window.innerHeight
    const aspect = w / h
    camera.aspect = aspect
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
    if (composer) composer.setSize(w, h)

    const offsetX = aspect > 1 ? THREE.MathUtils.clamp((aspect - 1) * 0.9, 0, 1.4) : 0
    pointsMesh.position.x = offsetX
    linesMesh.position.x = offsetX

    camera.position.z = aspect < 0.85 ? 4.4 : 3.8
  }
  layout()

  // --- Interaction (Quantum Gravity Raycast) --------------------------------
  const pointer = { x: 0, y: 0 }
  const pointerSmooth = { x: 0, y: 0 }
  let hoverTarget = 0
  let scrollTarget = 0

  const raycaster = new THREE.Raycaster()
  const mousePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0) // Z = 0 plane

  function onPointerMove(e) {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1
    hoverTarget = 1
  }
  const finePointer = window.matchMedia('(pointer: fine)').matches
  if (finePointer) window.addEventListener('pointermove', onPointerMove, { passive: true })

  // --- Render loop ----------------------------------------------------------
  const clock = new THREE.Clock()
  let raf = 0
  let running = true

  function frame() {
    if (!running) return
    raf = requestAnimationFrame(frame)
    const dt = Math.min(clock.getDelta(), 0.05)
    uniforms.uTime.value += dt

    pointerSmooth.x += (pointer.x - pointerSmooth.x) * 0.05
    pointerSmooth.y += (pointer.y - pointerSmooth.y) * 0.05
    uniforms.uHover.value += (hoverTarget - uniforms.uHover.value) * 0.05
    uniforms.uScroll.value += (scrollTarget - uniforms.uScroll.value) * 0.08
    hoverTarget *= 0.96

    // Raycast to find the 3D position on the Z=0 plane to apply gravity there
    raycaster.setFromCamera(pointerSmooth, camera)
    const target3D = new THREE.Vector3()
    raycaster.ray.intersectPlane(mousePlane, target3D)
    
    // Smoothly interpolate uMouse position
    uniforms.uMouse.value.lerp(target3D, 0.08)

    // Gentle global rotation
    const rotationY = uniforms.uTime.value * 0.02 + pointerSmooth.x * 0.15
    const rotationX = -pointerSmooth.y * 0.12

    pointsMesh.rotation.y = rotationY
    pointsMesh.rotation.x = rotationX
    linesMesh.rotation.y = rotationY
    linesMesh.rotation.x = rotationX

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
      pointsGeometry.dispose()
      linesGeometry.dispose()
      pointsMaterial.dispose()
      linesMaterial.dispose()
      if (scene.background && scene.background.dispose) scene.background.dispose()
      if (composer) composer.dispose()
      renderer.dispose()
    },
  }
}

/* Deterministic per-index pseudo-random */
function pseudoRandom(n) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return s - Math.floor(s)
}

/* Dark backdrop with gold (top-right) + green (bottom-left) glow */
function buildBackdrop() {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 512
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#0a0a0f'
  ctx.fillRect(0, 0, 512, 512)
  let g = ctx.createRadialGradient(370, 150, 0, 370, 150, 360)
  g.addColorStop(0, 'rgba(255,153,51,0.20)')
  g.addColorStop(1, 'rgba(255,153,51,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 512, 512)
  g = ctx.createRadialGradient(120, 410, 0, 120, 410, 340)
  g.addColorStop(0, 'rgba(0,225,138,0.12)')
  g.addColorStop(1, 'rgba(0,225,138,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 512, 512)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}
