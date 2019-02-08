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
  .expectJSONTypes({ name: 'crates.io', value: isSemver })

t.create('version (not found)')
  .get('/not-a-real-package.json')
  .expectJSON({ name: 'crates.io', value: 'not found' })
