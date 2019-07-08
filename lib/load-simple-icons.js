'use strict'

const simpleIcons = require('simple-icons')
const { svg2base64 } = require('./svg-helpers')

function loadSimpleIcons() {
  // Apply other key bindings
  Object.keys(simpleIcons).forEach(key => {
    const _key = key
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\-.a-z0-9]/gi, '')
    if (key !== _key) {
      simpleIcons[_key] = simpleIcons[key]
      delete simpleIcons[key]
      key = _key
    }

    simpleIcons[key].base64 = {
      default: svg2base64(
        simpleIcons[key].svg.replace(
          '<svg',
          `<svg fill="#${simpleIcons[key].hex}"`
        )
      ),
      light: svg2base64(
        simpleIcons[key].svg.replace('<svg', `<svg fill="whitesmoke"`)
      ),
      dark: svg2base64(
        simpleIcons[key].svg.replace('<svg', `<svg fill="#333"`)
      ),
    }
  })

  return simpleIcons
}

module.exports = loadSimpleIcons
