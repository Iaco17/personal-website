import { gsap } from 'gsap'

// Intro on load + gentle parallax as the hero scrolls away
export function initHero({ reduce }) {
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })

  if (reduce) {
    gsap.set('.hero-name .mask > span', { y: 0 })
    tl.to(['.hero-eyebrow', '.hero-line', '.scroll-cue'], { opacity: 1, duration: 0.6 })
    return
  }

  tl.from('.hero-media img', { scale: 1.15, opacity: 0, duration: 1.8 }, 0)
    .to('.hero-name .mask > span', { y: 0, duration: 1.3, stagger: 0.1 }, 0.25)
    .to('.hero-eyebrow', { opacity: 1, duration: 1 }, 0.6)
    .fromTo('.hero-line', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1.1 }, 0.75)
    .to('.scroll-cue', { opacity: 1, duration: 1 }, 1.1)

  gsap.to('.hero-media img', {
    yPercent: 10,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  })
  gsap.to('.hero-content', {
    yPercent: -12,
    opacity: 0,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: '30% top', end: 'bottom top', scrub: true },
  })

  // Same parallax idea on the Tre Cime full-bleed photo
  gsap.fromTo(
    '.trecime-media img',
    { yPercent: -8 },
    {
      yPercent: 0,
      ease: 'none',
      scrollTrigger: { trigger: '.trecime-media', start: 'top bottom', end: 'bottom top', scrub: true },
    },
  )
}
