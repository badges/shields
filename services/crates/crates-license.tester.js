'use strict'

const ServiceTester = require('../service-tester')

const t = new ServiceTester({
  id: 'crates',
  title: 'crates.io',
  pathPrefix: '/crates/l',
})
module.exports = t

t.create('license')
  .get('/libc.json')
  .expectJSON({ name: 'license', value: 'MIT OR Apache-2.0' })

t.create('license (with version)')
  .get('/libc/0.2.31.json')
  .expectJSON({ name: 'license', value: 'MIT OR Apache-2.0' })
