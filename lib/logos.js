import Joi from 'joi'
import {
  toSvgColor,
  brightness,
  normalizeColor,
} from '../badge-maker/lib/color.js'
import coalesce from '../core/base-service/coalesce.js'
import { svg2base64 } from './svg-helpers.js'
import loadLogos from './load-logos.js'
import loadSimpleIcons from './load-simple-icons.js'
const logos = loadLogos()
const simpleIcons = loadSimpleIcons()

// for backwards-compatibility with deleted logos
const logoAliases = {
  azuredevops: 'azure-devops',
  eclipse: 'eclipse-ide',
  'gitter-white': 'gitter',
  scrutinizer: 'scrutinizer-ci',
  stackoverflow: 'stack-overflow',
  tfs: 'azure-devops',
}
const lightThreshold = 0.4
const darkThreshold = 0.6

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

function getSimpleIconStyle({ icon, style }) {
  const { hex } = icon
  if (style !== 'social' && brightness(normalizeColor(hex)) <= lightThreshold) {
    return 'light'
  }
  if (style === 'social' && brightness(normalizeColor(hex)) >= darkThreshold) {
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

export {
  prependPrefix,
  isDataUrl,
  decodeDataUrlFromQueryParam,
  prepareNamedLogo,
  getShieldsIcon,
  getSimpleIcon,
  makeLogo,
}
