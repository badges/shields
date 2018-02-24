'use strict';

const logos = require('./load-logos')();

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

function prependPrefix(s, prefix) {
  if (s === undefined) {
    return undefined;
  }

  s = '' + s;

  if (s.startsWith(prefix)) {
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
  const logo = overrides.logo === undefined ? undefined : '' + overrides.logo ;

  const maybeDataUri = prependPrefix(logo, 'data:');
  const maybeNamedLogo = logo === undefined ? defaultNamedLogo : logo;

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
    template: overrides.style,
    logo: makeLogo(undefined, overrides),
    logoWidth: +overrides.logoWidth,
    links: toArray(overrides.link),
    colorA: makeColor(overrides.colorA),
    colorB: makeColor(overrides.colorB),
  };
}

module.exports = {
  prependPrefix,
  isDataUri,
  isSixHex,
  makeLabel,
  makeLogo,
  makeBadgeData,
  makeColor,
  makeColorB,
  setBadgeColor
};
