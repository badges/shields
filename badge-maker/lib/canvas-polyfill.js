// Polyfill OffscreenCanvas for Node.js environments where it's not available.
// Required by @chenglou/pretext which uses canvas measureText for text width.
if (typeof globalThis.OffscreenCanvas === 'undefined') {
  try {
    const { createCanvas, GlobalFonts } = await import('@napi-rs/canvas')
    const { existsSync } = await import('fs')
    const { fileURLToPath } = await import('url')
    const { join, dirname } = await import('path')

    // @napi-rs/canvas (Skia) does not automatically load system fonts on Linux.
    // Fonts are bundled in badge-maker/fonts/ (run `node scripts/download-fonts.js`
    // to populate the directory before running tests).
    const fontsDir = join(
      dirname(fileURLToPath(import.meta.url)),
      '..',
      'fonts',
    )

    // [filename, familyNameOverride]
    // familyNameOverride replaces the font's own internal family name in the
    // Skia registry, so that CSS font strings like 'bold 11px Helvetica' resolve
    // to the bundled metric-compatible substitute (Liberation Sans).
    const fonts = [
      // Verdana — flat / plastic / for-the-badge measurement font
      ['Verdana.ttf'],
      ['Verdana_Bold.ttf'],
      // Liberation Sans registered as Helvetica for social-badge measurement
      ['LiberationSans-Regular.ttf', 'Helvetica'],
      ['LiberationSans-Bold.ttf', 'Helvetica'],
      // Liberation Sans also registered as Arial (font-family fallback in SVG)
      ['LiberationSans-Regular.ttf', 'Arial'],
      ['LiberationSans-Bold.ttf', 'Arial'],
      // DejaVu Sans — fallback in badge font-family lists
      ['DejaVuSans.ttf'],
      ['DejaVuSans-Bold.ttf'],
    ]

    for (const [filename, familyName] of fonts) {
      const fontPath = join(fontsDir, filename)
      if (existsSync(fontPath)) {
        GlobalFonts.registerFromPath(fontPath, familyName)
      }
    }

    globalThis.OffscreenCanvas = class OffscreenCanvas {
      constructor(width, height) {
        this._canvas = createCanvas(width, height)
      }

      getContext(type) {
        return this._canvas.getContext(type)
      }
    }
  } catch {
    // @napi-rs/canvas not available; OffscreenCanvas must be provided by the runtime
  }
}
