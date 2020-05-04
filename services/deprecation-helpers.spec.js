'use strict'

const { expect } = require('chai')
const { Deprecated } = require('../core/base-service/errors')
const { enforceDeprecation } = require('./deprecation-helpers')

describe('enforceDeprecation', function () {
  it('throws Deprecated for a date in the past', function () {
    expect(() => enforceDeprecation(new Date())).to.throw(Deprecated)
  })

  it('does not throw for a date in the future', function () {
    expect(() =>
      enforceDeprecation(new Date(Date.now() + 10000))
    ).not.to.throw()
  })
})
