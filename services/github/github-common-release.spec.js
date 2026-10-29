import { test, given } from 'sazerac'
import {
  _applyFilter,
  _filterByBranch,
  _getLatestRelease,
} from './github-common-release.js'

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

  test(_applyFilter, () => {
    const releases = [
      { name: 'release/1.1.0', tag_name: 'tag/1.1.0', prerelease: false },
      { name: 'release/1.2.0', tag_name: 'tag/1.2.0', prerelease: false },
      {
        name: 'release/server-2022-01-01',
        tag_name: 'tag/server-2022-01-01',
        prerelease: false,
      },
    ]

    given({ releases, filter: undefined }).expect(releases)
    given({ releases, filter: '' }).expect(releases)
    given({ releases, filter: '*' }).expect(releases)
    given({ releases, filter: '!*' }).expect([])
    given({ releases, filter: 'foo' }).expect([])
    given({ releases, filter: 'release/server-*' }).expect([
      {
        name: 'release/server-2022-01-01',
        tag_name: 'tag/server-2022-01-01',
        prerelease: false,
      },
    ])
    given({ releases, filter: '!release/server-*' }).expect([
      { name: 'release/1.1.0', tag_name: 'tag/1.1.0', prerelease: false },
      { name: 'release/1.2.0', tag_name: 'tag/1.2.0', prerelease: false },
    ])

    given({ releases, displayName: 'tag', filter: undefined }).expect(releases)
    given({ releases, displayName: 'tag', filter: '' }).expect(releases)
    given({ releases, displayName: 'tag', filter: '*' }).expect(releases)
    given({ releases, displayName: 'tag', filter: '!*' }).expect([])
    given({ releases, displayName: 'tag', filter: 'foo' }).expect([])
    given({ releases, displayName: 'tag', filter: 'tag/server-*' }).expect([
      {
        name: 'release/server-2022-01-01',
        tag_name: 'tag/server-2022-01-01',
        prerelease: false,
      },
    ])
    given({ releases, displayName: 'tag', filter: '!tag/server-*' }).expect([
      { name: 'release/1.1.0', tag_name: 'tag/1.1.0', prerelease: false },
      { name: 'release/1.2.0', tag_name: 'tag/1.2.0', prerelease: false },
    ])
  })

  test(_filterByBranch, () => {
    const releases = [
      { tag_name: 'v5.3.0', target_commitish: 'master', prerelease: false },
      { tag_name: 'v4.22.2', target_commitish: '4.x', prerelease: false },
      { tag_name: 'v5.2.1', target_commitish: 'master', prerelease: false },
    ]

    given({ releases, branch: undefined }).expect(releases)
    given({ releases, branch: '' }).expect(releases)
    given({ releases, branch: 'master' }).expect([
      { tag_name: 'v5.3.0', target_commitish: 'master', prerelease: false },
      { tag_name: 'v5.2.1', target_commitish: 'master', prerelease: false },
    ])
    given({ releases, branch: '4.x' }).expect([
      { tag_name: 'v4.22.2', target_commitish: '4.x', prerelease: false },
    ])
    given({ releases, branch: 'no-such-branch' }).expect([])
  })
})
