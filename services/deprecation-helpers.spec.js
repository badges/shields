import { expect } from 'chai'
import { Deprecated } from '../core/base-service/errors.js'
import { enforceDeprecation } from './deprecation-helpers.js'

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
