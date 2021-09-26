import { expect } from 'chai'
import { InvalidResponse } from '../index.js'
import CratesLicense from './crates-license.service.js'

describe('CratesLicense', function () {
  it('throws InvalidResponse on error response', function () {
    expect(() =>
      CratesLicense.transform({ errors: [{ detail: 'invalid semver' }] })
    )
      .to.throw(InvalidResponse)
      .with.property('prettyMessage', 'invalid semver')
  })

  it('throws InvalidResponse on null license with specific version', function () {
    expect(() =>
      CratesLicense.transform({ version: { num: '1.2.3', license: null } })
    )
      .to.throw(InvalidResponse)
      .with.property('prettyMessage', 'invalid null license')
  })

  it('throws InvalidResponse on null license with latest version', function () {
    expect(() => CratesLicense.transform({ versions: [{ license: null }] }))
      .to.throw(InvalidResponse)
      .with.property('prettyMessage', 'invalid null license')
  })
})
