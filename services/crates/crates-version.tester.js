'use strict'

const { isSemver } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('version')
  .get('/libc.json')
  .expectBadge({ label: 'crates.io', message: isSemver })

t.create('version (not found)')
  .get('/not-a-real-package.json')
  .expectBadge({ label: 'crates.io', message: 'not found' })
