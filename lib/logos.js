'use strict'

const { toSvgColor } = require('../gh-badges/lib/color')
const { svg2base64 } = require('./svg-helpers')

const logos = require('./load-logos')()
const simpleIcons = require('./load-simple-icons')()

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

function isDataUrl(s) {
  return s !== undefined && /^(data:)([^;]+);([^,]+),(.+)$/.test(s)
}

// +'s are replaced with spaces when used in query params, this returns them
// to +'s, then removes remaining whitespace.
// https://github.com/badges/shields/pull/1546
function decodeDataUrlFromQueryParam(value) {
  if (typeof value !== 'string') {
    return undefined
  }
  const maybeDataUrl = prependPrefix(value, 'data:')
    .replace(/ /g, '+')
    .replace(/\s/g, '')
  return isDataUrl(maybeDataUrl) ? maybeDataUrl : undefined
}

function getShieldsIcon(icon = '', color = '') {
  icon = typeof icon === 'string' ? icon.toLowerCase() : ''
  if (!logos[icon]) {
    return undefined
  }
  color = toSvgColor(color)
  return color
    ? svg2base64(logos[icon].svg.replace(/fill="(.+?)"/g, `fill="${color}"`))
    : logos[icon].base64
}

function getSimpleIcon(icon = '', color) {
  icon = typeof icon === 'string' ? icon.toLowerCase().replace(/ /g, '-') : ''
  if (!simpleIcons[icon]) {
    return undefined
  }
  color = toSvgColor(color)
  return color
    ? svg2base64(simpleIcons[icon].svg.replace('<svg', `<svg fill="${color}"`))
    : simpleIcons[icon].base64
}

function prepareNamedLogo({ name, color }) {
  return getShieldsIcon(name, color) || getSimpleIcon(name, color)
}

function makeLogo(defaultNamedLogo, overrides) {
  const maybeDataUrl = decodeDataUrlFromQueryParam(overrides.logo)
  if (maybeDataUrl) {
    return maybeDataUrl
  } else {
    return prepareNamedLogo({
      name: overrides.logo,
      color: overrides.logoColor,
    })
  }
}

module.exports = {
  prependPrefix,
  isDataUrl,
  decodeDataUrlFromQueryParam,
  prepareNamedLogo,
  getShieldsIcon,
  makeLogo,
}
