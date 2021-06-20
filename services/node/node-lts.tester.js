import { expect } from 'chai'
import semverModule from 'semver'
import { createServiceTester } from '../tester.js'
import {
  mockPackageData,
  mockReleaseSchedule,
  mockVersionsSha,
} from './testUtils/test-utils.js'
const { Range } = semverModule
export const t = await createServiceTester()

function expectSemverRange(message) {
  expect(() => new Range(message)).not.to.throw()
}

t.create('gets the node version of passport')
  .get('/passport.json')
  .expectBadge({ label: 'node-lts' })
  .afterJSON(json => {
    expectSemverRange(json.message)
  })

t.create('engines satisfies all lts node versions')
  .get('/passport.json')
  .intercept(mockReleaseSchedule())
  .intercept(
    mockPackageData({
      packageName: 'passport',
      engines: '10 - 12',
    })
  )
  .intercept(mockVersionsSha())
  .expectBadge({ label: 'node-lts', message: `10 - 12`, color: `brightgreen` })

t.create('engines does not satisfy all lts node versions')
  .get('/passport.json')
  .intercept(mockReleaseSchedule())
  .intercept(
    mockPackageData({
      packageName: 'passport',
      engines: '8',
    })
  )
  .intercept(mockVersionsSha())
  .expectBadge({ label: 'node-lts', message: `8`, color: `orange` })

t.create('engines satisfies some lts node versions')
  .get('/passport.json')
  .intercept(mockReleaseSchedule())
  .intercept(
    mockPackageData({
      packageName: 'passport',
      engines: '10',
    })
  )
  .intercept(mockVersionsSha())
  .expectBadge({ label: 'node-lts', message: `10`, color: `yellow` })

t.create('gets the node version of @stdlib/stdlib')
  .get('/@stdlib/stdlib.json')
  .expectBadge({ label: 'node-lts' })
  .afterJSON(json => {
    expectSemverRange(json.message)
  })

t.create('engines satisfies all lts node versions - scoped')
  .get('/@stdlib/stdlib.json')
  .intercept(mockReleaseSchedule())
  .intercept(
    mockPackageData({
      packageName: 'stdlib',
      engines: '10 - 12',
      scope: '@stdlib',
    })
  )
  .intercept(mockVersionsSha())
  .expectBadge({ label: 'node-lts', message: `10 - 12`, color: `brightgreen` })

t.create('engines does not satisfy all lts node versions - scoped')
  .get('/@stdlib/stdlib.json')
  .intercept(mockReleaseSchedule())
  .intercept(
    mockPackageData({
      packageName: 'stdlib',
      engines: '8',
      scope: '@stdlib',
    })
  )
  .intercept(mockVersionsSha())
  .expectBadge({ label: 'node-lts', message: `8`, color: `orange` })

t.create('engines satisfies some lts node versions - scoped')
  .get('/@stdlib/stdlib.json')
  .intercept(mockReleaseSchedule())
  .intercept(
    mockPackageData({
      packageName: 'stdlib',
      engines: '10',
      scope: '@stdlib',
    })
  )
  .intercept(mockVersionsSha())
  .expectBadge({ label: 'node-lts', message: `10`, color: `yellow` })

t.create("gets the tagged release's node version version of ionic")
  .get('/ionic/testing.json')
  .expectBadge({ label: 'node-lts@testing' })
  .afterJSON(json => {
    expectSemverRange(json.message)
  })

t.create('engines satisfies all lts node versions - tagged')
  .get('/ionic/testing.json')
  .intercept(mockReleaseSchedule())
  .intercept(
    mockPackageData({
      packageName: 'ionic',
      engines: '10 - 12',
      tag: 'testing',
    })
  )
  .intercept(mockVersionsSha())
  .expectBadge({
    label: 'node-lts@testing',
    message: `10 - 12`,
    color: `brightgreen`,
  })

t.create('engines does not satisfy all lts node versions - tagged')
  .get('/ionic/testing.json')
  .intercept(mockReleaseSchedule())
  .intercept(
    mockPackageData({
      packageName: 'ionic',
      engines: '8',
      tag: 'testing',
    })
  )
  .intercept(mockVersionsSha())
  .expectBadge({ label: 'node-lts@testing', message: `8`, color: `orange` })

t.create('engines satisfies some lts node versions - tagged')
  .get('/ionic/testing.json')
  .intercept(mockReleaseSchedule())
  .intercept(
    mockPackageData({
      packageName: 'ionic',
      engines: '10',
      tag: 'testing',
    })
  )
  .intercept(mockVersionsSha())
  .expectBadge({ label: 'node-lts@testing', message: `10`, color: `yellow` })

t.create("gets the tagged release's node version of @cycle/core")
  .get('/@cycle/core/canary.json')
  .expectBadge({ label: 'node-lts@canary' })
  .afterJSON(json => {
    expectSemverRange(json.message)
  })

t.create('engines satisfies all lts node versions - scoped and tagged')
  .get('/@cycle/core/canary.json')
  .intercept(mockReleaseSchedule())
  .intercept(
    mockPackageData({
      packageName: 'core',
      engines: '10 - 12',
      scope: '@cycle',
      tag: 'canary',
    })
  )
  .intercept(mockVersionsSha())
  .expectBadge({
    label: 'node-lts@canary',
    message: `10 - 12`,
    color: `brightgreen`,
  })

t.create('engines does not satisfy all lts node versions - scoped and tagged')
  .get('/@cycle/core/canary.json')
  .intercept(mockReleaseSchedule())
  .intercept(
    mockPackageData({
      packageName: 'core',
      engines: '8',
      scope: '@cycle',
      tag: 'canary',
    })
  )
  .intercept(mockVersionsSha())
  .expectBadge({ label: 'node-lts@canary', message: `8`, color: `orange` })

t.create('engines satisfies some lts node versions - scoped and tagged')
  .get('/@cycle/core/canary.json')
  .intercept(mockReleaseSchedule())
  .intercept(
    mockPackageData({
      packageName: 'core',
      engines: '10',
      scope: '@cycle',
      tag: 'canary',
    })
  )
  .intercept(mockVersionsSha())
  .expectBadge({ label: 'node-lts@canary', message: `10`, color: `yellow` })

t.create('gets the node version of passport from a custom registry')
  .get('/passport.json?registry_uri=https://registry.npmjs.com')
  .expectBadge({ label: 'node-lts' })
  .afterJSON(json => {
    expectSemverRange(json.message)
  })

t.create('invalid package name')
  .get('/frodo-is-not-a-package.json')
  .expectBadge({ label: 'node-lts', message: 'package not found' })
