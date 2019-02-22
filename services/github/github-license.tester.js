'use strict'

const { licenseToColor } = require('../../lib/licenses')
const t = (module.exports = require('../tester').createServiceTester())

const publicDomainLicenseColor = licenseToColor('CC0-1.0')
const permissiveLicenseColor = licenseToColor('MIT')
const copyleftLicenseColor = licenseToColor('GPL-3.0')
const unknownLicenseColor = licenseToColor()

t.create('Public domain license')
  .get('/github/gitignore.json?style=_shields_test')
  .expectJSON({
    name: 'license',
    value: 'CC0-1.0',
    color: `#${publicDomainLicenseColor}`,
  })

t.create('Copyleft license')
  .get('/ansible/ansible.json?style=_shields_test')
  .expectJSON({
    name: 'license',
    value: 'GPL-3.0',
    color: copyleftLicenseColor,
  })

t.create('Permissive license')
  .get('/atom/atom.json?style=_shields_test')
  .expectJSON({ name: 'license', value: 'MIT', color: permissiveLicenseColor })

t.create('License for repo without a license')
  .get('/badges/badger.json?style=_shields_test')
  .expectJSON({ name: 'license', value: 'missing', color: 'red' })

t.create('License for repo with an unrecognized license')
  .get('/philokev/sopel-noblerealms.json?style=_shields_test')
  .expectJSON({
    name: 'license',
    value: 'unknown',
    color: unknownLicenseColor,
  })

t.create('License with SPDX id not appearing in configuration')
  .get('/user1/project-with-EFL-license.json?style=_shields_test')
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/user1/project-with-EFL-license')
      .query(true)
      // GitHub API currently returns "other" as a key for repo with EFL license
      .reply(200, {
        license: {
          key: 'efl-1.0',
          name: 'Eiffel Forum License v1.0',
          spdx_id: 'EFL-1.0',
          url: 'https://api.github.com/licenses/efl-1.0',
          featured: true,
        },
      })
  )
  .expectJSON({
    name: 'license',
    value: 'EFL-1.0',
    color: unknownLicenseColor,
  })

t.create('License for unknown repo')
  .get('/user1/github-does-not-have-this-repo.json?style=_shields_test')
  .expectJSON({
    name: 'license',
    value: 'repo not found',
    color: 'lightgrey',
  })

t.create('License - API rate limit exceeded')
  .get('/user1/repo1.json?style=_shields_test')
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/user1/repo1')
      .query(true)
      .reply(403, {
        message:
          "API rate limit exceeded for 123.123.123.123. (But here's the good news: Authenticated requests get a higher rate limit. Check out the documentation for more details.)",
        documentation_url: 'https://developer.github.com/v3/#rate-limiting',
      })
  )
  .expectJSON({
    name: 'license',
    value: 'access denied',
    color: 'lightgrey',
  })
