'use strict'

const ServiceTester = require('../service-tester')

const t = new ServiceTester({ id: 'gemnasium', title: 'gemnasium' })
module.exports = t

t.create('no longer available (previously dependencies)')
  .get('/mathiasbynens/he.json')
  .expectJSON({
    name: 'gemnasium',
    value: 'no longer available',
  })
