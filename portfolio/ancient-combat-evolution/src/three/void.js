// The hero "void" — a field of gold embers drifting up through the dark, with
// subtle pointer parallax. Renders ONLY while the hero is on screen and the tab
// is visible. Dynamic-imported on the 'full' tier after idle (Three.js is heavy).

import {
  Scene, PerspectiveCamera, WebGLRenderer, BufferGeometry, BufferAttribute,
  PointsMaterial, Points, AdditiveBlending, CanvasTexture, Color, Vector2,
} from 'three'

export function initVoid(mountSelector = '.hero__void') {
  const mount = document.querySelector(mountSelector)
  if (!mount) return () => {}
  const hero = document.querySelector('.hero') || mount

  const COUNT = 2200            // well under the 5000 desktop cap
  const RX = 44, RY = 30, RZ = 26

  const scene = new Scene()
  const camera = new PerspectiveCamera(55, 1, 0.1, 100)
  camera.position.z = 24

  const renderer = new WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
  const canvas = renderer.domElement
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;'
  canvas.setAttribute('aria-hidden', 'true')
  mount.appendChild(canvas)

  const pos = new Float32Array(COUNT * 3)
  const spd = new Float32Array(COUNT)
  for (let i = 0; i < COUNT; i++) {
    pos[i * 3] = (Math.random() - 0.5) * RX
    pos[i * 3 + 1] = (Math.random() - 0.5) * RY
    pos[i * 3 + 2] = (Math.random() - 0.5) * RZ
    spd[i] = 0.5 + Math.random() * 1.7
  }
  const geo = new BufferGeometry()
  geo.setAttribute('position', new BufferAttribute(pos, 3))
  const mat = new PointsMaterial({
    size: 0.18, map: emberSprite(), color: new Color('#d4af37'),
    transparent: true, blending: AdditiveBlending, depthWrite: false,
    opacity: 0.85, sizeAttenuation: true,
  })
  const points = new Points(geo, mat)
  scene.add(points)

  const ptr = new Vector2(), ptrTarget = new Vector2()
  const onMove = (e) => {
    ptrTarget.set((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1)
  }
  window.addEventListener('pointermove', onMove, { passive: true })

  const resize = () => {
    const w = mount.clientWidth || innerWidth
    const h = mount.clientHeight || innerHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(mount)

  const arr = geo.attributes.position.array
  let raf = 0, running = false, t = 0

  const frame = () => {
    raf = requestAnimationFrame(frame)
    t += 0.016
    for (let i = 0; i < COUNT; i++) {
      let y = arr[i * 3 + 1] + spd[i] * 0.03
      if (y > RY / 2) { y = -RY / 2; arr[i * 3] = (Math.random() - 0.5) * RX }
      arr[i * 3 + 1] = y
    }
    geo.attributes.position.needsUpdate = true
    points.rotation.y = Math.sin(t * 0.05) * 0.06
    ptr.lerp(ptrTarget, 0.05)
    camera.position.x = ptr.x * 3
    camera.position.y = -ptr.y * 2
    camera.lookAt(0, 0, 0)
    renderer.render(scene, camera)
  }
  const start = () => { if (!running) { running = true; raf = requestAnimationFrame(frame) } }
  const stop = () => { running = false; cancelAnimationFrame(raf) }

  const inView = () => { const r = hero.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight }
  const vis = new IntersectionObserver(
    (es) => { es[0].isIntersecting && !document.hidden ? start() : stop() },
    { threshold: 0.01 }
  )
  vis.observe(hero)
  document.addEventListener('visibilitychange', () => { document.hidden ? stop() : (inView() && start()) })

  return () => {
    stop(); ro.disconnect(); vis.disconnect()
    window.removeEventListener('pointermove', onMove)
    geo.dispose(); mat.dispose(); mat.map?.dispose(); renderer.dispose()
    canvas.remove()
  }
}

function emberSprite() {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  grd.addColorStop(0, 'rgba(255,250,235,1)')
  grd.addColorStop(0.3, 'rgba(245,196,81,0.85)')
  grd.addColorStop(1, 'rgba(245,196,81,0)')
  g.fillStyle = grd
  g.fillRect(0, 0, 64, 64)
  return new CanvasTexture(c)
}
