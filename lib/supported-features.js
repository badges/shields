'use strict';

const advertisedStyles = [
  'plastic',
  'flat',
  'flat-square',
  'for-the-badge',
  'social',
];

const validStyles = advertisedStyles.concat(['default', '_shields_test']);

function isValidStyle(style) {
  return style ? validStyles.indexOf(style) >= 0 : false;
}

module.exports = {
  advertisedStyles,
  isValidStyle,
};
