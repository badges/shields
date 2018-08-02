'use strict'
const licenseTypes = {
  // permissive licenses - not public domain and not copyleft
  permissive: {
    spdxLicenseIds: [
      'AFL-3.0',
      'Apache-2.0',
      'Artistic-2.0',
      'BSD-2-Clause',
      'BSD-3-Clause',
      'BSD-3-Clause-Clear',
      'BSL-1.0',
      'CC-BY-4.0',
      'ECL-2.0',
      'ISC',
      'MIT',
      'MS-PL',
      'NCSA',
      'PostgreSQL',
      'Zlib',
    ],
    color: 'green',
  },
  // copyleft licenses require 'Disclose source' (https://choosealicense.com/appendix/#disclose-source)
  // or 'Same license' (https://choosealicense.com/appendix/#same-license)
  copyleft: {
    spdxLicenseIds: [
      'AGPL-3.0',
      'CC-BY-SA-4.0',
      'EPL-1.0',
      'EUPL-1.1',
      'GPL-2.0',
      'GPL-3.0',
      'LGPL-2.1',
      'LGPL-3.0',
      'LPPL-1.3c',
      'MPL-2.0',
      'MS-RL',
      'OFL-1.1',
      'OSL-3.0',
    ],
    color: 'orange',
  },
  // public domain licenses do not require 'License and copyright notice' (https://choosealicense.com/appendix/#include-copyright)
  'public-domain': {
    spdxLicenseIds: ['CC0-1.0', 'Unlicense', 'WTFPL'],
    color: '7cd958',
  },
}

const licenseToColorMap = {}
Object.keys(licenseTypes).forEach(licenseType => {
  const { spdxLicenseIds, color } = licenseTypes[licenseType]
  spdxLicenseIds.forEach(license => {
    licenseToColorMap[license] = color
  })
})
const defaultLicenseColor = 'lightgrey'
const licenseToColor = spdxId =>
  licenseToColorMap[spdxId] || defaultLicenseColor

module.exports = { licenseToColor }
