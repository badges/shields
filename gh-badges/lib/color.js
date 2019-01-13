'use strict'

const isCSSColor = require('is-css-color')

// When updating these, be sure also to update the list in `gh-badges/README.md`.
const namedColors = {
  brightgreen: '#4c1',
  green: '#97CA00',
  yellow: '#dfb317',
  yellowgreen: '#a4a61d',
  orange: '#fe7d37',
  red: '#e05d44',
  blue: '#007ec6',
  grey: '#555',
  gray: '#555',
  lightgrey: '#9f9f9f',
  lightgray: '#9f9f9f',
}

// This function returns false for `#ccc`. However `isCSSColor('#ccc')` is
// true.
const hexColorRegex = /^([\da-f]{3}){1,2}$/i
function isHexColor(s = '') {
  return hexColorRegex.test(s.toLowerCase())
}

function normalizeColor(color) {
  if (color === undefined) {
    return undefined
  } else if (color in namedColors) {
    return color
  } else if (isHexColor(color)) {
    return `#${color.toLowerCase()}`
  } else if (isCSSColor(color)) {
    return color.toLowerCase()
  } else {
    return undefined
  }
}

function toSvgColor(color) {
  const normalized = normalizeColor(color)
  return normalized in namedColors ? namedColors[color] : normalized
}

module.exports = {
  namedColors,
  isHexColor,
  normalizeColor,
  toSvgColor,
}
