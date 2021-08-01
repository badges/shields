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

t.create('Package is found')
  .get(`/v/${testPkg}.json`)
  .intercept(nock => nock(base).get(path).reply(200, testJson))
  .expectBadge({ label: 'f-droid', message: 'v0.2.7' })

t.create('Package is found (pre-release)')
  .get(`/v/${testPkg}.json?include_prereleases`)
  .intercept(nock => nock(base).get(path).reply(200, testJson))
  .expectBadge({ label: 'f-droid', message: 'v0.2.11' })

t.create('Package is not found with 403')
  .get(`/v/${testPkg}.json`)
  .intercept(nock => nock(base).get(path).reply(403, 'some 403 text'))
  .expectBadge({ label: 'f-droid', message: 'app not found' })

t.create('Package is not found with 404')
  .get('/v/io.shiels.does.not.exist.json')
  .expectBadge({ label: 'f-droid', message: 'app not found' })

t.create('Package is not found with no packages available (empty array)"')
  .get(`/v/${testPkg}.json`)
  .intercept(nock =>
    nock(base)
      .get(path)
      .reply(200, `{"packageName":"${testPkg}","packages":[]}`)
  )
  .expectBadge({ label: 'f-droid', message: 'no packages found' })

t.create('Package is not found with no packages available (missing array)"')
  .get(`/v/${testPkg}.json`)
  .intercept(nock =>
    nock(base).get(path).reply(200, `{"packageName":"${testPkg}"}`)
  )
  .expectBadge({ label: 'f-droid', message: 'no packages found' })

/* If this test fails, either the API has changed or the app was deleted. */
t.create('The real api did not change')
  .get('/v/org.thosp.yourlocalweather.json')
  .expectBadge({
    label: 'f-droid',
    message: isVPlusDottedVersionAtLeastOne,
  })
