'use strict'

const { expect } = require('chai')
const Codecov = require('./codecov.service')

const unknownCoverage = { coverage: 'unknown' }

describe('codecov transform function', function() {
  it('returns unknown coverage when there are no reports', function() {
    expect(Codecov.prototype.transform({ json: {} })).to.deep.equal(
      unknownCoverage
    )
  })

  it('returns unknown coverage when latest result has no coverage', function() {
    expect(Codecov.prototype.transform({ json: { commit: {} } })).to.deep.equal(
      unknownCoverage
    )
  })
})

describe('codecov render function', function() {
  it('renders correctly on unknown coverage', function() {
    expect(Codecov.render(unknownCoverage)).to.deep.equal({
      message: 'unknown',
      color: 'lightgrey',
    })
  })
})
