'use strict'

const { test, given, forCases } = require('sazerac')
const { svg2base64, isDataUri } = require('./logo-helper')

describe('Logo helpers', function() {
  test(svg2base64, () => {
    given('data:image/svg+xml;base64,PHN2ZyB4bWxu').expect(
      'data:image/svg+xml;base64,PHN2ZyB4bWxu'
    )
    given('<svg xmlns="http://www.w3.org/2000/svg"/>').expect(
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciLz4='
    )
    given(undefined).expect(undefined)
  })

  test(isDataUri, () => {
    given('data:image/svg+xml;base64,PHN2ZyB4bWxu').expect(true)
    forCases([given('data:foobar'), given('foobar')]).expect(false)
  })
})
