'use strict'

const { toSvgColor } = require('../gh-badges/lib/color')
const logos = require('./load-logos')()
const simpleIcons = require('./load-simple-icons')()
const { svg2base64, isDataUri } = require('./logo-helper')

function toArray(val) {
  if (val === undefined) {
    return []
  } else if (Object(val) instanceof Array) {
    return val
  } else {
    return [val]
  }
}

function prependPrefix(s, prefix) {
  if (s === undefined) {
    return undefined
  }

  s = `${s}`

  if (s.startsWith(prefix)) {
    return s
  } else {
    return prefix + s
  }
}

function makeLabel(defaultLabel, overrides) {
  return `${
    overrides.label === undefined
      ? (defaultLabel || '').toLowerCase()
      : overrides.label
  }`
}

function getShieldsIcon(icon = '', color = '') {
  icon = typeof icon === 'string' ? icon.toLowerCase() : ''
  if (!logos[icon]) {
    return undefined
  }
  color = toSvgColor(color)
  return color
    ? logos[icon].svg.replace(/fill="(.+?)"/g, `fill="${color}"`)
    : logos[icon].base64
}

function getSimpleIcon(icon = '', color) {
  icon = typeof icon === 'string' ? icon.toLowerCase().replace(/ /g, '-') : ''
  if (!simpleIcons[icon]) {
    return undefined
  }
  color = toSvgColor(color)
  return color
    ? simpleIcons[icon].svg.replace('<svg', `<svg fill="${color}"`)
    : simpleIcons[icon].base64
}

function makeLogo(defaultNamedLogo, overrides) {
  if (overrides.logo === undefined) {
    return svg2base64(
      getShieldsIcon(defaultNamedLogo, overrides.logoColor) ||
        getSimpleIcon(defaultNamedLogo, overrides.logoColor)
    )
  }

  // +'s are replaced with spaces when used in query params, this returns them to +'s, then removes remaining whitespace - #1546
  const maybeDataUri = prependPrefix(overrides.logo, 'data:')
    .replace(/ /g, '+')
    .replace(/\s/g, '')

  if (isDataUri(maybeDataUri)) {
    return maybeDataUri
  } else {
    return svg2base64(
      getShieldsIcon(overrides.logo, overrides.logoColor) ||
        getSimpleIcon(overrides.logo, overrides.logoColor)
    )
  }
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
    colorA: `${overrides.colorA}`,
    colorB: `${overrides.colorB}`,
  }
}

module.exports = {
  toArray,
  prependPrefix,
  makeLabel,
  makeLogo,
  makeBadgeData,
}
