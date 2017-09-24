function toArray (val) {
  if (val === undefined) {
    return [];
  } else if (Object(val) instanceof Array) {
    return val;
  } else {
    return [val];
  }
}

function prependDataScheme (s) {
  if (/^data:/.test(s)) {
    return s;
  } else {
    return 'data:' + s;
  }
}

function isSixHex (s) {
  return s !== undefined && /^[0-9a-fA-F]{6}$/.test(s);
}

function isValidStyle (style) {
  const validStyles = ['default', 'plastic', 'flat', 'flat-square', 'social'];
  return style ? validStyles.indexOf(style) >= 0 : false;
}

function isDarkBackgroundStyle (style) {
  const darkBackgroundTemplates = ['default', 'flat', 'flat-square'];
  return style ? darkBackgroundTemplates.indexOf(style) >= 0 : false;
}

function makeColor (color) {
  if (isSixHex(color)) {
    return '#' + color;
  } else {
    return color;
  }
}

function makeLabel (defaultLabel, overrides) {
  return overrides.label || defaultLabel;
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
function makeBadgeData (defaultLabel, overrides) {
  return {
    text: [makeLabel(defaultLabel, overrides), 'n/a'],
    colorscheme: 'lightgrey',
    template: isValidStyle(overrides.style) ? overrides.style : 'default',
    logo: overrides.logo === undefined ? undefined : prependDataScheme(overrides.logo),
    logoWidth: +overrides.logoWidth,
    links: toArray(overrides.link),
    colorA: makeColor(overrides.colorA),
    colorB: makeColor(overrides.colorB),
  };
}

module.exports = {
  isValidStyle,
  isDarkBackgroundStyle,
  isSixHex,
  makeLabel,
  makeBadgeData,
};
