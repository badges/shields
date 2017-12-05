'use strict';

const advertisedStyles = [
  'plastic',
  'flat',
  'flat-square',
  'for-the-badge',
  'social',
];

const supportedStyles = advertisedStyles.concat(['default', '_shields_test']);

function isValidStyle(style) {
  return style ? supportedStyles.indexOf(style) >= 0 : false;
}

module.exports = {
  advertisedStyles,
  isValidStyle,
};
