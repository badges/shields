'use strict'

const simpleIcons = require('simple-icons')
const { svg2base64 } = require('./svg-helpers')

function loadSimpleIcons() {
  Object.keys(simpleIcons).forEach(key => {
    const k = key.toLowerCase().replace(/ /g, '-')
    if (k !== key) {
      simpleIcons[k] = simpleIcons[key]
      delete simpleIcons[key]
    }
    simpleIcons[k].base64 = svg2base64(
      simpleIcons[k].svg.replace('<svg', `<svg fill="#${simpleIcons[k].hex}"`)
    )
  })
  return simpleIcons
}

module.exports = loadSimpleIcons
