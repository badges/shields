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
Object.values(licenses).forEach(licenseDefinition => {
  licenseDefinition.licenses.reduce((acc, licenseName) => {
    acc[licenseName] = licenseDefinition.color;
    return acc;
  }, licenseToColor);
});

module.exports = licenseToColor;
