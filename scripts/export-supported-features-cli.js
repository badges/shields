'use strict'

const logos = require('../lib/load-logos')()
const simpleIcons = require('../lib/load-simple-icons')()

const shieldsLogos = Object.keys(logos)

const simpleIconSet = new Set(Object.keys(simpleIcons))
shieldsLogos.forEach(logo => simpleIconSet.delete(logo))
const simpleIconNames = Array.from(simpleIconSet)

const supportedFeatures = {
  shieldsLogos,
  simpleIcons: simpleIconNames,
  advertisedStyles: [
    'plastic',
    'flat',
    'flat-square',
    'for-the-badge',
    'social',
  ],
}

console.log(JSON.stringify(supportedFeatures, null, 2))
