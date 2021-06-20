import { test, given } from 'sazerac'
import { _getLatestRelease } from './github-common-release.js'

describe('GithubRelease', function () {
  test(_getLatestRelease, () => {
    const releaseFixture = [
      { tag_name: 'cheese', prerelease: false }, // any old string
      { tag_name: 'v1.2', prerelease: false }, // semver release
      { tag_name: 'v1.3-beta3', prerelease: true }, // semver pre-release
    ]
    given({
      releases: releaseFixture,
      sort: 'semver',
      includePrereleases: true,
    }).expect({ tag_name: 'v1.3-beta3', prerelease: true })
    given({
      releases: releaseFixture,
      sort: 'semver',
      includePrereleases: false,
    }).expect({ tag_name: 'v1.2', prerelease: false })
    given({
      releases: releaseFixture,
      sort: 'date',
      includePrereleases: true,
    }).expect({ tag_name: 'cheese', prerelease: false })
    given({
      releases: releaseFixture,
      sort: 'date',
      includePrereleases: false,
    }).expect({ tag_name: 'cheese', prerelease: false })

    // if there are only pre-releases to choose from
    // return a pre-release anyway in preference to nothing
    given({
      releases: [{ tag_name: '1.2.0-beta', prerelease: true }],
      sort: 'semver',
      includePrereleases: false,
    }).expect({ tag_name: '1.2.0-beta', prerelease: true })
    given({
      releases: [{ tag_name: '1.2.0-beta', prerelease: true }],
      sort: 'date',
      includePrereleases: false,
    }).expect({ tag_name: '1.2.0-beta', prerelease: true })
  })
})
