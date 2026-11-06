import { gsap } from 'gsap'
import { routeMap as M } from '../data/route-map.js'

// Lisbon → Marseille as a navigation-style camera: the card sticks while you scroll,
// the line draws along the real road route, the camera starts zoomed on Lisbon,
// follows the head of the line and ends framing the whole trip.
// Everything moves with transform; the map layer is rendered at max-zoom size and only
// ever scaled DOWN, so it stays sharp.

const ZOOM_IN = 300 // map units visible across the card at the start (zoomed on Lisbon)
const PAD = 110 // breathing room around the route in the final, zoomed-out frame

export function initRoute({ reduce }) {
  const view = document.querySelector('.map-view')
  const layer = view?.querySelector('.map-layer')
  const svg = view?.querySelector('[data-map-overlay]')
  if (!view || !layer || !svg) return
  const sticky = document.querySelector('.route-sticky')
  const kmEl = document.querySelector('[data-km]')

  svg.setAttribute('viewBox', `0 0 ${M.width} ${M.height}`)
  svg.innerHTML = overlayMarkup()

  const line = svg.querySelector('.m-line')
  const casing = svg.querySelector('.m-casing')
  const head = svg.querySelector('.m-head')
  const fixedSize = [...svg.querySelectorAll('[data-x]')] // labels + pins keep their on-screen size
  const cities = [...svg.querySelectorAll('.m-city')]
  const len = line.getTotalLength()
  ;[line, casing].forEach((p) => (p.style.strokeDasharray = `${len} ${len}`))

  // Frame for the end of the trip: the bounding box of the four cities
  const xs = M.cities.map((c) => c.x)
  const ys = M.cities.map((c) => c.y)
  const end = { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2 }
  const routeW = Math.max(...xs) - Math.min(...xs) + PAD * 2
  const routeH = Math.max(...ys) - Math.min(...ys) + PAD * 2

  let vw = 0
  let vh = 0
  let unit = 1 // layer pixels per map unit at scale 1
  let zoomOut = 760
  let current = reduce ? 1 : 0

  const measure = () => {
    if (!view.clientWidth || !view.clientHeight) return // hidden or mid-resize: keep the last good size
    vw = view.clientWidth
    vh = view.clientHeight
    const layerPx = (vw * M.width) / ZOOM_IN
    layer.style.width = `${layerPx}px`
    unit = layerPx / M.width
    zoomOut = Math.max(routeW, (routeH * vw) / vh)
  }

  const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)

  const render = (p) => {
    current = p
    if (!vw || !vh) return
    const e = easeInOut(p)
    const s = ZOOM_IN / (ZOOM_IN + (zoomOut - ZOOM_IN) * e)
    const drawn = len * p
    const pt = line.getPointAtLength(drawn)

    // Camera: follow the head early on, glide to the whole-route frame by the end
    const cx = pt.x + (end.x - pt.x) * e
    const cy = pt.y + (end.y - pt.y) * e
    const k = unit * s
    let tx = vw / 2 - cx * k
    let ty = vh / 2 - cy * k
    tx = Math.min(0, Math.max(vw - M.width * k, tx)) // never show past the map's edge
    ty = Math.min(0, Math.max(vh - M.height * k, ty))
    layer.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${s})`

    const offset = len - drawn
    line.style.strokeDashoffset = offset
    casing.style.strokeDashoffset = offset

    const inv = 1 / k
    head.setAttribute('transform', `translate(${pt.x} ${pt.y}) scale(${inv})`)
    fixedSize.forEach((g) => g.setAttribute('transform', `translate(${g.dataset.x} ${g.dataset.y}) scale(${inv})`))
    cities.forEach((c, i) => c.classList.toggle('is-in', p >= M.cities[i].at - 0.003))

    if (kmEl) kmEl.textContent = kmAt(p).toLocaleString('en-US')
  }

  measure()
  render(current)
  new ResizeObserver(() => {
    measure()
    render(current)
  }).observe(view)

  if (reduce) return

  // Progress runs while the card is stuck: from "card reaches its sticky top" to "stage ends"
  const stickyTop = () => parseFloat(getComputedStyle(sticky).top) || 0
  const proxy = { p: 0 }
  gsap.to(proxy, {
    p: 1,
    ease: 'none',
    onUpdate: () => render(proxy.p),
    scrollTrigger: {
      trigger: '.route-stage',
      start: () => `top ${stickyTop()}px`,
      end: () => `bottom ${stickyTop() + sticky.offsetHeight}px`,
      scrub: 0.6,
      invalidateOnRefresh: true,
    },
  })
}

// Road km at progress p: exact at each city (from OSRM legs), linear in between
function kmAt(p) {
  const c = M.cities
  for (let i = 1; i < c.length; i++) {
    if (p < c[i].at) {
      const t = (p - c[i - 1].at) / (c[i].at - c[i - 1].at)
      return Math.round(c[i - 1].km + (c[i].km - c[i - 1].km) * t)
    }
  }
  return M.totalKm // exact figure once the line reaches Marseille
}

function overlayMarkup() {
  const label = (cls) => (l) =>
    `<g data-x="${l.at[0]}" data-y="${l.at[1]}"><text class="${cls}" text-anchor="middle">${l.text}</text></g>`

  const textFor = (c) =>
    ({
      left: `<text x="-14" y="4.5" text-anchor="end">${c.name}</text>`,
      right: `<text x="12" y="4.5">${c.name}</text>`,
      below: `<text y="25" text-anchor="middle">${c.name}</text>`,
      above: `<text y="-36" text-anchor="middle">${c.name}</text>`,
    })[c.label]

  const last = M.cities.length - 1
  const city = (c, i) => {
    let marker = `<g class="m-pop"><circle class="m-stop" r="5.5"/></g>`
    if (i === 0) marker = `<g class="m-pop"><circle class="m-start-ring" r="9.5"/><circle class="m-stop" r="5"/></g>`
    if (i === last)
      marker = `<g class="m-drop"><path class="m-pin-shape" d="M0 0C-2-6-11-12-11-21a11 11 0 1 1 22 0C11-12 2-6 0 0Z"/><circle class="m-pin-dot" cy="-21" r="4"/></g>`
    return `<g class="m-city" data-x="${c.x}" data-y="${c.y}">${marker}${textFor(c)}</g>`
  }

  return [
    ...M.labels.seas.map(label('m-sea')),
    ...M.labels.countries.map(label('m-country')),
    `<path class="m-ghost" d="${M.route}"/>`,
    `<path class="m-casing" d="${M.route}"/>`,
    `<path class="m-line" d="${M.route}"/>`,
    `<g class="m-head"><circle class="m-head-halo" r="7"/><circle class="m-head-dot" r="6"/></g>`,
    ...M.cities.map(city),
  ].join('')
}
