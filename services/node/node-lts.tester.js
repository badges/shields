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
  .intercept(
    mockPackageData({
      packageName: 'passport',
      engines: '10 - 12',
    })
  )
  .intercept(mockVersionsSha())
  .expectBadge({ label: 'node lts', message: `10 - 12`, color: `brightgreen` })

t.create('engines not satisfies all lts node versions')
  .get('/passport.json')
  .intercept(mockReleaseSchedule())
  .intercept(
    mockPackageData({
      packageName: 'passport',
      engines: '8',
    })
  )
  .intercept(mockVersionsSha())
  .expectBadge({ label: 'node lts', message: `8`, color: `orange` })

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
  .expectBadge({ label: 'node lts', message: `10`, color: `yellow` })

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
  .expectBadge({ label: 'node lts', message: `10 - 12`, color: `brightgreen` })

t.create('engines not satisfies all lts node versions - scoped')
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
  .expectBadge({ label: 'node lts', message: `8`, color: `orange` })

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
  .expectBadge({ label: 'node lts', message: `10`, color: `yellow` })

t.create('engines satisfies all lts node versions - tagged')
  .get('/ionic/next.json')
  .intercept(mockReleaseSchedule())
  .intercept(
    mockPackageData({
      packageName: 'ionic',
      engines: '10 - 12',
      tag: 'next',
    })
  )
  .intercept(mockVersionsSha())
  .expectBadge({
    label: 'node lts@next',
    message: `10 - 12`,
    color: `brightgreen`,
  })

t.create('engines not satisfies all lts node versions - tagged')
  .get('/ionic/next.json')
  .intercept(mockReleaseSchedule())
  .intercept(
    mockPackageData({
      packageName: 'ionic',
      engines: '8',
      tag: 'next',
    })
  )
  .intercept(mockVersionsSha())
  .expectBadge({ label: 'node lts@next', message: `8`, color: `orange` })

t.create('engines satisfies some lts node versions - tagged')
  .get('/ionic/next.json')
  .intercept(mockReleaseSchedule())
  .intercept(
    mockPackageData({
      packageName: 'ionic',
      engines: '10',
      tag: 'next',
    })
  )
  .intercept(mockVersionsSha())
  .expectBadge({ label: 'node lts@next', message: `10`, color: `yellow` })

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
    label: 'node lts@canary',
    message: `10 - 12`,
    color: `brightgreen`,
  })

t.create('engines not satisfies all lts node versions - scoped and tagged')
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
  .expectBadge({ label: 'node lts@canary', message: `8`, color: `orange` })

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
  .expectBadge({ label: 'node lts@canary', message: `10`, color: `yellow` })

t.create('engines satisfies all lts node versions with custom registry')
  .get('/passport.json?registry_uri=https://registry.npmjs.com')
  .intercept(mockReleaseSchedule())
  .intercept(
    mockPackageData({
      packageName: 'passport',
      engines: '10 - 12',
      registry: 'https://registry.npmjs.com',
    })
  )
  .intercept(mockVersionsSha())
  .expectBadge({ label: 'node lts', message: `10 - 12`, color: `brightgreen` })

t.create('invalid package name')
  .get('/frodo-is-not-a-package.json')
  .intercept(mockNonExistingPackageData(`frodo-is-not-a-package`))
  .expectBadge({ label: 'node lts', message: 'package not found' })
