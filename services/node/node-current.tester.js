import { expect } from 'chai'
import semverModule from 'semver'
import { createServiceTester } from '../tester.js'
import { mockPackageData, mockCurrentSha } from './testUtils/test-utils.js'
const { Range } = semverModule
export const t = await createServiceTester()

function expectSemverRange(message) {
  expect(() => new Range(message)).not.to.throw()
}

t.create('gets the node version of passport')
  .get('/passport.json')
  .expectBadge({ label: 'node' })
  .afterJSON(json => {
    expectSemverRange(json.message)
  })

t.create('engines satisfies current node version')
  .get('/passport.json')
  .intercept(
    mockPackageData({
      packageName: 'passport',
      engines: '>=0.4.0',
    })
  )
  .intercept(mockCurrentSha(13))
  .expectBadge({ label: 'node', message: `>=0.4.0`, color: `brightgreen` })

t.create('engines does not satisfy current node version')
  .get('/passport.json')
  .intercept(
    mockPackageData({
      packageName: 'passport',
      engines: '12',
    })
  )
  .intercept(mockCurrentSha(13))
  .expectBadge({ label: 'node', message: `12`, color: `yellow` })

t.create('gets the node version of @stdlib/stdlib')
  .get('/@stdlib/stdlib.json')
  .expectBadge({ label: 'node' })
  .afterJSON(json => {
    expectSemverRange(json.message)
  })

t.create('engines satisfies current node version - scoped')
  .get('/@stdlib/stdlib.json')
  .intercept(
    mockPackageData({
      packageName: 'stdlib',
      engines: '>=0.4.0',
      scope: '@stdlib',
      tag: '',
      registry: '',
    })
  )
  .intercept(mockCurrentSha(13))
  .expectBadge({ label: 'node', message: `>=0.4.0`, color: `brightgreen` })

t.create('engines does not satisfy current node version - scoped')
  .get('/@stdlib/stdlib.json')
  .intercept(
    mockPackageData({
      packageName: 'stdlib',
      engines: '12',
      scope: '@stdlib',
      tag: '',
      registry: '',
    })
  )
  .intercept(mockCurrentSha(13))
  .expectBadge({ label: 'node', message: `12`, color: `yellow` })

t.create("gets the tagged release's node version version of ionic")
  .get('/ionic/testing.json')
  .expectBadge({ label: 'node@testing' })
  .afterJSON(json => {
    expectSemverRange(json.message)
  })

t.create('engines satisfies current node version - tagged')
  .get('/ionic/testing.json')
  .intercept(
    mockPackageData({
      packageName: 'ionic',
      engines: '>=0.4.0',
      tag: 'testing',
    })
  )
  .intercept(mockCurrentSha(13))
  .expectBadge({
    label: 'node@testing',
    message: `>=0.4.0`,
    color: `brightgreen`,
  })

t.create('engines does not satisfy current node version - tagged')
  .get('/ionic/testing.json')
  .intercept(
    mockPackageData({
      packageName: 'ionic',
      engines: '12',
      tag: 'testing',
    })
  )
  .intercept(mockCurrentSha(13))
  .expectBadge({ label: 'node@testing', message: `12`, color: `yellow` })

t.create("gets the tagged release's node version of @cycle/core")
  .get('/@cycle/core/canary.json')
  .expectBadge({ label: 'node@canary' })
  .afterJSON(json => {
    expectSemverRange(json.message)
  })

t.create('engines satisfies current node version - scoped and tagged')
  .get('/@cycle/core/canary.json')
  .intercept(
    mockPackageData({
      packageName: 'core',
      engines: '>=0.4.0',
      scope: '@cycle',
      tag: 'canary',
    })
  )
  .intercept(mockCurrentSha(13))
  .expectBadge({
    label: 'node@canary',
    message: `>=0.4.0`,
    color: `brightgreen`,
  })

t.create('engines does not satisfy current node version - scoped and tagged')
  .get('/@cycle/core/canary.json')
  .intercept(
    mockPackageData({
      packageName: 'core',
      engines: '12',
      scope: '@cycle',
      tag: 'canary',
    })
  )
  .intercept(mockCurrentSha(13))
  .expectBadge({ label: 'node@canary', message: `12`, color: `yellow` })

t.create('gets the node version of passport from a custom registry')
  .get('/passport.json?registry_uri=https://registry.npmjs.com')
  .expectBadge({ label: 'node' })
  .afterJSON(json => {
    expectSemverRange(json.message)
  })

t.create('invalid package name')
  .get('/frodo-is-not-a-package.json')
  .expectBadge({ label: 'node', message: 'package not found' })
