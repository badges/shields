import { expect } from 'chai'
import { NotFound, InvalidResponse } from '../index.js'
import {
  compareVersions,
  parseLatestVersionFromConfig,
} from './conan-version-helpers.js'

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

describe('parseLatestVersionFromConfig', function () {
  it('returns latest available version', function () {
    expect(
      parseLatestVersionFromConfig(`
      versions:
        1.69.0:
          folder: all
        1.70.0:
          folder: all
      `)
    ).to.equal('1.70.0')
  })

  it('rejects invalid yaml', function () {
    expect(() => parseLatestVersionFromConfig('[')).to.throw(InvalidResponse)
  })
  it('treats no results array as invalid', function () {
    expect(() => parseLatestVersionFromConfig(' ')).to.throw(InvalidResponse)
  })
  it('treats empty results array as not found', function () {
    expect(() => parseLatestVersionFromConfig('versions: []')).to.throw(
      NotFound
    )
  })
})
