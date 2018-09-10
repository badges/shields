'use strict'

const nodeifySync = require('./nodeify-sync')

const leadingWhitespace = /(?:\r\n\s*|\r\s*|\n\s*)/g

function valueFromSvgBadge(svg, valueMatcher) {
  if (typeof svg !== 'string') {
    throw TypeError('Parameter should be a string')
  }
  const stripped = svg.replace(leadingWhitespace, '')
  const match = valueMatcher.exec(stripped)
  if (match) {
    return match[1]
  } else {
    throw Error(`Can't get value from SVG:\n${svg}`)
  }
}

// Get data from a svg-style badge.
// cb: function(err, string)
function fetchFromSvg(request, url, valueMatcher, cb) {
  request(url, (err, res, buffer) => {
    if (err !== null) {
      cb(err)
    } else {
      nodeifySync(() => valueFromSvgBadge(buffer, valueMatcher), cb)
    }
  })
}

module.exports = {
  valueFromSvgBadge,
  fetchFromSvg,
}
