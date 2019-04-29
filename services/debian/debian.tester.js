'use strict'

const {
  isVPlusDottedVersionNClausesWithOptionalSuffix,
} = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Debian package (default distribution, valid)')
  .get('/apt.json')
  .expectBadge({
    label: 'debian',
    message: isVPlusDottedVersionNClausesWithOptionalSuffix,
  })

t.create('Debian package (valid, mocked response)')
  .get('/unstable/apt.json')
  .intercept(nock =>
    nock('https://api.ftp-master.debian.org')
      .get('/madison?f=json&s=unstable&package=apt')
      .reply(200, [
        {
          apt: { unstable: { '1.8.0': { source: 'apt', component: 'main' } } },
        },
      ])
  )
  .expectBadge({ label: 'debian', message: 'v1.8.0' })

t.create('Debian package (invalid, more than one result)')
  .get('/unstable/apt.json')
  .intercept(nock =>
    nock('https://api.ftp-master.debian.org')
      .get('/madison?f=json&s=unstable&package=apt')
      .reply(200, [
        {
          apt: { unstable: { '1.8.0': { source: 'apt', component: 'main' } } },
        },
        {
          apt: { unstable: { '1.8.1': { source: 'apt', component: 'main' } } },
        },
      ])
  )
  .expectBadge({ label: 'debian', message: 'invalid response data' })

t.create('Debian package (not found)')
  .get('/stable/not-a-package.json')
  .expectBadge({ label: 'debian', message: 'not found' })

t.create('Debian package (distribution not found)')
  .get('/not-a-distribution/apt.json')
  .expectBadge({ label: 'debian', message: 'not found' })
