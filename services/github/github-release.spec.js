import { test, given } from 'sazerac'
import { GithubRelease } from './github-release.service.js'

describe('GithubRelease', function () {
  test(GithubRelease.transform, () => {
    given({ name: null, tag_name: '0.1.2', prerelease: true }, 'tag').expect({
      version: '0.1.2',
      isPrerelease: true,
    })
    given(
      { name: null, tag_name: '0.1.3', prerelease: true },
      'release'
    ).expect({
      version: '0.1.3',
      isPrerelease: true,
    })
    given(
      { name: 'fun name', tag_name: '1.0.0', prerelease: false },
      'release'
    ).expect({
      version: 'fun name',
      isPrerelease: false,
    })
  })
})
