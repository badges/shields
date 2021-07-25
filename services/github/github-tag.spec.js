import { test, given } from 'sazerac'
import { GithubTag } from './github-tag.service.js'

describe('GithubTag', function () {
  test(GithubTag.getLatestTag, () => {
    const tagFixture = [
      'cheese', // any old string
      'v1.2', // semver release
      'v1.3-beta3', // semver pre-release
    ]
    given({
      tags: tagFixture,
      sort: 'semver',
      includePrereleases: true,
    }).expect('v1.3-beta3')
    given({
      tags: tagFixture,
      sort: 'semver',
      includePrereleases: false,
    }).expect('v1.2')
    given({
      tags: tagFixture,
      sort: 'date',
      includePrereleases: true,
    }).expect('cheese')
    given({
      tags: tagFixture,
      sort: 'date',
      includePrereleases: false,
    }).expect('cheese')

    // if there are only pre-releases to choose from
    // return a pre-release anyway in preference to nothing
    given({
      tags: ['1.2.0-beta'],
      sort: 'semver',
      includePrereleases: false,
    }).expect('1.2.0-beta')
    given({
      tags: ['1.2.0-beta'],
      sort: 'date',
      includePrereleases: false,
    }).expect('1.2.0-beta')
  })

  test(GithubTag.render, () => {
    given({ usingSemver: false, version: '1.2.3' }).expect({
      message: 'v1.2.3',
      color: 'blue',
    })
    given({ usingSemver: true, version: '2.0.0' }).expect({
      message: 'v2.0.0',
      color: 'blue',
    })
  })
})
