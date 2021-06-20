import { isVPlusDottedVersionNClausesWithOptionalSuffixAndEpoch } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Debian package (default distribution, valid)')
  .get('/apt.json')
  .expectBadge({
    label: 'debian',
    message: isVPlusDottedVersionNClausesWithOptionalSuffixAndEpoch,
  })

t.create('Debian package (default distribution, valid, query unsafe chars)')
  .get('/g++.json')
  .expectBadge({
    label: 'debian',
    message: isVPlusDottedVersionNClausesWithOptionalSuffixAndEpoch,
  })

t.create('Debian package (valid)')
  .get('/apt/unstable.json')
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
  .get('/apt/unstable.json')
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

t.create('Debian package (invalid, requested package missing from response)')
  .get('/apt/unstable.json')
  .intercept(nock =>
    nock('https://api.ftp-master.debian.org')
      .get('/madison?f=json&s=unstable&package=apt')
      .reply(200, [
        {
          other: {
            unstable: { '1.8.0': { source: 'apt', component: 'main' } },
          },
        },
      ])
  )
  .expectBadge({ label: 'debian', message: 'invalid response data' })

t.create('Debian package (not found)')
  .get('/not-a-package/stable.json')
  .expectBadge({ label: 'debian', message: 'not found' })

t.create('Debian package (distribution not found)')
  .get('/apt/not-a-distribution.json')
  .expectBadge({ label: 'debian', message: 'not found' })
