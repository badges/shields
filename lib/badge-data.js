'use strict';

const logos = require('./load-logos')();
const { isValidStyle } = require('./supported-features');

function toArray(val) {
  if (val === undefined) {
    return [];
  } else if (Object(val) instanceof Array) {
    return val;
  } else {
    return [val];
  }
}

function isDataUri(s) {
  return s !== undefined && /^(data:)([^;]+);([^,]+),(.+)$/.test(s);
}

function hasPrefix(s, prefix) {
  return s !== undefined && s.slice(0, prefix.length) === prefix;
}

function prependPrefix(s, prefix) {
  if (s === undefined) {
    return undefined;
  } else if (hasPrefix(s, prefix)) {
    return s;
  } else {
    return prefix + s;
  }
}

function isSixHex (s){
  return s !== undefined && /^[0-9a-fA-F]{6}$/.test(s);
}

function makeColor(color) {
  if (isSixHex(color)) {
    return '#' + color;
  } else {
    return color;
  }
}

function makeColorB(defaultColor, overrides) {
  return makeColor(overrides.colorB || defaultColor);
}

function setBadgeColor(badgeData, color) {
  if (isSixHex(color)) {
    badgeData.colorB = '#' + color;
    delete badgeData.colorscheme;
  } else {
    badgeData.colorscheme = color;
    delete badgeData.colorB;
  }
  return badgeData;
}

function makeLabel(defaultLabel, overrides) {
  return overrides.label || defaultLabel;
}

function makeLogo(defaultNamedLogo, overrides) {
  const maybeDataUri = prependPrefix(overrides.logo, 'data:');
  const maybeNamedLogo = overrides.logo === undefined ? defaultNamedLogo : overrides.logo;

  if (isDataUri(maybeDataUri)) {
    return maybeDataUri;
  } else {
    return logos[maybeNamedLogo];
  }
}

// Generate the initial badge data. Pass the URL query parameters, which
// override the default label.
//
// The following parameters are supported:
//
//   - label
//   - style
//   - logo
//   - logoWidth
//   - link
//   - colorA
//   - colorB
//   - maxAge
//
// Note: maxAge is handled by cache(), not this function.
function makeBadgeData(defaultLabel, overrides) {
  return {
    text: [makeLabel(defaultLabel, overrides), 'n/a'],
    colorscheme: 'lightgrey',
    template: isValidStyle(overrides.style) ? overrides.style : 'default',
    logo: makeLogo(undefined, overrides),
    logoWidth: +overrides.logoWidth,
    links: toArray(overrides.link),
    colorA: makeColor(overrides.colorA),
    colorB: makeColor(overrides.colorB),
  };
}

module.exports = {
  hasPrefix,
  isDataUri,
  isValidStyle,
  isSixHex,
  makeLabel,
  makeLogo,
  makeBadgeData,
  makeColor,
  makeColorB,
  setBadgeColor
};
