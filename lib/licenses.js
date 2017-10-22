'use strict';
const licenseTypes = {
  'permissive': {
    spxdLicenseIds: ['MIT', 'Apache-2.0', 'BSD-3-Clause', 'BSD-2-Clause'],
    color: 'blue'
  },
  'viral': {
    spxdLicenseIds: ['GPL-2.0', 'GPL-3.0', 'AGPL-3.0', 'MPL-2.0', 'EPL-1.0', 'LGPL-3.0', 'LGPL-2.1'],
    color: 'yellow'
  },
  'public-domain': {
    spxdLicenseIds: ['Unlicense'],
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
