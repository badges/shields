'use strict'

const { test, given } = require('sazerac')
const GithubTag = require('./github-tag.service')

describe('GithubTag', function() {
  const tagFixture = [
    { name: 'cheese' }, // any old string
    { name: 'v1.3-beta3' }, // semver pre-release
    { name: 'v1.2' }, // semver release
  ]

  test(GithubTag.transform, () => {
    given({ json: tagFixture, usingSemver: true, includePre: false }).expect(
      'v1.2'
    )
    given({ json: tagFixture, usingSemver: true, includePre: true }).expect(
      'v1.3-beta3'
    )
    given({ json: tagFixture, usingSemver: false, includePre: false }).expect(
      'cheese'
    )
  })
})
