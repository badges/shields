'use strict'

const { test, given } = require('sazerac')
const { svg2base64 } = require('./svg-helpers')

describe('SVG helpers', function() {
  test(svg2base64, () => {
    given('<svg xmlns="http://www.w3.org/2000/svg"/>').expect(
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciLz4='
    )
  })
})
