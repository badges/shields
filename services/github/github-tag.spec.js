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

  test(GithubTag.getLimit, () => {
    given({ sort: 'date', filter: undefined }).expect(1)
    given({ sort: 'date', filter: '' }).expect(1)
    given({ sort: 'date', filter: '!*-dev' }).expect(100)
    given({ sort: 'semver', filter: undefined }).expect(100)
    given({ sort: 'semver', filter: '' }).expect(100)
    given({ sort: 'semver', filter: '!*-dev' }).expect(100)
  })

  test(GithubTag.applyFilter, () => {
    const tags = ['v1.1.0', 'v1.2.0', 'server-2022-01-01']
    given({ tags, filter: undefined }).expect(tags)
    given({ tags, filter: '' }).expect(tags)
    given({ tags, filter: '*' }).expect(tags)
    given({ tags, filter: '!*' }).expect([])
    given({ tags, filter: 'foo' }).expect([])
    given({ tags, filter: 'server-*' }).expect(['server-2022-01-01'])
    given({ tags, filter: '!server-*' }).expect(['v1.1.0', 'v1.2.0'])
  })
})
