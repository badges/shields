'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'gemnasium',
  title: 'gemnasium',
}))

t.create('no longer available (previously dependencies)')
  .get('/mathiasbynens/he.json')
  .expectJSON({
    name: 'gemnasium',
    value: 'no longer available',
  })
