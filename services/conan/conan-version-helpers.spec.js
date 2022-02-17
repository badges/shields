import { expect } from 'chai'
import { compareVersions } from './conan-version-helpers.js'

describe('compareVersions', function () {
  it('sorts versions in expected order', function () {
    expect(
      [
        '0',
        '0.1',
        '0.1.0',
        '0.1.2',
        '1.0.1',
        '1',
        '1.0',
        '1.0.0+a',
        '1.0.0+b',
        '2.0.1-rc',
        '2.0.1',
      ].sort(compareVersions)
    ).to.deep.equal([
      '0',
      '0.1',
      '0.1.0',
      '0.1.2',
      '1.0.0+b',
      '1.0.0+a',
      '1',
      '1.0',
      '1.0.1',
      '2.0.1',
      '2.0.1-rc',
    ])
  })
})
