import { defineConfig } from 'vite'
import { readdirSync, readFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'

// Fills __JS_KB__ and __PHOTO_COUNT__ in index.html with numbers measured on the real build,
// so the "This site" card and the build log never state a figure nobody checked.
// Also inlines the hero's blurred preview and preloads the headline font, so the first
// paint already has the photo's colours and "IACOPO PRAI" never jumps from a fallback font.
function buildStats() {
  return {
    name: 'build-stats',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        // hero-828 / hero-1536 are one photo in two sizes
        const photos = new Set(
          readdirSync('public/photos')
            .filter((f) => f.endsWith('.webp'))
            .map((f) => f.replace(/(-\d{3,4})?\.webp$/, '')), // strip the size suffix only, not "-1"/"-2"
        )
        let jsKb = '~50'
        const tags = []
        if (ctx.bundle) {
          const chunks = Object.values(ctx.bundle)
          const bytes = chunks
            .filter((c) => c.type === 'chunk')
            .reduce((sum, c) => sum + gzipSync(c.code).length, 0)
          jsKb = String(Math.round(bytes / 1024))
          const font = chunks.find((c) => /big-shoulders-display-latin-wght-normal.*\.woff2$/.test(c.fileName))
          if (font) {
            tags.push({
              tag: 'link',
              attrs: { rel: 'preload', href: `/${font.fileName}`, as: 'font', type: 'font/woff2', crossorigin: '' },
              injectTo: 'head-prepend',
            })
          }
        }
        const lqip = readFileSync('src/data/hero-lqip.txt', 'utf8').trim()
        return {
          html: html
            .replaceAll('__JS_KB__', jsKb)
            .replaceAll('__PHOTO_COUNT__', String(photos.size))
            .replaceAll('__HERO_LQIP__', lqip),
          tags,
        }
      },
    },
  }
}

export default defineConfig({
  plugins: [buildStats()],
  build: {
    rollupOptions: {
      input: { main: 'index.html', notFound: '404.html' },
    },
  },
})
