'use strict'

const ServiceTester = require('../service-tester')

const t = (module.exports = new ServiceTester({
  id: 'crates',
  title: 'crates.io',
  pathPrefix: '/crates/l',
}))

t.create('license')
  .get('/libc.json')
  .expectJSON({ name: 'license', value: 'MIT OR Apache-2.0' })

t.create('license (with version)')
  .get('/libc/0.2.44.json')
  .expectJSON({ name: 'license', value: 'MIT OR Apache-2.0' })

t.create('license (not found)')
  .get('/not-a-real-package.json')
  .expectJSON({ name: 'crates.io', value: 'not found' })
