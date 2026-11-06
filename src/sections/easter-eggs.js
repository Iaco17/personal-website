import { gsap } from 'gsap'

// Hidden extras, deliberately without any on-screen hint ("try tapping the stars" is for the booth)
export function initEasterEggs({ reduce }) {
  consoleHello()
  shootingStars({ reduce })
  revThe700({ reduce })
}

// For whoever opens the developer tools
function consoleHello() {
  const mountain = [
    '        /\\',
    '       /  \\    /\\',
    '  /\\  /    \\  /  \\',
    ' /  \\/      \\/    \\',
  ].join('\n')
  console.log(
    `%c${mountain}\n%cBuilt with Claude Code, Vite, GSAP and Lenis.\nIf you’re reading this, we should talk → iacopoprai2007@gmail.com`,
    'color:#f2482a;font-family:monospace;font-size:12px;line-height:1.2',
    'color:inherit;font-family:system-ui,sans-serif;font-size:13px;line-height:1.6',
  )
}

// Tap the Tre Cime night sky: a shooting star crosses it from where you tapped
function shootingStars({ reduce }) {
  const sky = document.querySelector('.trecime-media')
  if (!sky) return
  let live = 0

  sky.addEventListener('pointerdown', (e) => {
    if (live >= 3) return
    const box = sky.getBoundingClientRect()
    const star = document.createElement('span')
    star.className = 'shooting-star'
    star.setAttribute('aria-hidden', 'true')
    star.style.left = `${e.clientX - box.left}px`
    star.style.top = `${e.clientY - box.top}px`
    sky.append(star)
    live++

    const done = () => {
      star.remove()
      live--
    }
    // Bright head at the tap point, tail trailing up-right; it travels down-left
    if (reduce) {
      gsap.fromTo(star, { opacity: 0, scaleX: 0.15, rotation: -30 }, { opacity: 1, duration: 0.25, yoyo: true, repeat: 1, onComplete: done })
      return
    }
    gsap.fromTo(
      star,
      { opacity: 0, x: 0, y: 0, scaleX: 0.2, rotation: -30 },
      {
        keyframes: [
          { opacity: 1, scaleX: 1, duration: 0.18, ease: 'power1.out' },
          { x: -box.width * 0.55, y: box.width * 0.32, opacity: 0, duration: 0.9, ease: 'power2.in' },
        ],
        onComplete: done,
      },
    )
  })
}

// Hold down on "700": the number shakes like an engine revving up, then settles when released
function revThe700({ reduce }) {
  const num = document.querySelector('.bike-num:not(.bike-num--outline)')
  if (!num) return
  num.classList.add('revvable')
  let shake = null
  let ramp = null

  const start = (e) => {
    e.preventDefault()
    if (reduce) return
    const amp = { a: 0.4 }
    ramp = gsap.to(amp, { a: 3.2, duration: 1.1, ease: 'power2.in' })
    shake = gsap.to(num, {
      duration: 0.04,
      repeat: -1,
      ease: 'none',
      x: () => gsap.utils.random(-amp.a, amp.a),
      y: () => gsap.utils.random(-amp.a * 0.6, amp.a * 0.6),
      rotation: () => gsap.utils.random(-amp.a * 0.35, amp.a * 0.35),
      repeatRefresh: true,
    })
    navigator.vibrate?.([30, 20, 40, 20, 60, 20, 80, 20, 120])
  }

  const stop = () => {
    if (!shake) return
    shake.kill()
    ramp?.kill()
    shake = null
    navigator.vibrate?.(0)
    gsap.to(num, { x: 0, y: 0, rotation: 0, duration: 0.6, ease: 'elastic.out(1, 0.35)' })
  }

  num.addEventListener('pointerdown', start)
  ;['pointerup', 'pointerleave', 'pointercancel'].forEach((t) => num.addEventListener(t, stop))
  num.addEventListener('contextmenu', (e) => e.preventDefault()) // no long-press menu on phones
}
