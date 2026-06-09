// Lazy reels: swap poster → muted looping <video> only while on screen, pause
// (and keep decode cheap) when off screen. The overlay word animation is pure
// CSS, driven by --clip (= the clip's real duration) so word and loop stay in step.

export function initReels() {
  const reels = [...document.querySelectorAll('.reel[data-video]')]
  if (!reels.length || !('IntersectionObserver' in window)) return

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) play(e.target)
      else pause(e.target)
    }
  }, { rootMargin: '150px 0px', threshold: 0.25 })

  reels.forEach((f) => io.observe(f))
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) reels.forEach(pause)
  })
}

function play(fig) {
  let v = fig.querySelector('video')
  if (!v) v = upgrade(fig)
  const p = v.play()
  if (p && p.catch) p.catch(() => {}) // autoplay can be refused; poster remains
}

function pause(fig) {
  const v = fig.querySelector('video')
  if (v) { v.pause(); fig.classList.remove('is-playing') }
}

function upgrade(fig) {
  const v = document.createElement('video')
  v.className = 'reel__video'
  v.muted = true
  v.loop = true
  v.playsInline = true
  v.preload = 'metadata'
  v.setAttribute('muted', '')
  v.setAttribute('playsinline', '')
  const poster = fig.querySelector('.reel__poster')
  if (poster) v.poster = poster.currentSrc || poster.src

  const source = document.createElement('source')
  source.src = fig.dataset.video
  source.type = 'video/mp4'
  v.appendChild(source)

  v.addEventListener('loadedmetadata', () => {
    if (v.duration && isFinite(v.duration)) fig.style.setProperty('--clip', v.duration.toFixed(2) + 's')
  })
  v.addEventListener('playing', () => fig.classList.add('is-playing'), { once: true })

  // insert above the poster, below the gradient/word/caption
  poster ? poster.after(v) : fig.prepend(v)
  return v
}

// Count up numeric stats when they scroll into view (e.g. 5.0, 4, 7).
export function initCountUp() {
  const nums = [...document.querySelectorAll('.stats__n')]
    .filter((el) => !isNaN(parseFloat(el.textContent)))
  if (!nums.length || !('IntersectionObserver' in window)) return

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue
      animate(e.target)
      io.unobserve(e.target)
    }
  }, { threshold: 0.6 })
  nums.forEach((el) => io.observe(el))
}

function animate(el) {
  const target = parseFloat(el.textContent)
  const decimals = (el.textContent.split('.')[1] || '').length
  const dur = 1100
  const t0 = performance.now()
  const tick = (t) => {
    const k = Math.min(1, (t - t0) / dur)
    const eased = 1 - Math.pow(1 - k, 3)
    el.textContent = (target * eased).toFixed(decimals)
    if (k < 1) requestAnimationFrame(tick)
    else el.textContent = target.toFixed(decimals)
  }
  requestAnimationFrame(tick)
}
