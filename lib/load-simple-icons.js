'use strict'

const originalSimpleIcons = require('simple-icons')
const { svg2base64 } = require('./svg-helpers')

function loadSimpleIcons() {
  const simpleIcons = {}
  // As of v5 the exported keys are the svg slugs
  // Historically, Shields has supported logo specification via
  // name, name with spaces replaced by hyphens, and partially slugs
  // albeit only in cases where the slug happened to match one of those.
  // For backwards compatibility purposes we now support all three, but
  // do not broadcast the support for by-title references due to our strong
  // preference to steer users towards using the actual slugs.
  // https://github.com/badges/shields/pull/6591
  // https://github.com/badges/shields/issues/4273
  Object.keys(originalSimpleIcons).forEach(key => {
    const icon = originalSimpleIcons[key]
    const title = icon.title.toLowerCase()
    const legacyTitle = title.replace(/ /g, '-')
    icon.base64 = {
      default: svg2base64(icon.svg.replace('<svg', `<svg fill="#${icon.hex}"`)),
      light: svg2base64(icon.svg.replace('<svg', `<svg fill="whitesmoke"`)),
      dark: svg2base64(icon.svg.replace('<svg', `<svg fill="#333"`)),
    }
    simpleIcons[key] = icon
    simpleIcons[title] = icon
    simpleIcons[legacyTitle] = icon
  })
  return simpleIcons
}

module.exports = loadSimpleIcons
