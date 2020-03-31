'use strict'

const { expect } = require('chai')
const { Range } = require('semver')
const t = (module.exports = require('../tester').createServiceTester())
const {
  mockPackageData,
  mockNonExistingPackageData,
  mockReleaseSchedule,
  mockVersionsSha,
} = require('./testUtils/test-utils')

function expectSemverRange(message) {
  expect(() => new Range(message)).not.to.throw()
}

t.create('engines satisfies all lts node versions')
  .get('/passport.json')
  .intercept(mockReleaseSchedule())
  .intercept(mockPackageData(`passport`, `10 - 12`))
  .intercept(mockVersionsSha())
  .expectBadge({ label: 'node lts', message: `10 - 12`, color: `brightgreen` })
  .afterJSON(json => {
    expectSemverRange(json.message)
  })

t.create('engines not satisfies all lts node versions')
  .get('/passport.json')
  .intercept(mockReleaseSchedule())
  .intercept(mockPackageData(`passport`, `8`))
  .intercept(mockVersionsSha())
  .expectBadge({ label: 'node lts', message: `8`, color: `orange` })
  .afterJSON(json => {
    expectSemverRange(json.message)
  })

t.create('engines satisfies some lts node versions')
  .get('/passport.json')
  .intercept(mockReleaseSchedule())
  .intercept(mockPackageData(`passport`, `10`))
  .intercept(mockVersionsSha())
  .expectBadge({ label: 'node lts', message: `10`, color: `yellow` })
  .afterJSON(json => {
    expectSemverRange(json.message)
  })

t.create('engines satisfies all lts node versions - scoped')
  .get('/@stdlib/stdlib.json')
  .intercept(mockReleaseSchedule())
  .intercept(mockPackageData(`stdlib`, `10 - 12`, `@stdlib`))
  .intercept(mockVersionsSha())
  .expectBadge({ label: 'node lts', message: `10 - 12`, color: `brightgreen` })
  .afterJSON(json => {
    expectSemverRange(json.message)
  })

t.create('engines not satisfies all lts node versions - scoped')
  .get('/@stdlib/stdlib.json')
  .intercept(mockReleaseSchedule())
  .intercept(mockPackageData(`stdlib`, `8`, `@stdlib`))
  .intercept(mockVersionsSha())
  .expectBadge({ label: 'node lts', message: `8`, color: `orange` })
  .afterJSON(json => {
    expectSemverRange(json.message)
  })

t.create('engines satisfies some lts node versions - scoped')
  .get('/@stdlib/stdlib.json')
  .intercept(mockReleaseSchedule())
  .intercept(mockPackageData(`stdlib`, `10`, `@stdlib`))
  .intercept(mockVersionsSha())
  .expectBadge({ label: 'node lts', message: `10`, color: `yellow` })
  .afterJSON(json => {
    expectSemverRange(json.message)
  })

t.create('engines satisfies all lts node versions - tagged')
  .get('/ionic/next.json')
  .intercept(mockReleaseSchedule())
  .intercept(mockPackageData(`ionic`, `10 - 12`, undefined, `next`))
  .intercept(mockVersionsSha())
  .expectBadge({
    label: 'node lts@next',
    message: `10 - 12`,
    color: `brightgreen`,
  })
  .afterJSON(json => {
    expectSemverRange(json.message)
  })

t.create('engines not satisfies all lts node versions - tagged')
  .get('/ionic/next.json')
  .intercept(mockReleaseSchedule())
  .intercept(mockPackageData(`ionic`, `8`, undefined, `next`))
  .intercept(mockVersionsSha())
  .expectBadge({ label: 'node lts@next', message: `8`, color: `orange` })
  .afterJSON(json => {
    expectSemverRange(json.message)
  })

t.create('engines satisfies some lts node versions - tagged')
  .get('/ionic/next.json')
  .intercept(mockReleaseSchedule())
  .intercept(mockPackageData(`ionic`, `10`, undefined, `next`))
  .intercept(mockVersionsSha())
  .expectBadge({ label: 'node lts@next', message: `10`, color: `yellow` })
  .afterJSON(json => {
    expectSemverRange(json.message)
  })

t.create('engines satisfies all lts node versions - scoped and tagged')
  .get('/@cycle/core/canary.json')
  .intercept(mockReleaseSchedule())
  .intercept(mockPackageData(`core`, `10 - 12`, `@cycle`, `canary`))
  .intercept(mockVersionsSha())
  .expectBadge({
    label: 'node lts@canary',
    message: `10 - 12`,
    color: `brightgreen`,
  })
  .afterJSON(json => {
    expectSemverRange(json.message)
  })

t.create('engines not satisfies all lts node versions - scoped and tagged')
  .get('/@cycle/core/canary.json')
  .intercept(mockReleaseSchedule())
  .intercept(mockPackageData(`core`, `8`, `@cycle`, `canary`))
  .intercept(mockVersionsSha())
  .expectBadge({ label: 'node lts@canary', message: `8`, color: `orange` })
  .afterJSON(json => {
    expectSemverRange(json.message)
  })

t.create('engines satisfies some lts node versions - scoped and tagged')
  .get('/@cycle/core/canary.json')
  .intercept(mockReleaseSchedule())
  .intercept(mockPackageData(`core`, `10`, `@cycle`, `canary`))
  .intercept(mockVersionsSha())
  .expectBadge({ label: 'node lts@canary', message: `10`, color: `yellow` })
  .afterJSON(json => {
    expectSemverRange(json.message)
  })

t.create('engines satisfies all lts node versions with custom registry')
  .get('/passport.json?registry_uri=https://registry.npmjs.com')
  .intercept(mockReleaseSchedule())
  .intercept(
    mockPackageData(
      `passport`,
      `10 - 12`,
      undefined,
      undefined,
      'https://registry.npmjs.com'
    )
  )
  .intercept(mockVersionsSha())
  .expectBadge({ label: 'node lts', message: `10 - 12`, color: `brightgreen` })
  .afterJSON(json => {
    expectSemverRange(json.message)
  })

t.create('invalid package name')
  .get('/frodo-is-not-a-package.json')
  .intercept(mockNonExistingPackageData(`frodo-is-not-a-package`))
  .expectBadge({ label: 'node lts', message: 'package not found' })
