'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'Codetally',
  title: 'Codetally',
  pathPrefix: '/codetally',
}))

t.create('no longer available')
  .get('/triggerman722/colorstrap.json')
  .expectBadge({
    label: 'codetally',
    message: 'no longer available',
  })
