'use strict'

const { ServiceTester } = require('../tester')
const { isSemver } = require('../test-validators')

const t = (module.exports = new ServiceTester({
  id: 'crates',
  title: 'crates.io',
  pathPrefix: '/crates/v',
}))

t.create('version')
  .get('/libc.json')
  .expectBadge({ label: 'crates.io', message: isSemver })

t.create('version (not found)')
  .get('/not-a-real-package.json')
  .expectBadge({ label: 'crates.io', message: 'not found' })
