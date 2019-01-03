'use strict'

const ServiceTester = require('../service-tester')

const t = (module.exports = new ServiceTester({
  id: 'imagelayers',
  title: 'ImageLayers',
}))

t.create('no longer available (previously image size)')
  .get('/image-size/_/ubuntu/latest.json')
  .expectJSON({
    name: 'imagelayers',
    value: 'no longer available',
  })

t.create('no longer available (previously number of layers)')
  .get('/layers/_/ubuntu/latest.json')
  .expectJSON({
    name: 'imagelayers',
    value: 'no longer available',
  })
