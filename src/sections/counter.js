import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { fmt } from './stats.js'

// Tre Cime stats count up from 0 the first time they scroll into view
export function initCounter({ reduce }) {
  const stats = document.querySelector('[data-stats]')
  if (!stats || reduce) return

  const nums = [...stats.querySelectorAll('[data-count]')]
  nums.forEach((el) => (el.textContent = '0'))
  gsap.set(stats.children, { opacity: 0, y: 24 })

  ScrollTrigger.create({
    trigger: stats,
    start: 'top 85%',
    once: true,
    onEnter: () => {
      gsap.to(stats.children, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' })
      nums.forEach((el, i) => {
        const counter = { v: 0 }
        gsap.to(counter, {
          v: Number(el.dataset.count),
          duration: 2.2,
          delay: 0.15 + i * 0.1,
          ease: 'power3.out',
          onUpdate: () => (el.textContent = fmt(Math.round(counter.v))),
        })
      })
    },
  })
}
