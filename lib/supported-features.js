'use strict';

const supportedStyles = [
  'plastic',
  'flat',
  'flat-square',
  'for-the-badge',
  'social',
];

const supportedStylesWithDefault = supportedStyles.concat(['default']);

function isValidStyle(style) {
  return style ? supportedStylesWithDefault.indexOf(style) >= 0 : false;
}

module.exports = {
  supportedStyles,
  isValidStyle,
};
