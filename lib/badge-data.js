'use strict'

const coalesce = require('../core/base-service/coalesce')
const toArray = require('../core/base-service/to-array')
const { makeLogo } = require('./logos')

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
//   - color and colorB
//   - labelColor and colorA
//   - maxAge
//   - cacheSeconds
//
// Note: `maxAge` and `cacheSeconds` are handled by cache(), not this function.
function makeBadgeData(defaultLabel, overrides) {
  const colorA = coalesce(overrides.labelColor, overrides.colorA)
  const colorB = coalesce(overrides.color, overrides.colorB)

  return {
    text: [makeLabel(defaultLabel, overrides), 'n/a'],
    colorscheme: 'lightgrey',
    template: overrides.style,
    logo: makeLogo(undefined, overrides),
    logoPosition: +overrides.logoPosition,
    logoWidth: +overrides.logoWidth,
    links: toArray(overrides.link),
    // Scoutcamp sometimes turns these into numbers.
    colorA: typeof colorA === 'number' ? `${colorA}` : colorA,
    colorB: typeof colorB === 'number' ? `${colorB}` : colorB,
  }
}

module.exports = {
  toArray,
  makeLabel,
  makeBadgeData,
}
