import { ServiceTester } from '../tester.js'
import { isVPlusDottedVersionAtLeastOne } from '../test-validators.js'

export const t = new ServiceTester({
  id: 'f-droid',
  title: 'F-Droid',
})

const testPkg = 'org.fdroid.fdroid.privileged'
const testJson = `
{
  "packageName": "${testPkg}",
  "suggestedVersionCode": 2090,
  "packages": [
    {
      "versionName": "0.2.11",
      "versionCode": 2110
    },
    {
      "versionName": "0.2.10",
      "versionCode": 2100
    },
    {
      "versionName": "0.2.7",
      "versionCode": 2070
    }
  ]
}
`

const base = 'https://f-droid.org/api/v1'
const path = `/packages/${testPkg}`

t.create('f-droid.org: Package is found')
  .get(`/v/${testPkg}.json`)
  .intercept(nock => nock(base).get(path).reply(200, testJson))
  .expectBadge({ label: 'f-droid', message: 'v0.2.7' })

t.create('f-droid.org: Package is found (pre-release)')
  .get(`/v/${testPkg}.json?include_prereleases`)
  .intercept(nock => nock(base).get(path).reply(200, testJson))
  .expectBadge({ label: 'f-droid', message: 'v0.2.11' })

t.create('f-droid.org: Package is not found with 403')
  .get(`/v/${testPkg}.json`)
  .intercept(nock => nock(base).get(path).reply(403, 'some 403 text'))
  .expectBadge({ label: 'f-droid', message: 'app not found' })

t.create('f-droid.org: Package is not found with 404')
  .get('/v/io.shiels.does.not.exist.json')
  .intercept(nock =>
    nock(base)
      .get('/packages/io.shiels.does.not.exist')
      .reply(404, 'some 404 text'),
  )
  .expectBadge({ label: 'f-droid', message: 'app not found' })

t.create(
  'f-droid.org: Package is not found with no packages available (empty array)"',
)
  .get(`/v/${testPkg}.json`)
  .intercept(nock =>
    nock(base)
      .get(path)
      .reply(200, `{"packageName":"${testPkg}","packages":[]}`),
  )
  .expectBadge({ label: 'f-droid', message: 'no packages found' })

t.create(
  'f-droid.org: Package is not found with no packages available (missing array)"',
)
  .get(`/v/${testPkg}.json`)
  .intercept(nock =>
    nock(base).get(path).reply(200, `{"packageName":"${testPkg}"}`),
  )
  .expectBadge({ label: 'f-droid', message: 'no packages found' })

/* If this test fails, either the API has changed or the app was deleted. */
t.create('f-droid.org: The real api did not change')
  .get('/v/org.thosp.yourlocalweather.json')
  .expectBadge({
    label: 'f-droid',
    message: isVPlusDottedVersionAtLeastOne,
  })

const base2 = 'https://apt.izzysoft.de/fdroid/api/v1'
const path2 = `/packages/${testPkg}`

t.create('custom repo: Package is found')
  .get(`/v/${testPkg}.json?serverFqdn=apt.izzysoft.de&endpoint=fdroid`)
  .intercept(nock => nock(base2).get(path2).reply(200, testJson))
  .expectBadge({ label: 'f-droid', message: 'v0.2.7' })

t.create('custom repo: Package is found (pre-release)')
  .get(
    `/v/${testPkg}.json?serverFqdn=apt.izzysoft.de&endpoint=fdroid&include_prereleases`,
  )
  .intercept(nock => nock(base2).get(path2).reply(200, testJson))
  .expectBadge({ label: 'f-droid', message: 'v0.2.11' })

t.create('custom repo: Package is not found with 403')
  .get(`/v/${testPkg}.json?serverFqdn=apt.izzysoft.de&endpoint=fdroid`)
  .intercept(nock => nock(base2).get(path2).reply(403, 'some 403 text'))
  .expectBadge({ label: 'f-droid', message: 'app not found' })

t.create('custom repo: Package is not found with 404')
  .get(
    '/v/io.shiels.does.not.exist.json?serverFqdn=apt.izzysoft.de&endpoint=fdroid',
  )
  .intercept(nock =>
    nock(base2)
      .get('/packages/io.shiels.does.not.exist')
      .reply(404, 'some 404 text'),
  )
  .expectBadge({ label: 'f-droid', message: 'app not found' })

t.create(
  'custom repo: Package is not found with no packages available (empty array)"',
)
  .get(`/v/${testPkg}.json?serverFqdn=apt.izzysoft.de&endpoint=fdroid`)
  .intercept(nock =>
    nock(base2)
      .get(path2)
      .reply(200, `{"packageName":"${testPkg}","packages":[]}`),
  )
  .expectBadge({ label: 'f-droid', message: 'no packages found' })

t.create(
  'custom repo: Package is not found with no packages available (missing array)"',
)
  .get(`/v/${testPkg}.json?serverFqdn=apt.izzysoft.de&endpoint=fdroid`)
  .intercept(nock =>
    nock(base2).get(path2).reply(200, `{"packageName":"${testPkg}"}`),
  )
  .expectBadge({ label: 'f-droid', message: 'no packages found' })

/* If this test fails, either the API has changed or the app was deleted. */
t.create('custom repo: The real api did not change')
  .get('/v/com.looker.droidify.json?serverFqdn=apt.izzysoft.de&endpoint=fdroid')
  .expectBadge({
    label: 'f-droid',
    message: isVPlusDottedVersionAtLeastOne,
  })
