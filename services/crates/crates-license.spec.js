import { expect } from 'chai'
import { InvalidResponse } from '../index.js'
import CratesLicense from './crates-license.service.js'

describe('CratesLicense', function () {
  it('extracts expected license given valid inputs', function () {
    expect(
      CratesLicense.transform({
        version: { num: '1.0.0', license: 'MIT' },
      }),
    ).to.deep.equal({ license: 'MIT' })

    expect(
      CratesLicense.transform({
        crate: { max_stable_version: '1.2.3' },
        versions: [{ num: '1.2.3', license: 'MIT/Apache 2.0' }],
      }),
    ).to.deep.equal({ license: 'MIT/Apache 2.0' })
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
        crate: { max_stable_version: '1.2.3' },
        versions: [{ num: '1.2.3', license: null }],
      }),
    )
      .to.throw(InvalidResponse)
      .with.property('prettyMessage', 'invalid null license')
  })
})
