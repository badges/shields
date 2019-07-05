'use strict'

const simpleIcons = require('simple-icons')
const { svg2base64 } = require('./svg-helpers')

function loadSimpleIcons() {
  // Apply other key bindings
  Object.keys(simpleIcons).forEach(key => {
    if (key !== key.toLowerCase()) {
      simpleIcons[key.toLowerCase()] = simpleIcons[key]
      delete simpleIcons[key]
      key = key.toLowerCase()
    }

    const keys = new Set([
      key.replace(/ /g, '-'),
      key.replace(/ /g, '-').replace(/[^-\w]/g, ''),
      key.replace(/[^\w]/g, ''),
    ])

    keys.forEach(k => {
      if (k !== key) simpleIcons[k] = simpleIcons[key]
    })
  })

  Object.keys(simpleIcons).forEach(key => {
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
