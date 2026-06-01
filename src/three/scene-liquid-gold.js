import * as THREE from 'three'
// `postprocessing` (bloom) is imported dynamically below, ONLY on the full tier,
// so mobile/lite never downloads or parses it.

/**
 * Liquid Gold / Mercury Flow (chemistry-lab branch).
 *
 * A pool of molten metal sits along the bottom of the viewport — viscous, mirror-
 * bright, gold transmuting toward emerald/cyan. It oozes with heavy inertia: slow
 * surface waves, drifting specular streaks, and a glowing meniscus line at the
 * surface. Scrolling raises the level and makes the surface more reflective; the
 * final CTA shifts it green/cyan (the "product"). The cursor leaves a single soft
 * dimple that fills back in — gentle and local, never a field-wide cascade.
 *
 * Implemented as ONE full-screen fragment shader (a 2-D height-field), so it's
 * cheap and rock-steady — no 3-D scene, no per-particle work, no mouse cascade.
 * It stays anchored to the bottom, leaving the whole upper screen clear for text.
 *
 * Returns the standard controller: { setScroll(0..1), setReaction(0..1), setHover(0..1), destroy() }
 * so main.js / scroll.js (reaction-progress scroll + bar) need no changes.
 *
 * Tiers: 'full' — desktop: + bloom, DPR ≤ 2 · 'lite' — mobile: no bloom, DPR 1.
 *
 * (The previous "Catalytic Surface" background is preserved in
 *  src/three/scene-catalytic-surface.js — copy it back over this file to restore it.)
 */
