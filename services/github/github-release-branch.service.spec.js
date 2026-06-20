import { test, given } from 'sazerac'
import GithubReleaseBranch from './github-release-branch.service.js'

describe('GithubReleaseBranch service', function () {
  test(GithubReleaseBranch.prototype.findReleaseOnPage, () => {
    const releases = [
      { tag_name: 'v2.0.0', target_commitish: 'main', prerelease: false },
      { tag_name: 'v1.0.0', target_commitish: '1.x', prerelease: false },
    ]
    given({ releases, branch: '1.x', includePrereleases: false }).expect(
      releases[1],
    )
    given({ releases, branch: 'main', includePrereleases: false }).expect(
      releases[0],
    )
    given({ releases, branch: '2.x', includePrereleases: false }).expect(
      undefined,
    )
    given(
      {
        releases: [
          { tag_name: 'v2.0.0-beta', target_commitish: 'main', prerelease: true },
        ],
        branch: 'main',
        includePrereleases: false,
      },
    ).expect(undefined)
    given(
      {
        releases: [
          { tag_name: 'v2.0.0-beta', target_commitish: 'main', prerelease: true },
        ],
        branch: 'main',
        includePrereleases: true,
      },
    ).expect({
      tag_name: 'v2.0.0-beta',
      target_commitish: 'main',
      prerelease: true,
    })
  })

  test(GithubReleaseBranch.prototype.transform, () => {
    given({
      release: {
        tag_name: 'v9.11.0',
        target_commitish: '9.x',
        prerelease: false,
      },
      branch: '9.x',
    }).expect({
      version: 'v9.11.0',
      isPrerelease: false,
      branch: '9.x',
    })
    given({
      release: {
        tag_name: 'v2.0.0-beta',
        target_commitish: 'main',
        prerelease: true,
      },
      branch: 'main',
    }).expect({
      version: 'v2.0.0-beta',
      isPrerelease: true,
      branch: 'main',
    })
  })

  test(GithubReleaseBranch.render, () => {
    given({
      version: 'v9.11.0',
      isPrerelease: false,
      branch: '9.x',
    }).expect({
      label: 'latest-release@9.x',
      message: 'v9.11.0',
      color: 'blue',
    })
    given({
      version: 'v2.0.0-beta',
      isPrerelease: true,
      branch: 'main',
    }).expect({
      label: 'latest-release@main',
      message: 'v2.0.0-beta',
      color: 'orange',
    })
  })
})
