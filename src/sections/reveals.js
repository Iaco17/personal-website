import { gsap } from 'gsap'

// Every "chapter" element marked data-reveal fades/slides in once as it enters view
export function initReveals({ reduce }) {
  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: reduce ? 0.6 : 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    })
  })

  // Groups (like the About fact chips) come in one item after another
  gsap.utils.toArray('[data-stagger]').forEach((group) => {
    gsap.to(group.children, {
      opacity: 1,
      y: 0,
      duration: reduce ? 0.5 : 0.7,
      stagger: reduce ? 0 : 0.08,
      ease: 'power3.out',
      scrollTrigger: { trigger: group, start: 'top 88%', once: true },
    })
  })

  // Photos settle into their frames: a slow zoom-out tied to scroll position
  if (!reduce) {
    gsap.utils.toArray('.frame img').forEach((img) => {
      gsap.fromTo(
        img,
        { scale: 1.14 },
        {
          scale: 1,
          ease: 'none',
          scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'center 45%', scrub: true },
        },
      )
    })
  }

  // Motto lights up word by word as you read it
  const motto = document.querySelector('[data-words]')
  if (motto && !reduce) {
    splitWords(motto)
    gsap.fromTo(
      motto.querySelectorAll('.w'),
      { opacity: 0.14 },
      {
        opacity: 1,
        stagger: 0.1,
        ease: 'none',
        scrollTrigger: { trigger: motto, start: 'top 80%', end: 'bottom 50%', scrub: true },
      },
    )
  }
}

// Wraps each word in a span, keeping inline elements like <em> intact
function splitWords(root) {
  ;[...root.childNodes].forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const frag = document.createDocumentFragment()
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return
        if (/^\s+$/.test(part)) return frag.append(part)
        const span = document.createElement('span')
        span.className = 'w'
        span.textContent = part
        frag.append(span)
      })
      node.replaceWith(frag)
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      splitWords(node)
    }
  })
}
