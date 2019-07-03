'use strict'

const Joi = require('@hapi/joi')
const { toSvgColor } = require('../gh-badges/lib/color')
const coalesce = require('../core/base-service/coalesce')
const { svg2base64 } = require('./svg-helpers')
const logos = require('./load-logos')()
const simpleIcons = require('./load-simple-icons')()

// for backwards-compatibility with deleted logos
const logoAliases = {
  azuredevops: 'azure-devops',
  eclipse: 'eclipse-ide',
  'gitter-white': 'gitter',
  scrutinizer: 'scrutinizer-ci',
  stackoverflow: 'stack-overflow',
  tfs: 'azure-devops',
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

function isDataUrl(s) {
  try {
    Joi.assert(s, Joi.string().dataUri())
    return true
  } catch (e) {
    return false
  }
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
  if (!(name in logos)) {
    return undefined
  }

  const { svg, base64, isMonochrome } = logos[name]
  const svgColor = toSvgColor(color)
  if (svgColor && isMonochrome) {
    return svg2base64(svg.replace(/fill="(.+?)"/g, `fill="${svgColor}"`))
  } else {
    return base64
  }
}

function brightness({ r, g, b }) {
  return +((r * 299 + g * 587 + b * 114) / 255000).toFixed(2)
}

const hexColorRegex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i

function hexToRgb(hex) {
  const result = hexColorRegex.exec(hex)
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  }
}

function getSimpleIconStyle({ icon, style }) {
  const { hex } = icon
  if (style !== 'social' && brightness(hexToRgb(hex)) <= 0.4) {
    return 'light'
  }
  if (style === 'social' && brightness(hexToRgb(hex)) >= 0.6) {
    return 'dark'
  }
  return 'default'
}

function getSimpleIcon({ name, color, style }) {
  const key = name.replace(/ /g, '-')

  if (!(key in simpleIcons)) {
    return undefined
  }

  const svgColor = toSvgColor(color)
  if (svgColor) {
    return svg2base64(
      simpleIcons[key].svg.replace('<svg', `<svg fill="${svgColor}"`)
    )
  } else {
    const iconStyle = getSimpleIconStyle({ icon: simpleIcons[key], style })
    return simpleIcons[key].base64[iconStyle]
  }
}

function prepareNamedLogo({ name, color, style }) {
  if (typeof name !== 'string') {
    return undefined
  }

  name = name.toLowerCase()

  if (name in logoAliases) {
    name = logoAliases[name]
  }

  return (
    getShieldsIcon({ name, color }) || getSimpleIcon({ name, color, style })
  )
}

function makeLogo(defaultNamedLogo, overrides) {
  const maybeDataUrl = decodeDataUrlFromQueryParam(overrides.logo)
  if (maybeDataUrl) {
    return maybeDataUrl
  } else {
    return prepareNamedLogo({
      name: coalesce(overrides.logo, defaultNamedLogo),
      color: overrides.logoColor,
      style: overrides.style,
    })
  }
}

module.exports = {
  prependPrefix,
  isDataUrl,
  decodeDataUrlFromQueryParam,
  prepareNamedLogo,
  getShieldsIcon,
  getSimpleIcon,
  makeLogo,
}
