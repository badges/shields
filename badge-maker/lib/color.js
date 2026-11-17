import { fromString } from 'css-color-converter'

// When updating these, be sure also to update the list in `badge-maker/README.md`.
export const namedColors = {
  brightgreen: '#4b0',
  green: '#67ac09',
  yellow: '#d8b800',
  yellowgreen: '#95991a',
  orange: '#ea7233',
  red: '#dd4343',
  blue: '#007ec6',
  grey: '#555',
  lightgrey: '#939393',
}

const aliases = {
  gray: 'grey',
  lightgray: 'lightgrey',
  critical: 'red',
  important: 'orange',
  success: 'brightgreen',
  informational: 'blue',
  inactive: 'lightgrey',
}

const resolvedAliases = {}
Object.entries(aliases).forEach(([alias, original]) => {
  resolvedAliases[alias] = namedColors[original]
})

// This function returns false for `#ccc`. However `isCSSColor('#ccc')` is
// true.
const hexColorRegex = /^([\da-f]{3}){1,2}$/i
export function isHexColor(s = '') {
  return hexColorRegex.test(s)
}

function isCSSColor(color) {
  if (typeof color !== 'string') {
    return false
  }
  try {
    return Boolean(fromString(color.trim()))
  } catch {
    // css-color-converter looks up names in a plain object, so a name like
    // `constructor` throws instead of returning null.
    return false
  }
}

export function normalizeColor(color) {
  if (color === undefined) {
    return undefined
  } else if (Object.hasOwn(namedColors, color)) {
    return color
  } else if (Object.hasOwn(aliases, color)) {
    return aliases[color]
  } else if (isHexColor(color)) {
    return `#${color.toString().toLowerCase()}`
  } else if (isCSSColor(color)) {
    return color.toLowerCase()
  } else {
    return undefined
  }
}

export function toSvgColor(color) {
  const normalized = normalizeColor(color)
  if (Object.hasOwn(namedColors, normalized)) {
    return namedColors[normalized]
  } else if (Object.hasOwn(resolvedAliases, normalized)) {
    return resolvedAliases[normalized]
  } else {
    return normalized
  }
}

export function brightness(color) {
  if (color) {
    const cssColor = fromString(color)
    if (cssColor) {
      const rgb = cssColor.toRgbaArray()
      return +((rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 255000).toFixed(2)
    }
  }
  return 0
}
