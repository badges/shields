'use strict'

const { test, forCases, given } = require('sazerac')
const ScrutinizerCoverage = require('./scrutinizer-coverage.service')

describe('ScrutinizerCoverage', function() {
  test(ScrutinizerCoverage.render, () => {
    forCases([given({ coverage: 'unknown' }), given({})]).expect({
      message: 'unknown',
    })
    given({ coverage: 39 }).expect({
      message: '39%',
      color: 'red',
    })
    given({ coverage: 40 }).expect({
      message: '40%',
      color: 'yellow',
    })
    given({ coverage: 60 }).expect({
      message: '60%',
      color: 'yellow',
    })
    given({ coverage: 61 }).expect({
      message: '61%',
      color: 'brightgreen',
    })
  })
})
