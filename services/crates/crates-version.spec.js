'use strict'

const { test, given } = require('sazerac')
const { expect } = require('chai')
const { InvalidResponse } = require('..')
const CratesVersion = require('./crates-version.service')

describe('CratesVersion', function () {
  test(CratesVersion.prototype.transform, () => {
    given({ version: { num: '1.0.0' } }).expect({ version: '1.0.0' })
    given({ crate: { max_version: '1.1.0' } }).expect({ version: '1.1.0' })
  })

  it('throws InvalidResponse on error response', function () {
    expect(() =>
      CratesVersion.prototype.transform({ errors: [{ detail: 'idk how...' }] })
    ).to.throw(InvalidResponse)
  })
})
