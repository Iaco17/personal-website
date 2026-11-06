import { treCime, trip } from '../data/stats.js'

// Real minus sign (−) instead of a hyphen, thousands separators
export const fmt = (n) => n.toLocaleString('en-US').replace('-', '−')

// Renders the stat lists from src/data/stats.js into the page
export function renderStats() {
  const dl = document.querySelector('[data-stats]')
  if (dl) {
    dl.innerHTML = treCime
      .map(
        (s) => `<div class="stat">
          <dt>${s.label}${s.note ? `<small>${s.note}</small>` : ''}</dt>
          <dd><span data-count="${s.value}">${fmt(s.value)}</span>${s.unit ? `<span class="unit">${s.unit}</span>` : ''}</dd>
        </div>`,
      )
      .join('')
  }

  const facts = document.querySelector('[data-route-facts]')
  if (facts) {
    facts.innerHTML = trip.map((f) => `<span><b>${f.value}</b> ${f.label}</span>`).join('')
  }
}
