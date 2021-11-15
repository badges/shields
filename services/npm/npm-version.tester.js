import { isSemver } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('gets the package version of left-pad')
  .get('/left-pad.json')
  .expectBadge({ label: 'npm', message: isSemver })

t.create('gets the package version of left-pad from a custom registry')
  .get('/left-pad.json?registry_uri=https://registry.npmjs.com')
  .expectBadge({ label: 'npm', message: isSemver })

t.create('gets the package version of @cycle/core')
  .get('/@cycle/core.json')
  .expectBadge({ label: 'npm', message: isSemver })

t.create('gets a tagged package version of npm')
  .get('/npm/next-8.json')
  .expectBadge({ label: 'npm@next-8', message: isSemver })

t.create('gets the correct tagged package version of npm')
  .intercept(nock =>
    nock('https://registry.npmjs.org')
      .get('/-/package/npm/dist-tags')
      .reply(200, { latest: '1.2.3', next: '4.5.6' })
  )
  .get('/npm/next.json')
  .expectBadge({ label: 'npm@next', message: 'v4.5.6' })

t.create('returns an error for version with an invalid tag')
  .get('/npm/frodo.json')
  .expectBadge({ label: 'npm', message: 'tag not found' })

t.create('gets the package version of left-pad from a custom registry')
  .get('/left-pad.json?registry_uri=https://registry.npmjs.com')
  .expectBadge({ label: 'npm', message: isSemver })

t.create('gets the tagged package version with a "/" in the tag name')
  .intercept(nock =>
    nock('https://registry.npmjs.org')
      .get('/-/package/npm/dist-tags')
      .reply(200, { 'release/1.0': '1.0.3', latest: '2.0.1' })
  )
  .get('/npm/release/1.0.json')
  .expectBadge({ label: 'npm@release/1.0', message: 'v1.0.3' })

t.create('gets the tagged package version of @cycle/core')
  .get('/@cycle/core/canary.json')
  .expectBadge({ label: 'npm@canary', message: isSemver })

t.create(
  'gets the tagged package version of @cycle/core from a custom registry'
)
  .get('/@cycle/core/canary.json?registry_uri=https://registry.npmjs.com')
  .expectBadge({ label: 'npm@canary', message: isSemver })

t.create('invalid package name')
  .get('/frodo-is-not-a-package.json')
  .expectBadge({ label: 'npm', message: 'package not found' })

t.create("Response doesn't include a 'latest' key")
  .intercept(nock =>
    nock('https://registry.npmjs.org')
      .get('/-/package/npm/dist-tags')
      .reply(200, { next: 'v4.5.6' })
  )
  .get('/npm.json')
  .expectBadge({
    label: 'npm',
    message: 'invalid response data',
    color: 'lightgrey',
  })
