import { expect } from 'chai'
import { test, given } from 'sazerac'
import { InvalidResponse } from '../index.js'
import CratesLicense from './crates-license.service.js'

describe('CratesLicense', function () {
  test(CratesLicense.transform, () => {
    given({
      crate: { max_stable_version: '1.0.0', max_version: '1.0.0' },
      version: { num: '1.0.0', license: 'MIT' },
      versions: [{ num: '1.0.0', license: 'MIT/Apache 2.0' }],
    }).expect({ license: 'MIT' })
    given({
      crate: { max_stable_version: '1.0.0', max_version: '1.0.0' },
      versions: [{ num: '1.0.0', license: 'MIT/Apache 2.0' }],
    }).expect({ license: 'MIT/Apache 2.0' })
  })

  it('throws InvalidResponse on error response', function () {
    expect(() =>
      CratesLicense.transform({ errors: [{ detail: 'invalid semver' }] }),
    )
      .to.throw(InvalidResponse)
      .with.property('prettyMessage', 'invalid semver')
  })

  it('throws InvalidResponse on null license with specific version', function () {
    expect(() =>
      CratesLicense.transform({ version: { num: '1.2.3', license: null } }),
    )
      .to.throw(InvalidResponse)
      .with.property('prettyMessage', 'invalid null license')
  })

  it('throws InvalidResponse on null license with latest version', function () {
    expect(() =>
      CratesLicense.transform({
        crate: { max_stable_version: '1.0.0', max_version: '1.0.0' },
        versions: [{ num: '1.0.0', license: null }],
      }),
    )
      .to.throw(InvalidResponse)
      .with.property('prettyMessage', 'invalid null license')
  })
})
