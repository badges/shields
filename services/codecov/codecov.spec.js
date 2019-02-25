'use strict'

const { test, given } = require('sazerac')
const Codecov = require('./codecov.service')

const unknownCoverage = { coverage: 'unknown' }

describe('Codecov', function() {
  test(Codecov.prototype.transform, () => {
    given({ json: {} }).expect(unknownCoverage)
    given({ json: { commit: {} } }).expect(unknownCoverage)
  })

  test(Codecov.render, () => {
    given(unknownCoverage).expect({
      message: 'unknown',
      color: 'lightgrey',
    })
  })
})
