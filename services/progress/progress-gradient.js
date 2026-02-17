/**
 * Gradient color interpolation for progress/percentage badges.
 * Maps a percentage (0-100) to a color along a predefined or custom gradient.
 */

const NAMED_HEX = {
  red: '#e05d44',
  brightgreen: '#44cc11',
  green: '#97ca00',
  yellow: '#dfb317',
  yellowgreen: '#a4a61d',
  orange: '#fe7d37',
}

const PREDEFINED_GRADIENTS = {
  'red-green': ['red', 'brightgreen'],
  'green-red': ['brightgreen', 'red'],
  'red-yellow-green': ['red', 'yellow', 'brightgreen'],
  'green-yellow-red': ['brightgreen', 'yellow', 'red'],
}

/**
 * Parse hex or named color to [r, g, b].
 *
 * @param {string} color - Hex (#abc, #aabbcc) or named color
 * @returns {number[]} RGB values 0-255
 */
function parseColor(color) {
  const trimmed = color.trim().toLowerCase()
  if (NAMED_HEX[trimmed]) {
    return hexToRgb(NAMED_HEX[trimmed])
  }
  if (trimmed.startsWith('#')) {
    return hexToRgb(trimmed)
  }
  return hexToRgb(`#${trimmed}`)
}

function hexToRgb(hex) {
  hex = hex.replace(/^#/, '')
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
  }
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  return [r, g, b]
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b]
    .map(x => Math.round(Math.max(0, Math.min(255, x))))
    .map(x => x.toString(16).padStart(2, '0'))
    .join('')}`
}

/**
 * Linearly interpolate between two RGB colors.
 *
 * @param {number[]} a - Start color
 * @param {number[]} b - End color
 * @param {number} t - Factor 0..1
 * @returns {string} Hex color
 */
function lerpColor(a, b, t) {
  const r = a[0] + (b[0] - a[0]) * t
  const g = a[1] + (b[1] - a[1]) * t
  const b_ = a[2] + (b[2] - a[2]) * t
  return rgbToHex(r, g, b_)
}

/**
 * Get color from gradient at position t (0-1).
 *
 * @param {string[]} colorStops - Array of color names or hex codes
 * @param {number} t - Position 0..1
 * @returns {string} Hex color
 */
function interpolateGradient(colorStops, t) {
  if (colorStops.length === 0) return NAMED_HEX.red
  if (colorStops.length === 1) return resolveToHex(colorStops[0])
  if (t >= 1) return resolveToHex(colorStops[colorStops.length - 1])
  if (t <= 0) return resolveToHex(colorStops[0])

  const segments = colorStops.length - 1
  const segmentIndex = Math.min(Math.floor(t * segments), segments - 1)
  const localT = t * segments - segmentIndex

  const start = parseColor(resolveToHex(colorStops[segmentIndex]))
  const end = parseColor(resolveToHex(colorStops[segmentIndex + 1]))
  return lerpColor(start, end, localT)
}

function resolveToHex(color) {
  const t = color.trim().toLowerCase()
  if (NAMED_HEX[t]) return NAMED_HEX[t]
  if (t.startsWith('#')) return t.length >= 6 ? t : expandShortHex(t)
  if (/^[0-9a-f]{6}$/i.test(t) || /^[0-9a-f]{3}$/i.test(t)) return `#${t}`
  return NAMED_HEX.red
}

function expandShortHex(hex) {
  if (hex.length !== 4) return hex
  return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
}

/**
 * Get badge color for a percentage using the specified gradient.
 *
 * @param {number} percentage - 0..100
 * @param {string} gradientKey - Predefined key or custom colors (e.g. 'red-green')
 * @returns {string} Hex color for badge
 */
export function gradientColorForPercentage(percentage, gradientKey) {
  const t = Math.max(0, Math.min(100, percentage)) / 100

  let colorStops
  if (PREDEFINED_GRADIENTS[gradientKey]) {
    colorStops = PREDEFINED_GRADIENTS[gradientKey]
  } else if (gradientKey && gradientKey.includes('-')) {
    colorStops = gradientKey.split('-').filter(Boolean)
  } else {
    colorStops = PREDEFINED_GRADIENTS['red-green']
  }

  return interpolateGradient(colorStops, t)
}

export { PREDEFINED_GRADIENTS, NAMED_HEX }
