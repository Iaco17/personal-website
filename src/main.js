import '@fontsource-variable/big-shoulders-display'
import '@fontsource-variable/manrope'
import '@fontsource/ibm-plex-mono/500.css'
import 'lenis/dist/lenis.css'
import './styles/base.css'
import './styles/sections.css'

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

import { renderStats } from './sections/stats.js'
import { initHero } from './sections/hero.js'
import { initReveals } from './sections/reveals.js'
import { initRoute } from './sections/route.js'
import { initCounter } from './sections/counter.js'
import { initFlipCards } from './sections/flipcards.js'
import { initAltimeter } from './sections/altimeter.js'
import { initContact } from './sections/contact.js'
import { initEasterEggs } from './sections/easter-eggs.js'

gsap.registerPlugin(ScrollTrigger)

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Lenis = smooth wheel scrolling on desktop. On touch it keeps native scrolling,
// so phones never feel "hijacked". Off entirely for reduced motion.
let lenis = null
if (!reduce) {
  lenis = new Lenis({ duration: 1.1 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
}

// In-page links (#about, #contact…) glide with Lenis instead of jumping
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href')
    if (id === '#') return e.preventDefault()
    const target = document.querySelector(id)
    if (!target) return
    e.preventDefault()
    if (lenis) lenis.scrollTo(target, { offset: id === '#hero' ? 0 : -24 })
    else target.scrollIntoView()
    target.setAttribute('tabindex', '-1')
    target.focus({ preventScroll: true })
  })
})

renderStats()
initHero({ reduce })
initReveals({ reduce })
initRoute({ reduce })
initCounter({ reduce })
initFlipCards({ reduce })
initAltimeter()
initContact()
initEasterEggs({ reduce })

// Recalculate trigger positions once fonts and images have settled
window.addEventListener('load', () => ScrollTrigger.refresh())
