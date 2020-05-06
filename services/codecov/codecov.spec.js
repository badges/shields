'use strict'

const { test, forCases, given } = require('sazerac')
const Codecov = require('./codecov.service')

describe('Codecov', function () {
  test(Codecov.prototype.legacyTransform, () => {
    forCases([given({ json: {} }), given({ json: { commit: {} } })]).expect({
      coverage: 'unknown',
    })
  })

  test(Codecov.prototype.transform, () => {
    forCases([given({ data: { message: 'unknown' } })]).expect({
      coverage: 'unknown',
    })
  })

  test(Codecov.render, () => {
    given({ coverage: 'unknown' }).expect({
      message: 'unknown',
      color: 'lightgrey',
    })
  })
})
