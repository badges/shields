import loadLogos from '../lib/load-logos.js'
import loadSimpleIcons from '../lib/load-simple-icons.js'
const shieldsLogos = Object.keys(loadLogos())
const simpleIcons = loadSimpleIcons()

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
