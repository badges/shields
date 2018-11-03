'use strict'

const { valueFromSvgBadge } = require('../services/base-svg-scraping')
const nodeifySync = require('./nodeify-sync')

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
  fetchFromSvg,
}
