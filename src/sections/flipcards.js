import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Lab cards flip on tap/click/Enter (they're real <button>s, so keyboard works for free).
// The rotation itself is a CSS transition on transform.
export function initFlipCards({ reduce }) {
  const cards = document.querySelectorAll('.card')
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const flipped = card.getAttribute('aria-pressed') === 'true'
      card.setAttribute('aria-pressed', String(!flipped))
    })
  })

  // Phone carousel: "1 / 4" follows the card snapped into view
  const track = document.querySelector('.cards')
  const index = document.querySelector('[data-lab-index]')
  if (track && index) {
    track.addEventListener(
      'scroll',
      () => {
        const step = track.firstElementChild.getBoundingClientRect().width + 12
        index.textContent = String(Math.min(cards.length, Math.round(track.scrollLeft / step) + 1))
      },
      { passive: true },
    )
  }

  if (reduce || !cards.length) return

  // Cards deal in, then the first one does a small "peek" to show it can flip
  const items = document.querySelectorAll('.cards li')
  gsap.set(items, { opacity: 0, y: 40 })
  ScrollTrigger.create({
    trigger: '.cards',
    start: 'top 80%',
    once: true,
    onEnter: () => {
      document.querySelector('.poster--mtn')?.classList.add('is-drawn')
      gsap.to(items, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: 'power3.out',
        onComplete: () => {
          if (cards[0].getAttribute('aria-pressed') === 'true') return
          // The CSS transition would fight GSAP's frames, so switch it off during the peek
          gsap.to(cards[0], {
            rotateY: -28,
            duration: 0.45,
            ease: 'power2.out',
            yoyo: true,
            repeat: 1,
            onStart: () => (cards[0].style.transition = 'none'),
            clearProps: 'transform,transition',
          })
        },
      })
    },
  })
}
