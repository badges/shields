'use strict'

const { expect } = require('chai')
const { Range } = require('semver')
const t = (module.exports = require('../tester').createServiceTester())
const {
  mockPackageData,
  mockCurrentSha,
  mockNonExistingPackageData,
} = require('./testUtils/test-utils')

function expectSemverRange(message) {
  expect(() => new Range(message)).not.to.throw()
}

t.create('engines satisfies current node version')
  .get('/passport.json')
  .intercept(mockPackageData(`passport`, `>=0.4.0`))
  .intercept(mockCurrentSha(13))
  .expectBadge({ label: 'node', message: `>=0.4.0`, color: `brightgreen` })
  .afterJSON(json => {
    expectSemverRange(json.message)
  })

t.create('engines not satisfies current node version')
  .get('/passport.json')
  .intercept(mockPackageData(`passport`, `12`))
  .intercept(mockCurrentSha(13))
  .expectBadge({ label: 'node', message: `12`, color: `yellow` })
  .afterJSON(json => {
    expectSemverRange(json.message)
  })

t.create('engines satisfies current node version - scoped')
  .get('/@stdlib/stdlib.json')
  .intercept(mockPackageData(`stdlib`, `>=0.4.0`, `@stdlib`))
  .intercept(mockCurrentSha(13))
  .expectBadge({ label: 'node', message: `>=0.4.0`, color: `brightgreen` })
  .afterJSON(json => {
    expectSemverRange(json.message)
  })

t.create('engines not satisfies current node version - scoped')
  .get('/@stdlib/stdlib.json')
  .intercept(mockPackageData(`stdlib`, `12`, `@stdlib`))
  .intercept(mockCurrentSha(13))
  .expectBadge({ label: 'node', message: `12`, color: `yellow` })
  .afterJSON(json => {
    expectSemverRange(json.message)
  })

t.create('engines satisfies current node version - tagged')
  .get('/ionic/next.json')
  .intercept(mockPackageData(`ionic`, `>=0.4.0`, undefined, `next`))
  .intercept(mockCurrentSha(13))
  .expectBadge({ label: 'node@next', message: `>=0.4.0`, color: `brightgreen` })
  .afterJSON(json => {
    expectSemverRange(json.message)
  })

t.create('engines not satisfies current node version - tagged')
  .get('/ionic/next.json')
  .intercept(mockPackageData(`ionic`, `12`, undefined, `next`))
  .intercept(mockCurrentSha(13))
  .expectBadge({ label: 'node@next', message: `12`, color: `yellow` })
  .afterJSON(json => {
    expectSemverRange(json.message)
  })

t.create('engines satisfies current node version - scoped and tagged')
  .get('/@cycle/core/canary.json')
  .intercept(mockPackageData(`core`, `>=0.4.0`, `@cycle`, `canary`))
  .intercept(mockCurrentSha(13))
  .expectBadge({
    label: 'node@canary',
    message: `>=0.4.0`,
    color: `brightgreen`,
  })
  .afterJSON(json => {
    expectSemverRange(json.message)
  })

t.create('engines not satisfies current node version - scoped and tagged')
  .get('/@cycle/core/canary.json')
  .intercept(mockPackageData(`core`, `12`, `@cycle`, `canary`))
  .intercept(mockCurrentSha(13))
  .expectBadge({ label: 'node@canary', message: `12`, color: `yellow` })
  .afterJSON(json => {
    expectSemverRange(json.message)
  })

t.create('engines satisfies current node version with custom registry')
  .get('/passport.json?registry_uri=https://registry.npmjs.com')
  .intercept(
    mockPackageData(
      `passport`,
      `>=0.4.0`,
      undefined,
      undefined,
      'https://registry.npmjs.com'
    )
  )
  .intercept(mockCurrentSha(13))
  .expectBadge({ label: 'node', message: `>=0.4.0`, color: `brightgreen` })
  .afterJSON(json => {
    expectSemverRange(json.message)
  })

t.create('invalid package name')
  .get('/frodo-is-not-a-package.json')
  .intercept(mockNonExistingPackageData(`frodo-is-not-a-package`))
  .expectBadge({ label: 'node', message: 'package not found' })
