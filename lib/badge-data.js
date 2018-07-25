'use strict';

const isCSSColor = require('is-css-color');
const logos = require('./load-logos')();
const colorschemes = require('./colorscheme.json');

function keysToLowerCase(obj){
  Object.keys(obj).forEach(function (key) {
    const k = key.toLowerCase();
    if (k !== key) {
      obj[k] = obj[key];
      delete obj[key];
    }
  });
  return (obj);
}

const simpleIcons = keysToLowerCase(require('simple-icons'));

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

function isHexColor (s = ''){
  return /^([\da-f]{3}){1,2}$/i.test(s);
}

function makeColor(color) {
  if (isHexColor(color)) {
    return '#' + color;
  } else if (colorschemes[color] !== undefined){
    return colorschemes[color].colorB;
  } else if (isCSSColor(color)){
    return color;
  } else {
    return false;
  }
}

function makeColorB(defaultColor, overrides) {
  return makeColor(overrides.colorB || defaultColor);
}

function setBadgeColor(badgeData, color) {
  if (isHexColor(color)) {
    badgeData.colorB = '#' + color;
    delete badgeData.colorscheme;
  } else if (colorschemes[color] !== undefined){
    badgeData.colorscheme = color;
    delete badgeData.colorB;
  } else if (isCSSColor(color)){
    badgeData.colorB = color;
    delete badgeData.colorscheme;
  } else {
    badgeData.colorscheme = 'red';
    delete badgeData.colorB;
  }
  return badgeData;
}

function makeLabel(defaultLabel, overrides) {
  return overrides.label || defaultLabel;
}

function getSimpleIcon(icon = '', color = 'whitesmoke'){
  icon = icon.toLowerCase();
  if (!simpleIcons[icon]){
    return false;
  }
  color = makeColor(color) || 'whitesmoke';
  const svg = simpleIcons[icon].svg.replace('<svg', `<svg fill="${color}"`);
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}

function makeLogo(defaultNamedLogo, overrides) {
  if (overrides.logo === undefined){
    return logos[defaultNamedLogo] || getSimpleIcon(defaultNamedLogo, overrides.logoColor);
  }

  // +'s are replaced with spaces when used in query params, this returns them to +'s, then removes remaining whitespace - #1546
  const maybeDataUri = prependPrefix(overrides.logo, 'data:').replace(/ /g, '+').replace(/\s/g, '');

  if (isDataUri(maybeDataUri)) {
    return maybeDataUri;
  } else {
    return logos[overrides.logo] || getSimpleIcon(overrides.logo, overrides.logoColor);
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
  toArray,
  prependPrefix,
  isDataUri,
  isHexColor,
  makeLabel,
  makeLogo,
  makeBadgeData,
  makeColor,
  makeColorB,
  setBadgeColor
};
