#!/usr/bin/env node
/**
 * Populate badge-maker/fonts/ with fonts required for badge text-width measurement.
 *
 * Free fonts (DejaVu Sans and Liberation Sans) are downloaded from GitHub.
 * Verdana (proprietary, © Microsoft) is copied from the system font directory;
 * it must already be installed:
 *   - Linux:  sudo apt-get install ttf-mscorefonts-installer
 *   - macOS:  included in Microsoft Office or as a standalone download
 *
 * Run once before executing badge-maker tests:
 *   node scripts/download-fonts.js
 */

import {
  createWriteStream,
  existsSync,
  mkdirSync,
  copyFileSync,
  writeFileSync,
} from 'fs'
import { unlink } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { pipeline } from 'stream/promises'
import { Readable } from 'stream'
import { execFileSync } from 'child_process'
import { tmpdir } from 'os'

const __dirname = dirname(fileURLToPath(import.meta.url))
const fontsDir = join(__dirname, '..', 'badge-maker', 'fonts')
mkdirSync(fontsDir, { recursive: true })

let hasError = false

/**
 * Download a URL to a local file.
 *
 * @param {string} url The URL to download.
 * @param {string} destPath The destination file path.
 * @returns {Promise<void>}
 */
async function downloadFile(url, destPath) {
  const resp = await fetch(url, {
    redirect: 'follow',
    headers: { 'User-Agent': 'shields.io/download-fonts' },
  })
  if (!resp.ok) throw new Error(`HTTP ${resp.status} fetching ${url}`)
  await pipeline(Readable.fromWeb(resp.body), createWriteStream(destPath))
}

/**
 * Convert an unknown thrown value to a printable message.
 *
 * @param {unknown} err The thrown value.
 * @returns {string} The error message.
 */
function errorMessage(err) {
  return err instanceof Error ? err.message : String(err)
}

/**
 * Download a .tar.gz archive and extract specific TTF files from it.
 * Uses the system `tar` binary available on both Linux and macOS.
 *
 * @param {string} url The archive URL.
 * @param {string[]} filenames The font filenames to extract.
 * @returns {Promise<void>}
 */
async function downloadFromTarball(url, filenames) {
  const needed = filenames.filter(f => !existsSync(join(fontsDir, f)))
  if (needed.length === 0) {
    for (const f of filenames) console.log(`  skip (exists): ${f}`)
    return
  }

  const tarPath = join(tmpdir(), `shields-fonts-${Date.now()}.tar.gz`)
  process.stdout.write(
    `  downloading:   ${filenames.join(', ')} (via tarball) ...`,
  )
  try {
    await downloadFile(url, tarPath)
    console.log(' downloaded, extracting...')

    const listing = execFileSync('tar', ['-tzf', tarPath])
      .toString()
      .split('\n')

    for (const filename of needed) {
      const archivePath = listing.find(path => path.endsWith(`/${filename}`))
      process.stdout.write(`  extracting:    ${filename} ...`)
      if (!archivePath) {
        console.log(' FAILED (not found in archive listing)')
        hasError = true
        continue
      }
      try {
        const content = execFileSync(
          'tar',
          ['-xzf', tarPath, '--to-stdout', archivePath],
          {
            maxBuffer: 8 * 1024 * 1024,
          },
        )
        writeFileSync(join(fontsDir, filename), content)
        console.log(' done')
      } catch {
        console.log(` FAILED (${archivePath} could not be extracted)`)
        hasError = true
      }
    }
  } catch (err) {
    console.log(` FAILED: ${errorMessage(err)}`)
    hasError = true
  } finally {
    await unlink(tarPath).catch(() => {})
  }
}

/**
 * Copy a font file from the first existing candidate path into badge-maker/fonts/.
 *
 * @param {string[]} candidates Ordered source paths to try.
 * @param {string} filename The output filename under badge-maker/fonts/.
 * @returns {boolean} True if the font was copied or already exists.
 */
function copyFromSystem(candidates, filename) {
  const dest = join(fontsDir, filename)
  if (existsSync(dest)) {
    console.log(`  skip (exists): ${filename}`)
    return true
  }
  for (const src of candidates) {
    if (existsSync(src)) {
      copyFileSync(src, dest)
      console.log(`  copied:        ${filename}  (from ${src})`)
      return true
    }
  }
  return false
}

// ── DejaVu Sans ──────────────────────────────────────────────────────────────
// License: Bitstream Vera Fonts copyright (free to redistribute).
// On ubuntu-latest this is provided by fonts-dejavu-core.
console.log('DejaVu Sans:')
const dejavuOk = copyFromSystem(
  [
    // Linux (fonts-dejavu-core)
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    // Common macOS Homebrew path (if installed)
    '/opt/homebrew/share/fonts/DejaVuSans.ttf',
    '/usr/local/share/fonts/DejaVuSans.ttf',
  ],
  'DejaVuSans.ttf',
)
const dejavuBoldOk = copyFromSystem(
  [
    '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
    '/opt/homebrew/share/fonts/DejaVuSans-Bold.ttf',
    '/usr/local/share/fonts/DejaVuSans-Bold.ttf',
  ],
  'DejaVuSans-Bold.ttf',
)

if (!dejavuOk || !dejavuBoldOk) {
  console.warn(
    '  warning: DejaVu Sans not found on this host. Using Verdana/Liberation Sans only.',
  )
}

// ── Liberation Sans ───────────────────────────────────────────────────────────
// License: SIL Open Font Licence 1.1 (free to redistribute)
// Source:  https://github.com/liberationfonts/liberation-fonts
// Metric-compatible with Arial and Helvetica — registered under those family
// names in canvas-polyfill.js so 'bold 11px Helvetica' resolves correctly.
console.log('Liberation Sans:')
await downloadFromTarball(
  'https://github.com/liberationfonts/liberation-fonts/files/7261482/liberation-fonts-ttf-2.1.5.tar.gz',
  ['LiberationSans-Regular.ttf', 'LiberationSans-Bold.ttf'],
)

// ── Verdana ───────────────────────────────────────────────────────────────────
// License: © Microsoft Corporation — proprietary, do NOT commit to repository.
// Must be installed on the host system before running this script.
//   Linux:  sudo apt-get install ttf-mscorefonts-installer
//   macOS:  pre-installed with Microsoft Office or certain system updates
console.log('Verdana:')
const verdanaOk = copyFromSystem(
  [
    // Linux (ttf-mscorefonts-installer)
    '/usr/share/fonts/truetype/msttcorefonts/Verdana.ttf',
    // macOS
    '/System/Library/Fonts/Supplemental/Verdana.ttf',
    '/Library/Fonts/Verdana.ttf',
  ],
  'Verdana.ttf',
)
const verdanaBoldOk = copyFromSystem(
  [
    '/usr/share/fonts/truetype/msttcorefonts/Verdana_Bold.ttf',
    '/System/Library/Fonts/Supplemental/Verdana Bold.ttf',
    '/Library/Fonts/Verdana Bold.ttf',
  ],
  'Verdana_Bold.ttf',
)

if (!verdanaOk || !verdanaBoldOk) {
  console.warn(
    '\nWARNING: Verdana not found on this system.\n' +
      '  Badge widths may differ from the committed snapshots.\n' +
      '  Linux:  sudo apt-get install ttf-mscorefonts-installer\n' +
      '  macOS:  install Microsoft Office or download the web fonts package.\n',
  )
  hasError = true
}

if (hasError) {
  console.error('\nSome fonts could not be obtained. See warnings above.')
  process.exit(1)
} else {
  console.log('\nAll fonts ready in badge-maker/fonts/')
}
