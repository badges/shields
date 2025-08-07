import colour from 'color'

// When updating these, be sure also to update the list in `badge-maker/README.md`.
export const namedColors = {
  brightgreen: '#4c1',
  green: '#97ca00',
  yellow: '#dfb317',
  yellowgreen: '#a4a61d',
  orange: '#fe7d37',
  red: '#e05d44',
  blue: '#007ec6',
  grey: '#555',
  lightgrey: '#9f9f9f',
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

function getCssColor(color) {
  if (typeof color !== 'string') return undefined
  try {
    const cssColor = colour(color.trim())
    return cssColor
  } catch (error) {
    console.error(color, error)
    return undefined
  }
}

export function normalizeColor(color) {
  if (color === undefined) {
    return undefined
  }
  if (color in namedColors) {
    return color
  }
  if (color in aliases) {
    return aliases[color]
  }
  if (isHexColor(color)) {
    return `#${color.toString().toLowerCase()}`
  }
  const cssColor = getCssColor(color)
  console.log(color)
  console.log(cssColor)
  if (cssColor) {
    if (color.startsWidth('hwb(')) {
      console.log(cssColor.hwb().string())
      return cssColor.hwb().string()
    }
    return color.toLowerCase()
  }
  return undefined
}

export function toSvgColor(color) {
  const normalized = normalizeColor(color)
  if (normalized in namedColors) {
    return namedColors[normalized]
  } else if (normalized in resolvedAliases) {
    return resolvedAliases[normalized]
  } else {
    return normalized
  }
}

export function brightness(color) {
  if (!color) return 0
  try {
    const cssColor = colour(color)

    if (cssColor) {
      const rgb = cssColor.rgb().array()
      return +((rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 255000).toFixed(2)
    }
  } catch {}
  return 0
}
