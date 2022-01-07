import { expect } from 'chai'
import { compareReferences } from './conan-version-helpers.js'

describe('compareReferences', function () {
  it('sorts versions in expected order', function () {
    expect(
      [
        { version: '0' },
        { version: '0.1' },
        { version: '0.1.0' },
        { version: '0.1.2' },
        { version: '1.0.1' },
        { version: '1' },
        { version: '1.0' },
        { version: '1.0.0+a' },
        { version: '1.0.0+b' },
        { version: '2.0.1-rc' },
        { version: '2.0.1' },
      ].sort(compareReferences)
    ).to.deep.equal([
      { version: '0' },
      { version: '0.1' },
      { version: '0.1.0' },
      { version: '0.1.2' },
      { version: '1.0.0+b' },
      { version: '1.0.0+a' },
      { version: '1' },
      { version: '1.0' },
      { version: '1.0.1' },
      { version: '2.0.1' },
      { version: '2.0.1-rc' },
    ])
  })
})
