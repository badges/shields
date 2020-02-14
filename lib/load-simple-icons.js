'use strict'

const originalSimpleIcons = require('simple-icons')
const { svg2base64 } = require('./svg-helpers')

function loadSimpleIcons() {
  const simpleIcons = {}
  Object.keys(originalSimpleIcons).forEach(key => {
    const k = key.toLowerCase().replace(/ /g, '-')
    simpleIcons[k] = originalSimpleIcons[key]
    simpleIcons[k].base64 = {
      default: svg2base64(
        simpleIcons[k].svg.replace('<svg', `<svg fill="#${simpleIcons[k].hex}"`)
      ),
      light: svg2base64(
        simpleIcons[k].svg.replace('<svg', `<svg fill="whitesmoke"`)
      ),
      dark: svg2base64(simpleIcons[k].svg.replace('<svg', `<svg fill="#333"`)),
    }
  })
  return simpleIcons
}

module.exports = loadSimpleIcons
