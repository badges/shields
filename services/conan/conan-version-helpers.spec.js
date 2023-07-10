import { expect } from 'chai'
import { NotFound, InvalidResponse } from '../index.js'
import { parseLatestVersionFromConfig } from './conan-version-helpers.js'

describe('parseLatestVersionFromConfig', function () {
  it('returns latest available version', function () {
    expect(
      parseLatestVersionFromConfig(`
      versions:
        1.68.0:
          folder: all
        1.70.0:
          folder: all
        1.69.0:
          folder: all
      `),
    ).to.equal('1.70.0')
  })

  it('rejects invalid yaml', function () {
    expect(() => parseLatestVersionFromConfig('[')).to.throw(InvalidResponse)
  })
  it('treats no results array as invalid', function () {
    expect(() =>
      parseLatestVersionFromConfig('somethingElse: whatever'),
    ).to.throw(InvalidResponse)
  })
  it('treats empty results array as not found', function () {
    expect(() => parseLatestVersionFromConfig('versions: []')).to.throw(
      NotFound,
    )
  })
})
