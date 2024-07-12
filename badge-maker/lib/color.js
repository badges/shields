'use strict'

const { fromString } = require('css-color-converter')

// When updating these, be sure also to update the list in `badge-maker/README.md`.
const namedColors = {
  brightgreen: '#10b73d',
  green: '#67ac09',
  yellow: '#c89615',
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
function isHexColor(s = '') {
  return hexColorRegex.test(s)
}

function isCSSColor(color) {
  return typeof color === 'string' && fromString(color.trim())
}

function normalizeColor(color) {
  if (color === undefined) {
    return undefined
  } else if (color in namedColors) {
    return color
  } else if (color in aliases) {
    return aliases[color]
  } else if (isHexColor(color)) {
    return `#${color.toString().toLowerCase()}`
  } else if (isCSSColor(color)) {
    return color.toLowerCase()
  } else {
    return undefined
  }
}

function toSvgColor(color) {
  const normalized = normalizeColor(color)
  if (normalized in namedColors) {
    return namedColors[normalized]
  } else if (normalized in resolvedAliases) {
    return resolvedAliases[normalized]
  } else {
    return normalized
  }
}

function brightness(color) {
  if (color) {
    const cssColor = fromString(color)
    if (cssColor) {
      const rgb = cssColor.toRgbaArray()
      return +((rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 255000).toFixed(2)
    }
  }
  return 0
}

module.exports = {
  namedColors,
  isHexColor,
  normalizeColor,
  toSvgColor,
  brightness,
}
