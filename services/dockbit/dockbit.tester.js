'use strict'

const ServiceTester = require('../service-tester')

const t = new ServiceTester({ id: 'dockbit', title: 'Dockbit' })
module.exports = t

t.create('no longer available (previously image size)')
  .get('/image-size/_/ubuntu/latest.json')
  .expectJSON({
    name: 'dockbit',
    value: 'no longer available',
  })

t.create('no longer available (previously number of layers)')
  .get('/layers/_/ubuntu/latest.json')
  .expectJSON({
    name: 'dockbit',
    value: 'no longer available',
  })
