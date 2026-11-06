// Converts Iaco's original photos (photos-raw/) into web-ready WebP files in public/photos/.
// Each entry: source file, output name, widths, optional crop (aspect + vertical focus 0..1),
// and whether to apply the light colour grade. Quality steps down until the file is under budget.
// Run: node scripts/photos.mjs
import sharp from 'sharp'
import { existsSync, statSync, writeFileSync } from 'node:fs'

const RAW = existsSync('photos-raw') ? 'photos-raw' : 'public/photos/raw'
const OUT = 'public/photos'
const MAX_KB = 300

const photos = [
  { src: '35775 (1).jpg', out: 'hero', widths: [828, 1536], grade: true },
  { src: 'file_00000000025c720ab270f2352b722b51 (1).png', out: 'portrait', widths: [640], budget: 90 },
  { src: '44832.jpg', out: 'trip-1', widths: [1400], aspect: 3 / 2, focusY: 0.5, budget: 220 },
  { src: '44352 (2).png', out: 'trip-2', widths: [814], aspect: 4 / 5, focusY: 0.6, grade: true, budget: 160 },
  // Night sky: lift it a little so the stars and the horizon glow survive on phone screens
  { src: '36802 (1).jpg', out: 'trecime-1', widths: [828, 1600], lift: true },
  { src: '31217 (1).jpg', out: 'trecime-2', widths: [1000], aspect: 4 / 5, focusY: 0.42, grade: true, budget: 220 },
  // Phone screenshot: cut the black bars first, then frame the climber on the cable
  { src: 'Screenshot_20260504-200740 (1).png', out: 'ferrata-1', widths: [1000], bars: { top: 285, height: 2230 }, aspect: 4 / 5, focusY: 0.33, grade: true, budget: 220 },
  { src: 'file_000000005b4c81f488c605c38dedf930 (1).png', out: 'ferrata-2', widths: [939], aspect: 4 / 5, focusY: 0.75, grade: true, budget: 200 },
  { src: '19405 (1).jpg', out: 'moto-1', widths: [1000], aspect: 4 / 5, focusY: 0.55, grade: true, budget: 220 },
  { src: 'IMG_20260830_175835669 (1).jpg', out: 'moto-2', widths: [1000], aspect: 4 / 5, focusY: 0.6, grade: true, budget: 220 },
]

for (const p of photos) {
  const base = () => {
    let img = sharp(`${RAW}/${p.src}`).rotate() // respect EXIF orientation
    return img
  }

  // Work out the crop box on the (bar-free) source
  const meta = await base().metadata()
  let left = 0
  let top = p.bars?.top ?? 0
  let width = meta.width
  let height = p.bars?.height ?? meta.height
  if (p.aspect) {
    const cropH = Math.min(height, Math.round(width / p.aspect))
    const cropW = Math.min(width, Math.round(cropH * p.aspect))
    left += Math.round((width - cropW) / 2)
    top += Math.round((height - cropH) * (p.focusY ?? 0.5))
    width = cropW
    height = cropH
  }

  for (const w of p.widths) {
    const name = p.widths.length > 1 ? `${p.out}-${w}` : p.out
    const budget = p.budget ?? MAX_KB
    let quality = 82
    let info
    do {
      let img = base().extract({ left, top, width, height }).resize({ width: Math.min(w, width) })
      if (p.grade) img = img.modulate({ saturation: 0.92 }).linear(1.05, -5)
      if (p.lift) img = img.linear(1.35, 2)
      info = await img.webp({ quality, effort: 6 }).toFile(`${OUT}/${name}.webp`)
      quality -= 6
    } while (info.size / 1024 > budget && quality > 40)
    const kb = Math.round(statSync(`${OUT}/${name}.webp`).size / 1024)
    console.log(`${name}.webp  ${info.width}x${info.height}  ${kb} KB  q${quality + 6}`)
  }
}

// Tiny blurred preview of the hero (~0.2 KB), inlined into index.html so the first paint is never empty
const lqip = await sharp(`${RAW}/35775 (1).jpg`).rotate().resize({ width: 20 }).modulate({ saturation: 0.92 }).webp({ quality: 40 }).toBuffer()
writeFileSync('src/data/hero-lqip.txt', `data:image/webp;base64,${lqip.toString('base64')}`)
console.log(`hero-lqip  ${lqip.length} bytes`)
