'use strict';
const licenses = {
  'permissive': {
    licenses: ['MIT', 'Apache-2.0', 'BSD-3-Clause', 'BSD-2-Clause'],
    color: 'blue'
  },
  'viral': {
    licenses: ['GPL-2.0', 'GPL-3.0', 'AGPL-3.0', 'MPL-2.0', 'EPL-1.0', 'LGPL-3.0', 'LGPL-2.1'],
    color: 'yellow'
  },
  'public-domain': {
    licenses: ['Unlicense'],
    color: 'brightgreen'
  }
};

const licenseToColor = {};
Object.keys(licenses).forEach(licenseType => {
  licenses[licenseType].licenses.reduce((acc, licenseName) => {
    acc[licenseName] = licenses[licenseType].color;
    return acc;
  }, licenseToColor);
});

module.exports = licenseToColor;
