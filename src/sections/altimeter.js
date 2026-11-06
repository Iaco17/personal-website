import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { treCime } from '../data/stats.js'

// The page as a climb: scroll progress becomes altitude, topping out at the Cima Grande.
// Only the text changes (fixed width, tabular digits), so nothing shifts on screen.
export function initAltimeter() {
  const el = document.querySelector('.altimeter')
  const value = el?.querySelector('[data-alt]')
  if (!el || !value) return

  const summit = treCime.find((s) => s.unit === 'm')?.value ?? 2999
  let last = -1

  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: ({ progress }) => {
      const atTop = progress > 0.985
      const metres = atTop ? summit : Math.round((progress * summit) / 10) * 10
      if (metres !== last) {
        value.textContent = metres.toLocaleString('en-US')
        last = metres
      }
      el.classList.toggle('is-summit', atTop)
    },
  })

  // Hidden over the hero, where it would compete with the name
  ScrollTrigger.create({
    trigger: '.hero',
    start: 'bottom 60%',
    onEnter: () => el.classList.add('is-visible'),
    onLeaveBack: () => el.classList.remove('is-visible'),
  })
}
