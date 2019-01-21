'use strict'

const { toSvgColor } = require('../gh-badges/lib/color')
const coalesce = require('./coalesce')
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

function getShieldsIcon({ name, color }) {
  const key = name.toLowerCase()

  if (!(key in logos)) {
    return undefined
  }

  const { svg, base64 } = logos[key]
  const svgColor = toSvgColor(color)
  if (svgColor) {
    return svg2base64(svg.replace(/fill="(.+?)"/g, `fill="${svgColor}"`))
  } else {
    return base64
  }
}

function getSimpleIcon({ name, color }) {
  const key = name.toLowerCase().replace(/ /g, '-')

  if (!(key in simpleIcons)) {
    return undefined
  }

  const { svg, base64 } = simpleIcons[key]
  const svgColor = toSvgColor(color)
  if (svgColor) {
    return svg2base64(svg.replace('<svg', `<svg fill="${svgColor}"`))
  } else {
    return base64
  }
}

function prepareNamedLogo({ name, color }) {
  if (typeof name !== 'string') {
    return undefined
  }

  return getShieldsIcon({ name, color }) || getSimpleIcon({ name, color })
}

function makeLogo(defaultNamedLogo, overrides) {
  const maybeDataUrl = decodeDataUrlFromQueryParam(overrides.logo)
  if (maybeDataUrl) {
    return maybeDataUrl
  } else {
    return prepareNamedLogo({
      name: coalesce(overrides.logo, defaultNamedLogo),
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
