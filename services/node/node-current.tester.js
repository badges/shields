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
  .intercept(
    mockPackageData({
      packageName: 'passport',
      engines: '>=0.4.0',
    })
  )
  .intercept(mockCurrentSha(13))
  .expectBadge({ label: 'node', message: `>=0.4.0`, color: `brightgreen` })

t.create('engines not satisfies current node version')
  .get('/passport.json')
  .intercept(
    mockPackageData({
      packageName: 'passport',
      engines: '12',
    })
  )
  .intercept(mockCurrentSha(13))
  .expectBadge({ label: 'node', message: `12`, color: `yellow` })

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

t.create('engines not satisfies current node version - scoped')
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

t.create('engines satisfies current node version - tagged')
  .get('/ionic/next.json')
  .intercept(
    mockPackageData({
      packageName: 'ionic',
      engines: '>=0.4.0',
      tag: 'next',
    })
  )
  .intercept(mockCurrentSha(13))
  .expectBadge({ label: 'node@next', message: `>=0.4.0`, color: `brightgreen` })

t.create('engines not satisfies current node version - tagged')
  .get('/ionic/next.json')
  .intercept(
    mockPackageData({
      packageName: 'ionic',
      engines: '12',
      tag: 'next',
    })
  )
  .intercept(mockCurrentSha(13))
  .expectBadge({ label: 'node@next', message: `12`, color: `yellow` })

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

t.create('engines not satisfies current node version - scoped and tagged')
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

t.create('engines satisfies current node version with custom registry')
  .get('/passport.json?registry_uri=https://registry.npmjs.com')
  .intercept(
    mockPackageData({
      packageName: 'passport',
      engines: '>=0.4.0',
      registry: 'https://registry.npmjs.com',
    })
  )
  .intercept(mockCurrentSha(13))
  .expectBadge({ label: 'node', message: `>=0.4.0`, color: `brightgreen` })

t.create('invalid package name')
  .get('/frodo-is-not-a-package.json')
  .intercept(mockNonExistingPackageData(`frodo-is-not-a-package`))
  .expectBadge({ label: 'node', message: 'package not found' })
