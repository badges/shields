import { expect } from 'chai'
import { InvalidResponse } from '../index.js'
import { parseVersionFromVcpkgManifest } from './vcpkg-version-helpers.js'

describe('parseVersionFromVcpkgManifest', function () {
  it('returns a version when `version` field is detected', function () {
    expect(
      parseVersionFromVcpkgManifest({
        version: '2.12.1',
      }),
    ).to.equal('2.12.1')
  })

  it('returns a version when `version-date` field is detected', function () {
    expect(
      parseVersionFromVcpkgManifest({
        'version-date': '2022-12-04',
      }),
    ).to.equal('2022-12-04')
  })

  it('returns a version when `version-semver` field is detected', function () {
    expect(
      parseVersionFromVcpkgManifest({
        'version-semver': '3.11.2',
      }),
    ).to.equal('3.11.2')
  })

  it('returns a version when `version-date` field is detected', function () {
    expect(
      parseVersionFromVcpkgManifest({
        'version-string': '22.01',
      }),
    ).to.equal('22.01')
  })

  it('rejects when no version field variant is detected', function () {
    expect(() => parseVersionFromVcpkgManifest('{}')).to.throw(InvalidResponse)
  })
})
