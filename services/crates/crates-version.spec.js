import { test, given } from 'sazerac'
import { expect } from 'chai'
import { InvalidResponse } from '../index.js'
import CratesVersion from './crates-version.service.js'

describe('CratesVersion', function () {
  test(CratesVersion.prototype.transform, () => {
    given({ crate: { max_version: '1.1.0' } }).expect('1.1.0')
    given({
      crate: { max_stable_version: '1.1.0', max_version: '1.9.0-alpha' },
    }).expect('1.1.0')
  })

  it('throws InvalidResponse on error response', function () {
    expect(() =>
      CratesVersion.prototype.transform({ errors: [{ detail: 'idk how...' }] })
    ).to.throw(InvalidResponse)
  })
})
