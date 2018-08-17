'use strict'

const nodeifySync = require('./nodeify-sync')

const leadingWhitespace = /(?:\r\n\s*|\r\s*|\n\s*)/g
const getValue = />([^<>]+)<\/text><\/g>/

function valueFromSvgBadge(svg) {
  if (typeof svg !== 'string') {
    throw TypeError('Parameter should be a string')
  }
  const stripped = svg.replace(leadingWhitespace, '')
  const match = getValue.exec(stripped)
  if (match) {
    return match[1]
  } else {
    throw Error(`Can't get value from SVG:\n${svg}`)
  }
}

// Get data from a svg-style badge.
// cb: function(err, string)
function fetchFromSvg(request, url, cb) {
  request(url, (err, res, buffer) => {
    if (err !== null) {
      cb(err)
    } else {
      nodeifySync(() => valueFromSvgBadge(buffer), cb)
    }
  })
}

module.exports = {
  valueFromSvgBadge,
  fetchFromSvg,
}
