'use strict'

const ServiceTester = require('../service-tester')

const t = new ServiceTester({ id: 'crates', title: 'crates.io' })
module.exports = t

t.create('license')
  .get('/l/libc.json')
  .expectJSON({ name: 'license', value: 'MIT/Apache-2.0' })

t.create('license (with version)')
  .get('/l/libc/0.2.31.json')
  .expectJSON({ name: 'license', value: 'MIT/Apache-2.0' })
