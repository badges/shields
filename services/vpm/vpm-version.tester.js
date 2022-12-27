import { isSemver } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('gets the package version of com.vrchat.udonsharp')
  .get(
    '/com.vrchat.udonsharp.json?repository_url=https%3A%2F%2Fpackages.vrchat.com%2Fcurated%3Fdownload'
  )
  .expectBadge({ label: 'vpm', message: isSemver })

t.create('gets the last released version')
  .intercept(nock =>
    nock('https://packages.vrchat.com')
      .get('/curated?download')
      .reply(200, {
        packages: {
          'com.vrchat.udonsharp': {
            '2.0.0': {},
            '1.9.0': {},
          },
        },
      })
  )
  .get(
    '/com.vrchat.udonsharp.json?repository_url=https%3A%2F%2Fpackages.vrchat.com%2Fcurated%3Fdownload'
  )
  .expectBadge({ label: 'vpm', message: 'v1.9.0' })

t.create('gets the last version sorted by semver')
  .intercept(nock =>
    nock('https://packages.vrchat.com')
      .get('/curated?download')
      .reply(200, {
        packages: {
          'com.vrchat.udonsharp': {
            '2.0.0': {},
            '1.9.0': {},
          },
        },
      })
  )
  .get(
    '/com.vrchat.udonsharp.json?sort=semver&repository_url=https%3A%2F%2Fpackages.vrchat.com%2Fcurated%3Fdownload'
  )
  .expectBadge({ label: 'vpm', message: 'v2.0.0' })
