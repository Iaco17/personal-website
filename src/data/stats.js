import { routeMap } from './route-map.js'

// The numbers shown in the Adventures chapter — edit them here, nowhere else.
// Tre Cime: place facts (summit height, typical February night) rather than personal records.
// TODO(Iaco): confirm or correct these before the career day.

export const treCime = [
  { value: 3, label: 'Days' },
  { value: 2, label: 'Nights', note: 'a cave + an emergency bivouac' },
  { value: 2999, unit: 'm', label: 'Cima Grande', note: 'the tallest of the three' },
  { value: -15, unit: '°C', label: 'February nights', note: 'roughly, at refuge altitude' },
]

// Lisbon → Madrid → Barcelona → Marseille: road distance measured by OSRM (scripts/map.mjs)
export const trip = [
  { value: `${routeMap.totalKm.toLocaleString('en-US')} km`, label: 'by road' },
  { value: '4', label: 'cities' },
  { value: '3', label: 'countries' },
]
