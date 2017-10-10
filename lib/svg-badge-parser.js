'use strict';

const stripWhitespaceRegex = /(?:\r\n\s*|\r\s*|\n\s*)/g;
const valueRegex = />([^<>]+)<\/text><\/g>/;

function valueFromSvgBadge(svg) {
  if (typeof svg !== 'string') {
    throw TypeError('Parameter should be a string');
  }
  const stripped = svg.replace(stripWhitespaceRegex, '');
  const match = valueRegex.exec(stripped);
  if (match) {
    return match[1];
  } else {
    throw Error(`Can't get value from SVG:\n${svg}`);
  }
}

// Get data from a svg-style badge.
// cb: function(err, string)
function fetchFromSvg(request, url, cb) {
  request(url, function(err, res, buffer) {
    if (err !== null) {
      cb(err);
      return;
    }

    try {
      const value = valueFromSvgBadge(buffer);
      cb(null, value);
    } catch(e) {
      cb(e);
    }
  });
}

module.exports = {
  valueFromSvgBadge,
  fetchFromSvg
};