export function mountScene(canvas, { tier = 'full' } = {}) {
  const isFull = tier === 'full'

  let renderer
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false, // full-screen shader — AA is irrelevant, save the cost
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
  scene.background = buildBackdrop() // near-black with a faint warm floor glow
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

  const uniforms = {
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uReaction: { value: 0 },
    uHover: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.0) },
    uAspect: { value: window.innerWidth / Math.max(1, window.innerHeight) },
    uGold: { value: new THREE.Color(0xffb15c) },
    uGreen: { value: new THREE.Color(0x1fe08a) },
    uCyan: { value: new THREE.Color(0x38e1ff) },
    uDeep: { value: new THREE.Color(0x07120c) },
  }

  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main(){
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0); // full-screen clip-space quad
      }
    `,
    fragmentShader: /* glsl */ `
      precision highp float;
      varying vec2 vUv;
      uniform float uTime, uScroll, uReaction, uHover, uAspect;
      uniform vec2 uMouse;
      uniform vec3 uGold, uGreen, uCyan, uDeep;

      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
      float noise(vec2 p){
        vec2 i = floor(p); vec2 f = fract(p);
        float a = hash(i), b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
      }

      void main(){
        float x = vUv.x;
        // base level rises as you scroll; product reaction nudges it a touch higher
        float level = 0.15 + uScroll * 0.20 + uReaction * 0.04;
        // viscous surface: slow low-frequency waves + a little drifting noise
        float w = sin(x * 6.0 + uTime * 0.55) * 0.011
                + sin(x * 11.0 - uTime * 0.42) * 0.006
                + (noise(vec2(x * 3.0, uTime * 0.14)) - 0.5) * 0.012;
        // gentle, local cursor dimple — eased + gated by hover so it never cascades
        float mdx = (x - uMouse.x) * uAspect;
        float dip = exp(-mdx * mdx * 7.0) * 0.020 * smoothstep(0.0, 0.2, uHover);
        float surface = level + w - dip;

        float below = surface - vUv.y; // > 0 inside the liquid

        if (below < 0.0){
          // above the surface: a soft glow rising off the metal, otherwise transparent
          float ag = exp(-pow((vUv.y - surface) / 0.11, 2.0)) * 0.13;
          vec3 gcol = mix(uGold, mix(uGreen, uCyan, uReaction), uReaction);
          gl_FragColor = vec4(gcol * ag, ag);
          return;
        }

        float depth = clamp(below, 0.0, 1.0);
        // molten gradient: bright metal at the surface → dark deep
        vec3 surfCol = mix(uGold, uCyan, uReaction * 0.55);
        surfCol = mix(surfCol, uGreen, smoothstep(0.0, 0.5, depth) * 0.45);
        vec3 col = mix(surfCol, uDeep, smoothstep(0.0, 0.40, depth));

        // drifting specular streaks — reflective "mercury/gold"; more mirror-like with scroll
        float streak = sin(x * 22.0 + sin(x * 5.0 + uTime * 0.5) * 2.0 - uTime * 0.8);
        streak = pow(max(streak, 0.0), 6.0);
        float reflectivity = 0.32 + uScroll * 0.4;
        col += streak * reflectivity * (1.0 - depth * 1.5) * mix(uGold, uCyan, uReaction);

        // bright meniscus highlight right at the surface line (feeds bloom)
        float edge = exp(-pow((vUv.y - surface) / 0.0055, 2.0));
        col += edge * 1.3 * mix(uGold, uCyan, uReaction * 0.5);

        col *= (0.82 + 0.18 * depth);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  })

  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material)
  quad.frustumCulled = false
  scene.add(quad)

  // --- Postprocessing (bloom on the full tier only, loaded on demand) -------
  let composer = null
  if (isFull) {
    import('postprocessing')
      .then(({ EffectComposer, EffectPass, RenderPass, BloomEffect, KernelSize }) => {
        const cmp = new EffectComposer(renderer)
        cmp.addPass(new RenderPass(scene, camera))
        cmp.addPass(new EffectPass(camera, new BloomEffect({
          intensity: 0.7,
          luminanceThreshold: 0.6,
          luminanceSmoothing: 0.45,
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
    renderer.setSize(w, h)
    if (composer) composer.setSize(w, h)
    uniforms.uAspect.value = w / Math.max(1, h)
  }
  layout()

  // --- Interaction (a single gentle dimple; heavily eased) ------------------
  const mouseTarget = new THREE.Vector2(0.5, 0.0)
  let hoverTarget = 0
  let scrollTarget = 0
  let reactionTarget = 0

  function onPointerMove(e) {
    mouseTarget.set(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight)
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
    clock.getDelta()
    uniforms.uTime.value = clock.elapsedTime

    uniforms.uHover.value += (hoverTarget - uniforms.uHover.value) * 0.05
    uniforms.uScroll.value += (scrollTarget - uniforms.uScroll.value) * 0.08
    uniforms.uReaction.value += (reactionTarget - uniforms.uReaction.value) * 0.06
    uniforms.uMouse.value.x += (mouseTarget.x - uniforms.uMouse.value.x) * 0.05
    uniforms.uMouse.value.y += (mouseTarget.y - uniforms.uMouse.value.y) * 0.05
    hoverTarget *= 0.94

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
      quad.geometry.dispose()
      material.dispose()
      if (scene.background && scene.background.dispose) scene.background.dispose()
      if (composer) composer.dispose()
      renderer.dispose()
    },
  }
}

/* Near-black backdrop with a faint warm glow along the bottom (ambient light off
   the molten pool), keeping the upper screen dark so headline text stays legible.
   Matches the CSS gradient fallback in main.css. */
function buildBackdrop() {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 512
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#08090e'
  ctx.fillRect(0, 0, 512, 512)
  let g = ctx.createRadialGradient(256, 512, 0, 256, 512, 330)
  g.addColorStop(0, 'rgba(255,153,51,0.16)')
  g.addColorStop(1, 'rgba(255,153,51,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 512, 512)
  g = ctx.createRadialGradient(120, 500, 0, 120, 500, 260)
  g.addColorStop(0, 'rgba(31,224,138,0.10)')
  g.addColorStop(1, 'rgba(31,224,138,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 512, 512)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}
