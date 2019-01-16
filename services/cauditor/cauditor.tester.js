'use strict'

const ServiceTester = require('../service-tester')

const t = (module.exports = new ServiceTester({
  id: 'cauditor',
  title: 'Cauditor',
}))

t.create('no longer available')
  .get('/mi/matthiasmullie/scrapbook/master.json')
  .expectJSON({
    name: 'cauditor',
    value: 'no longer available',
  })
