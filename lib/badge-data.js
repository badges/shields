'use strict'

const { makeLogo } = require('./logos')

function toArray(val) {
  if (val === undefined) {
    return []
  } else if (Object(val) instanceof Array) {
    return val
  } else {
    return [val]
  }
}

function makeLabel(defaultLabel, overrides) {
  return `${
    overrides.label === undefined
      ? (defaultLabel || '').toLowerCase()
      : overrides.label
  }`
}

// Generate the initial badge data. Pass the URL query parameters, which
// override the default label.
//
// The following parameters are supported:
//
//   - label
//   - style
//   - logo
//   - logoWidth
//   - link
//   - colorA
//   - colorB
//   - maxAge
//
// Note: maxAge is handled by cache(), not this function.
function makeBadgeData(defaultLabel, overrides) {
  return {
    text: [makeLabel(defaultLabel, overrides), 'n/a'],
    colorscheme: 'lightgrey',
    template: overrides.style,
    logo: makeLogo(undefined, overrides),
    logoPosition: +overrides.logoPosition,
    logoWidth: +overrides.logoWidth,
    links: toArray(overrides.link),
    // Scoutcamp sometimes turns these into numbers.
    colorA:
      typeof overrides.colorA === 'number'
        ? `${overrides.colorA}`
        : overrides.colorA,
    colorB:
      typeof overrides.colorB === 'number'
        ? `${overrides.colorB}`
        : overrides.colorB,
  }
}

module.exports = {
  toArray,
  makeLabel,
  makeBadgeData,
}
