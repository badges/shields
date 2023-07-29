import { isSemver } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('gets the package version of com.vrchat.udonsharp')
  .get(
    '/com.vrchat.udonsharp.json?repository_url=https%3A%2F%2Fpackages.vrchat.com%2Fcurated%3Fdownload',
  )
  .expectBadge({ label: 'vpm', message: isSemver })

t.create('gets the latest version')
  .intercept(nock =>
    nock('https://packages.vrchat.com')
      .get('/curated?download')
      .reply(200, {
        packages: {
          'com.vrchat.udonsharp': {
            versions: {
              '2.0.0': {},
              '2.1.0-rc1': {},
              '1.9.0': {},
            },
          },
        },
      }),
  )
  .get(
    '/com.vrchat.udonsharp.json?repository_url=https%3A%2F%2Fpackages.vrchat.com%2Fcurated%3Fdownload',
  )
  .expectBadge({ label: 'vpm', message: 'v2.0.0' })

t.create('gets the latest version including prerelease')
  .intercept(nock =>
    nock('https://packages.vrchat.com')
      .get('/curated?download')
      .reply(200, {
        packages: {
          'com.vrchat.udonsharp': {
            versions: {
              '2.0.0': {},
              '2.1.0-rc1': {},
              '1.9.0': {},
            },
          },
        },
      }),
  )
  .get(
    '/com.vrchat.udonsharp.json?repository_url=https%3A%2F%2Fpackages.vrchat.com%2Fcurated%3Fdownload&include_prereleases',
  )
  .expectBadge({ label: 'vpm', message: 'v2.1.0-rc1' })
