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

function isValidStyle(style) {
  const validStyles = ['default', 'plastic', 'flat', 'flat-square', 'for-the-badge', 'social'];
  return style ? validStyles.indexOf(style) >= 0 : false;
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
    text: {
        _0: overrides.label || defaultLabel,
        get 0() { return overrides.label || this._0 },
        set 0(label) { this._0 = label },
        1: 'n/a',
      },
    _colorscheme: 'lightgrey',
    get colorscheme() { return overrides.colorscheme || this._colorscheme },
    set colorscheme(colorscheme) { this._colorscheme = colorscheme },
    _template: isValidStyle(overrides.style) ? overrides.style : 'default',
    get template() { return overrides.template || this._template },
    set template(template) { this._template = template },
    _logo: makeLogo(undefined, overrides),
    get logo() { return makeLogo(undefined, overrides) || this._logo },
    set logo(logo) { this._logo = logo },
    _logoWidth: +overrides.logoWidth,
    get logoWidth() { return +overrides.logoWidth || +this._logoWidth },
    set logoWidth(logoWidth) { this._logoWidth = +logoWidth },
    links: {
        _0: toArray(overrides.link)[0],
        get 0() { return toArray(overrides.link)[0] || this._0 },
        set 0(link) { this._0 = link },
        _1: toArray(overrides.link)[1],
        get 1() { return toArray(overrides.link)[1] || this._1 },
        set 1(link) { this._1 = link }
      },
    _colorA: makeColor(overrides.colorA),
    get colorA() { return makeColor(overrides.colorA) || this._colorA },
    set colorA(color) { this._colorA = color },
    _colorB: makeColor(overrides.colorB),
    get colorB() { return makeColor(overrides.colorB) || this._colorB },
    set colorB(color) { this._colorB = color },
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
  makeColorB
};
