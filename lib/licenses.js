'use strict';
const licenseTypes = {
  'permissive': {
    spxdLicenseIds: ['AFL-3.0', 'Apache-2.0', 'Artistic-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'BSD-3-Clause-Clear',
      'BSL-1.0', 'CC-BY-4.0', 'ECL-2.0', 'ISC', 'MIT', 'MS-PL', 'NCSA', 'PostgreSQL', 'Zlib'],
    color: 'blue'
  },
  'viral': {
    spxdLicenseIds: ['AGPL-3.0', 'CC-BY-SA-4.0', 'EPL-1.0', 'EUPL-1.1', 'GPL-2.0', 'GPL-3.0', 'LGPL-2.1', 'LGPL-3.0',
      'LPPL-1.3c', 'MPL-2.0', 'MS-RL', 'OFL-1.1', 'OSL-3.0'],
    color: 'yellow'
  },
  'public-domain': {
    spxdLicenseIds: ['CC0-1.0', 'Unlicense', 'WTFPL'],
    color: 'brightgreen'
  }
};

const licenseToColorMap = {};
Object.keys(licenseTypes).forEach(licenseType => {
  const { spxdLicenseIds, color } = licenseTypes[licenseType];
  spxdLicenseIds.forEach(license => {
    licenseToColorMap[license] = color;
  });
});
const defaultLicenseColor = 'orange';
const licenseToColor = (spdxId) => licenseToColorMap[spdxId] || defaultLicenseColor;

module.exports = { licenseToColor };
