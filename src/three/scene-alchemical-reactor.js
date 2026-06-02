import * as THREE from 'three'
import { EffectComposer, EffectPass, RenderPass, BloomEffect, KernelSize } from 'postprocessing'
import { NOISE_GLSL } from './glsl.js'

/**
 * Concept C: The Alchemical Reactor (Interactive Shader Fluid)
 * 
 * An immersive WebGL environment featuring a volumetric gaseous FBM nebula
 * with active mouse color cascades (converting gold to green/cyan) and glowing
 * reactant sparks emitted dynamically along the cursor's speed trails.
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
  scene.background = null

  const camera = new THREE.PerspectiveCamera(36, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.set(0, 0, 3.6)

  // A 3D group that rotates slightly with the cursor to give beautiful atmospheric parallax
  const reactorGroup = new THREE.Group()
  scene.add(reactorGroup)

  // --- 1. Background Volumetric Gaseous Fluid (FBM Quad) --------------------
  const bgUniforms = {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uHover: { value: 0 },
    uScroll: { value: 0 },
    uAspect: { value: window.innerWidth / window.innerHeight },
    uColorGold: { value: new THREE.Color(0xff9933) },   // Core brand gold
    uColorGreen: { value: new THREE.Color(0x1fe08a) },  // Vibrant reagent green
    uColorCyan: { value: new THREE.Color(0x38e1ff) },   // Glowing chemical cyan
    uIsLite: { value: !isFull ? 1.0 : 0.0 }
  }

  const bgMaterial = new THREE.ShaderMaterial({
    uniforms: bgUniforms,
    depthWrite: false,
    transparent: true,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uHover;
      uniform float uScroll;
      uniform float uAspect;
      uniform vec3 uColorGold;
      uniform vec3 uColorGreen;
      uniform vec3 uColorCyan;
      uniform float uIsLite;
      varying vec2 vUv;

      ${NOISE_GLSL}

      // Volumetric multi-octave FBM for gaseous smoke flow
      float fbm(vec3 p) {
        float value = 0.0;
        float amplitude = 0.55;
        float frequency = 1.0;
        
        // Mobile gets 2 octaves, Desktop gets 4 octaves for optimal performance/wow trade-off
        int octaves = uIsLite > 0.5 ? 2 : 4;
        for (int i = 0; i < 4; i++) {
          if (i >= octaves) break;
          value += amplitude * ba_snoise(p * frequency);
          p.xy += vec2(value * 0.15, -value * 0.08); // warp coordinates organically
          frequency *= 2.0;
          amplitude *= 0.5;
        }
        return value;
      }

      void main() {
        // Adjust coordinates for perfect aspect ratio circular calculations
        vec2 aspectUv = vUv;
        aspectUv.x *= uAspect;
        
        vec2 aspectMouse = uMouse * 0.5 + 0.5;
        aspectMouse.x *= uAspect;

        // Localized interactive distance
        float dist = distance(aspectUv, aspectMouse);

        // Core gaseous domain warping
        vec3 warpCoord = vec3(vUv * 1.6 - 0.8, uTime * 0.024);
        
        // Multi-octave FBM smoke layer
        float noise = fbm(warpCoord + fbm(warpCoord * 1.8 - uTime * 0.015) * 0.4);
        float smokeVal = clamp((noise + 0.9) * 0.5, 0.0, 1.0);
        smokeVal = pow(smokeVal, 1.3);

        // Base background dark space (fades down as scroll increases)
        float scrollFade = 1.0 - uScroll * 0.65;
        vec3 darkBackground = vec3(0.0);

        // Colors mapping to chemical states - boosted for maximum visual pop
        vec3 goldAtm = mix(darkBackground, uColorGold * 0.85, smokeVal);
        vec3 greenAtm = mix(darkBackground, uColorGreen * 0.95, smokeVal);
        vec3 cyanAtm = mix(darkBackground, uColorCyan * 1.0, smokeVal);

        // Smooth color cascade right under the cursor
        float cascade = smoothstep(0.55, 0.02, dist) * uHover;
        
        // Shifting smoke color: gold -> green -> cyan highlights in the focal zone
        vec3 convertedAtm = mix(greenAtm, cyanAtm, smoothstep(0.18, 0.02, dist));
        vec3 finalAtm = mix(goldAtm, convertedAtm, cascade);

        // Add soft reactor background glow under the cursor
        float coreGlow = smoothstep(0.3, 0.0, dist) * uHover;
        finalAtm += mix(uColorGreen, uColorCyan, 0.5) * coreGlow * 0.35;

        // Volumetric alpha mask to ensure we stay delicate and text remains highly readable
        float alpha = smokeVal * (0.35 + uHover * 0.15) * scrollFade;

        gl_FragColor = vec4(finalAtm * alpha, alpha);
      }
    `,
  })

  // Full-screen quad positioned at a depth where it covers the viewport perfectly
  const bgGeometry = new THREE.PlaneGeometry(2, 2)
  const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial)
  bgMesh.frustumCulled = false
  // bgMesh bypasses parent transform matrix (remains full screen) but reacts to aspects
  scene.add(bgMesh)

  // --- 2. Dynamic Reactant Sparks Point Cloud -------------------------------
  const maxSparks = isFull ? 800 : 150
  const sparkPositions = new Float32Array(maxSparks * 3)
  const sparkColors = new Float32Array(maxSparks * 3)
  const sparkSizes = new Float32Array(maxSparks)
  const sparkAges = new Float32Array(maxSparks)

  // Initialize off-screen/inactive
  for (let i = 0; i < maxSparks; i++) {
    sparkPositions[i * 3 + 0] = -9999
    sparkPositions[i * 3 + 1] = -9999
    sparkPositions[i * 3 + 2] = -9999
    sparkAges[i] = 0.0
  }

  const sparkGeometry = new THREE.BufferGeometry()
  sparkGeometry.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3))
  sparkGeometry.setAttribute('aColor', new THREE.BufferAttribute(sparkColors, 3))
  sparkGeometry.setAttribute('aSize', new THREE.BufferAttribute(sparkSizes, 1))
  sparkGeometry.setAttribute('aAge', new THREE.BufferAttribute(sparkAges, 1))

  const sparkMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uPixelRatio: { value: pixelRatio },
    },
    vertexShader: /* glsl */ `
      uniform float uPixelRatio;
      attribute vec3 aColor;
      attribute float aSize;
      attribute float aAge;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vColor = aColor;
        // Fade out sparks smoothly as they age
        vAlpha = smoothstep(0.0, 0.35, aAge) * aAge;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = aSize * vAlpha * uPixelRatio * (1.0 / -mv.z);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        if (d > 0.5) discard;
        float soft = smoothstep(0.5, 0.0, d);
        // Pure hot-white spark core fading into the conversion colors
        vec3 col = mix(vColor, vec3(1.0), pow(max(1.0 - d * 2.0, 0.0), 3.5));
        gl_FragColor = vec4(col * soft * vAlpha * 0.95, 1.0);
      }
    `
  })

  const sparksPoints = new THREE.Points(sparkGeometry, sparkMaterial)
  reactorGroup.add(sparksPoints)

  // Spark state tracking
  class SparkState {
    constructor() {
      this.x = 0
      this.y = 0
      this.z = 0
      this.vx = 0
      this.vy = 0
      this.vz = 0
      this.life = 0
      this.maxLife = 1.0
      this.size = 1.0
      this.color = new THREE.Color()
    }
  }

  const sparksPool = Array.from({ length: maxSparks }, () => new SparkState())
  let nextSparkIndex = 0

  function spawnSpark(x, y) {
    const s = sparksPool[nextSparkIndex]
    const angle = Math.random() * Math.PI * 2
    const speed = 0.4 + Math.random() * 1.2
    
    // Position slightly randomized under pointer
    s.x = x + (Math.random() - 0.5) * 0.06
    s.y = y + (Math.random() - 0.5) * 0.06
    s.z = (Math.random() - 0.5) * 0.15

    // Drift velocity: upwards drift + radial push
    s.vx = Math.cos(angle) * speed * 0.5
    s.vy = Math.sin(angle) * speed * 0.4 + 1.2 // steady upward flow
    s.vz = (Math.random() - 0.5) * 0.4

    s.maxLife = 0.5 + Math.random() * 0.7
    s.life = s.maxLife
    s.size = 18 + Math.random() * 26

    // Spawn colors matching the chemical reactor conversion theme
    const r = Math.random()
    if (r < 0.25) {
      s.color.setHex(0xff9933) // deep reactor gold
    } else if (r < 0.65) {
      s.color.setHex(0x1fe08a) // reagent green
    } else {
      s.color.setHex(0x38e1ff) // cyan spark
    }

    // Write to BufferAttributes immediately at birth
    sparkColors[nextSparkIndex * 3 + 0] = s.color.r
    sparkColors[nextSparkIndex * 3 + 1] = s.color.g
    sparkColors[nextSparkIndex * 3 + 2] = s.color.b
    sparkSizes[nextSparkIndex] = s.size
    sparkAges[nextSparkIndex] = 1.0
    sparkGeometry.attributes.aColor.needsUpdate = true
    sparkGeometry.attributes.aSize.needsUpdate = true

    nextSparkIndex = (nextSparkIndex + 1) % maxSparks
  }

  // --- Postprocessing (bloom on the full tier only) -------------------------
  let composer = null
  if (isFull) {
    composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    const bloom = new BloomEffect({
      intensity: 0.82, // Boosted slightly to make shader nebula and sparks pop beautifully
      luminanceThreshold: 0.22,
      luminanceSmoothing: 0.35,
      mipmapBlur: true,
      kernelSize: KernelSize.LARGE,
    })
    composer.addPass(new EffectPass(camera, bloom))
  }

  // --- Responsive Layout ----------------------------------------------------
  function layout() {
    const w = window.innerWidth
    const h = window.innerHeight
    const aspect = w / h
    camera.aspect = aspect
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
    if (composer) composer.setSize(w, h)
    bgUniforms.uAspect.value = aspect

    // Position reactor elements beautifully based on aspect ratio
    const frustumH = 2.0 * Math.tan((camera.fov * Math.PI) / 360.0) * camera.position.z
    const frustumW = frustumH * aspect
    
    // Shift slightly on desktop to frame the hero copy nicely
    const offsetX = aspect > 1.0 ? THREE.MathUtils.clamp((aspect - 1.0) * 0.9, 0, 1.4) : 0
    reactorGroup.position.x = offsetX
    camera.position.z = aspect < 0.85 ? 4.5 : 3.6
  }
  layout()

  // --- Pointer Move, Drag, and Velocity Spark Spawning ----------------------
  const pointer = { x: 0, y: 0 }
  const pointerSmooth = { x: 0, y: 0 }
  const lastPointer = { x: 0, y: 0 }
  let hoverTarget = 0
  let scrollTarget = 0

  function onPointerMove(e) {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1 // Y goes up standard WebGL
    hoverTarget = 1.0

    // Measure cursor velocity to emit spark trails
    const dx = pointer.x - lastPointer.x
    const dy = pointer.y - lastPointer.y
    const speed = Math.sqrt(dx * dx + dy * dy)

    if (speed > 0.006) {
      // Find 3D space spawn coordinates based on camera frustum at focal plane z=0
      const aspect = window.innerWidth / window.innerHeight
      const frustumH = 2.0 * Math.tan((camera.fov * Math.PI) / 360.0) * camera.position.z
      const frustumW = frustumH * aspect
      const spawnX = (pointer.x * frustumW) / 2 - reactorGroup.position.x
      const spawnY = (pointer.y * frustumH) / 2

      // Spawn sparks proportional to mouse speed
      const numSparks = Math.min(Math.floor(speed * 320), 8)
      for (let i = 0; i < numSparks; i++) {
        spawnSpark(spawnX, spawnY)
      }
    }

    lastPointer.x = pointer.x
    lastPointer.y = pointer.y
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true })

  // --- Frame Render Loop ----------------------------------------------------
  const clock = new THREE.Clock()
  let raf = 0
  let running = true

  function frame() {
    if (!running) return
    raf = requestAnimationFrame(frame)
    const dt = Math.min(clock.getDelta(), 0.05)
    
    bgUniforms.uTime.value += dt

    // Interpolate pointer move for silky organic parallax and color shifts
    pointerSmooth.x += (pointer.x - pointerSmooth.x) * 0.045
    pointerSmooth.y += (pointer.y - pointerSmooth.y) * 0.045

    bgUniforms.uMouse.value.copy(pointerSmooth)
    bgUniforms.uHover.value += (hoverTarget - bgUniforms.uHover.value) * 0.05
    bgUniforms.uScroll.value += (scrollTarget - bgUniforms.uScroll.value) * 0.08
    
    // Naturally decay pointer trigger state when cursor stops moving
    hoverTarget *= 0.965

    // Parallax rotation of the interactive reactor group
    reactorGroup.rotation.y = pointerSmooth.x * 0.08
    reactorGroup.rotation.x = pointerSmooth.y * 0.06

    // Update sparks simulation
    for (let i = 0; i < maxSparks; i++) {
      const s = sparksPool[i]
      if (s.life > 0) {
        s.life -= dt
        if (s.life <= 0) {
          s.life = 0
          sparkPositions[i * 3 + 0] = -9999
          sparkPositions[i * 3 + 1] = -9999
          sparkPositions[i * 3 + 2] = -9999
          continue
        }

        // Apply simple physics: upward flow, resistance, wavy drift
        s.vy += dt * 0.6 // accelerate up
        s.vx += Math.sin(s.y * 4.0 + bgUniforms.uTime.value) * dt * 0.35 // curl drift

        s.x += s.vx * dt
        s.y += s.vy * dt
        s.z += s.vz * dt

        sparkPositions[i * 3 + 0] = s.x
        sparkPositions[i * 3 + 1] = s.y
        sparkPositions[i * 3 + 2] = s.z

        sparkAges[i] = s.life / s.maxLife
      } else {
        sparkPositions[i * 3 + 0] = -9999
        sparkPositions[i * 3 + 1] = -9999
        sparkPositions[i * 3 + 2] = -9999
      }
    }

    sparkGeometry.attributes.position.needsUpdate = true
    sparkGeometry.attributes.aAge.needsUpdate = true

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
      bgGeometry.dispose()
      bgMaterial.dispose()
      sparkGeometry.dispose()
      sparkMaterial.dispose()
      if (scene.background && scene.background.dispose) scene.background.dispose()
      if (composer) composer.dispose()
      renderer.dispose()
    },
  }
}

/* Background gradient canvas backup */
function buildBackdrop() {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 256
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#08080c'
  ctx.fillRect(0, 0, 256, 256)
  
  let g = ctx.createRadialGradient(180, 70, 0, 180, 70, 180)
  g.addColorStop(0, 'rgba(255,153,51,0.06)')
  g.addColorStop(1, 'rgba(255,153,51,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}
