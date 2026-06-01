import * as THREE from 'three'
// `postprocessing` (bloom) is imported dynamically below, ONLY on the full tier,
// so mobile/lite never downloads or parses it.

/**
 * The Catalytic Surface (chemistry-lab branch).
 *
 * A low-contrast crystalline grid plane viewed at a slight downward angle fills
 * the lower portion of the viewport. "Reactant" particles (cool gray) drift across
 * the surface; at a conversion threshold they FLASH and become "product" particles
 * (gold→green) that rise off the surface and fade — a live reaction on a catalyst.
 * You are the catalyst: the cursor is a hotspot that converts reactants early.
 *
 * Everything animates on the GPU (one Points draw + one grid mesh), so there are
 * no per-frame CPU loops. The whole reaction sits in the lower screen and the
 * particles fade before they reach the headline zone — the readability safeguard.
 *
 * Returns a controller: { setScroll(0..1), setReaction(0..1), setHover(0..1), destroy() }.
 *   - setScroll:   raises the global reaction rate + brightens the grid (hero → page).
 *   - setReaction: pushes product colour toward green/cyan + adds glow (driven at the CTA).
 *   - setHover:    general energy; the cursor also acts as a local catalyst hotspot.
 *
 * Tiers: 'full' — desktop: ~900 particles + bloom, DPR ≤ 2 · 'lite' — mobile: ~320, no bloom, DPR 1.
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
  scene.background = buildBackdrop() // dark, with a low glow near the surface

  const camera = new THREE.PerspectiveCamera(44, window.innerWidth / window.innerHeight, 0.1, 100)
  const camBase = new THREE.Vector3(0, 1.35, 3.4)
  camera.position.copy(camBase)
  camera.lookAt(0, 0.05, -3.6)

  // --- Catalytic grid plane (lower screen, low contrast) --------------------
  const planeGeo = new THREE.PlaneGeometry(60, 48)
  const gridUniforms = {
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uReaction: { value: 0 },
  }
  const planeMat = new THREE.ShaderMaterial({
    uniforms: gridUniforms,
    transparent: true,
    depthWrite: false,
    vertexShader: /* glsl */ `
      varying vec3 vWorld;
      void main(){
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorld = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      precision highp float;
      varying vec3 vWorld;
      uniform float uTime, uScroll, uReaction;
      void main(){
        // grid flows toward the camera (camera "travels" along the surface)
        vec2 g = vec2(vWorld.x, vWorld.z + uTime * 0.55 + uScroll * 4.0) * 0.62;
        vec2 cell = abs(fract(g) - 0.5);
        float m = max(cell.x, cell.y);
        float line = smoothstep(0.46, 0.5, m);
        // fade with distance: near = visible, far = gone
        float depth = clamp((vWorld.z + 20.0) / 20.0, 0.0, 1.0);
        float fade = depth * depth;
        vec3 base    = vec3(0.045, 0.055, 0.085);
        vec3 lineCol = mix(vec3(0.10, 0.14, 0.20), vec3(0.10, 0.34, 0.40), clamp(uScroll * 0.6 + uReaction * 0.5, 0.0, 1.0));
        vec3 col = mix(base, lineCol, line);
        float alpha = (0.05 + line * 0.40) * fade;
        gl_FragColor = vec4(col, alpha);
      }
    `,
  })
  const plane = new THREE.Mesh(planeGeo, planeMat)
  plane.rotation.x = -Math.PI / 2
  plane.position.y = 0
  plane.renderOrder = 0
  scene.add(plane)

  // --- Reactant → product particles (GPU lifecycle) -------------------------
  const COUNT = isFull ? 900 : 320
  const aLane = new Float32Array(COUNT)
  const aSeed = new Float32Array(COUNT)
  const aSpeed = new Float32Array(COUNT)
  const aOff = new Float32Array(COUNT)
  for (let i = 0; i < COUNT; i++) {
    aLane[i] = (pseudoRandom(i * 1.13) * 2 - 1) * 8.5
    aSeed[i] = pseudoRandom(i * 2.31 + 0.7)
    aSpeed[i] = 0.6 + pseudoRandom(i * 3.77 + 1.3) * 0.9
    aOff[i] = pseudoRandom(i * 5.19 + 2.9)
  }
  const pGeo = new THREE.BufferGeometry()
  // 'position' is required by Points but unused (real position is computed in the
  // shader from the attributes) — so disable frustum culling on the object.
  pGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(COUNT * 3), 3))
  pGeo.setAttribute('aLane', new THREE.BufferAttribute(aLane, 1))
  pGeo.setAttribute('aSeed', new THREE.BufferAttribute(aSeed, 1))
  pGeo.setAttribute('aSpeed', new THREE.BufferAttribute(aSpeed, 1))
  pGeo.setAttribute('aOff', new THREE.BufferAttribute(aOff, 1))

  const uniforms = {
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uReaction: { value: 0 },
    uHover: { value: 0 },
    uMouse: { value: new THREE.Vector2(100, 100) },
    uSize: { value: isFull ? 26 : 30 },
    uPixelRatio: { value: pixelRatio },
    uGray: { value: new THREE.Color(0x8a93a6) }, // reactant
    uGold: { value: new THREE.Color(0xffb15c) }, // product (catalyst gold)
    uGreen: { value: new THREE.Color(0x1fe08a) }, // product (reagent green)
    uCyan: { value: new THREE.Color(0x38e1ff) }, // product at full reaction
  }

  const pMat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      uniform float uTime, uScroll, uReaction, uHover, uSize, uPixelRatio;
      uniform vec2 uMouse;
      attribute float aLane, aSeed, aSpeed, aOff;
      varying float vConv;
      varying float vFlash;
      varying float vAlpha;
      varying float vSeed;
      void main(){
        float rate = 0.045 + uScroll * 0.085 + uHover * 0.02;
        float life = fract(aOff + uTime * rate * aSpeed);
        float z = mix(-16.0, 2.0, life);
        float x = aLane + sin(life * 6.2831 + aSeed * 6.2831) * 0.25;

        float conv = 0.5 + (aSeed - 0.5) * 0.06;
        // cursor = catalyst hotspot: nearby reactants convert earlier + flare
        float md = distance(vec2(x, z), uMouse);
        float hot = smoothstep(2.4, 0.0, md);
        conv -= hot * 0.22;

        float risen = clamp((life - conv) / (1.0 - conv), 0.0, 1.0);
        float y = risen * risen * 1.2; // rise after conversion

        vConv = smoothstep(conv - 0.01, conv + 0.05, life);
        vFlash = exp(-pow((life - conv) / 0.05, 2.0)); // bright spike at conversion
        vSeed = aSeed;
        vAlpha = smoothstep(0.0, 0.05, life) * (1.0 - smoothstep(0.78, 1.0, life));

        vec4 mv = modelViewMatrix * vec4(x, y, z, 1.0);
        gl_Position = projectionMatrix * mv;
        float sz = uSize * (0.55 + aSeed * 0.7) * (1.0 + vConv * 0.5 + hot * 1.6);
        gl_PointSize = sz * uPixelRatio * (1.0 / -mv.z);
      }
    `,
    fragmentShader: /* glsl */ `
      precision highp float;
      uniform vec3 uGray, uGold, uGreen, uCyan;
      uniform float uReaction;
      varying float vConv, vFlash, vAlpha, vSeed;
      void main(){
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        if (d > 0.5) discard;
        float soft = smoothstep(0.5, 0.0, d);
        vec3 prodBase = mix(uGold, uGreen, vSeed);          // product varies gold↔green
        vec3 prod = mix(prodBase, uCyan, uReaction * 0.5);  // → cyan as the reaction completes
        vec3 col = mix(uGray, prod, vConv);
        col += vFlash * 1.4;                                // conversion flash (feeds bloom)
        col += pow(max(1.0 - d * 2.0, 0.0), 3.0) * 0.5;     // soft core
        gl_FragColor = vec4(col, soft * vAlpha);
      }
    `,
  })

  const points = new THREE.Points(pGeo, pMat)
  points.renderOrder = 1
  points.frustumCulled = false
  scene.add(points)

  // --- Postprocessing (bloom on the full tier only, loaded on demand) -------
  let composer = null
  if (isFull) {
    import('postprocessing')
      .then(({ EffectComposer, EffectPass, RenderPass, BloomEffect, KernelSize }) => {
        const cmp = new EffectComposer(renderer)
        cmp.addPass(new RenderPass(scene, camera))
        cmp.addPass(new EffectPass(camera, new BloomEffect({
          intensity: 0.55,
          luminanceThreshold: 0.55,
          luminanceSmoothing: 0.4,
          mipmapBlur: true,
          kernelSize: KernelSize.LARGE,
        })))
        cmp.setSize(window.innerWidth, window.innerHeight)
        composer = cmp
      })
      .catch((err) => console.warn('[Brand-Alchemy] bloom unavailable:', err))
  }

  // --- Layout ---------------------------------------------------------------
  function layout() {
    const w = window.innerWidth
    const h = window.innerHeight
    const aspect = w / h
    camera.aspect = aspect
    // On portrait screens lift the camera + widen FOV so the surface still reads.
    camBase.set(0, aspect < 0.9 ? 1.7 : 1.35, aspect < 0.9 ? 3.9 : 3.4)
    camera.fov = aspect < 0.9 ? 52 : 44
    camera.position.copy(camBase)
    camera.lookAt(0, 0.05, -3.6)
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
    if (composer) composer.setSize(w, h)
  }
  layout()

  // --- Interaction: cursor → plane intersection (catalyst hotspot) ----------
  const pointer = { x: 0, y: 0 }
  const pointerSmooth = { x: 0, y: 0 }
  const ray = new THREE.Raycaster()
  const ndc = new THREE.Vector2()
  const mouseTarget = new THREE.Vector2(100, 100)
  let hoverTarget = 0
  let scrollTarget = 0
  let reactionTarget = 0

  function onPointerMove(e) {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1
    ndc.set(pointer.x, -pointer.y)
    ray.setFromCamera(ndc, camera)
    const o = ray.ray.origin
    const dir = ray.ray.direction
    if (Math.abs(dir.y) > 1e-4) {
      const t = -o.y / dir.y
      if (t > 0 && t < 60) mouseTarget.set(o.x + dir.x * t, o.z + dir.z * t)
    }
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
    const t = clock.elapsedTime
    uniforms.uTime.value = t
    gridUniforms.uTime.value = t

    pointerSmooth.x += (pointer.x - pointerSmooth.x) * 0.045
    pointerSmooth.y += (pointer.y - pointerSmooth.y) * 0.045
    uniforms.uHover.value += (hoverTarget - uniforms.uHover.value) * 0.05
    uniforms.uScroll.value += (scrollTarget - uniforms.uScroll.value) * 0.08
    uniforms.uReaction.value += (reactionTarget - uniforms.uReaction.value) * 0.06
    gridUniforms.uScroll.value = uniforms.uScroll.value
    gridUniforms.uReaction.value = uniforms.uReaction.value
    uniforms.uMouse.value.x += (mouseTarget.x - uniforms.uMouse.value.x) * 0.12
    uniforms.uMouse.value.y += (mouseTarget.y - uniforms.uMouse.value.y) * 0.12
    hoverTarget *= 0.96

    // subtle cursor parallax on the camera (kept small so the surface stays steady)
    camera.position.x = camBase.x + pointerSmooth.x * 0.18
    camera.position.y = camBase.y - pointerSmooth.y * 0.10
    camera.lookAt(0, 0.05, -3.6)

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
      planeGeo.dispose()
      planeMat.dispose()
      pGeo.dispose()
      pMat.dispose()
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

/* Dark backdrop with a soft glow low on the screen (light off the catalytic
   surface), keeping the upper area near-black so headline text stays legible.
   Matches the CSS gradient fallback in main.css. */
function buildBackdrop() {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 512
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#08090e'
  ctx.fillRect(0, 0, 512, 512)
  let g = ctx.createRadialGradient(256, 480, 0, 256, 480, 320)
  g.addColorStop(0, 'rgba(255,153,51,0.16)')
  g.addColorStop(1, 'rgba(255,153,51,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 512, 512)
  g = ctx.createRadialGradient(90, 470, 0, 90, 470, 300)
  g.addColorStop(0, 'rgba(31,224,138,0.13)')
  g.addColorStop(1, 'rgba(31,224,138,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 512, 512)
  g = ctx.createRadialGradient(430, 450, 0, 430, 450, 280)
  g.addColorStop(0, 'rgba(56,225,255,0.09)')
  g.addColorStop(1, 'rgba(56,225,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 512, 512)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}
