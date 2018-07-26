'use strict';

const path = require('path');
const glob = require('glob');

const supportedFeatures = {
  logos: glob
    .sync(`${__dirname}/../logo/*.svg`)
    .map(filename => path.basename(filename, '.svg')),
  advertisedStyles: [
    'plastic',
    'flat',
    'flat-square',
    'for-the-badge',
    'social',
  ],
};

console.log(JSON.stringify(supportedFeatures, null, 2));
