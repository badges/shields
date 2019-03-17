'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'cauditor',
  title: 'Cauditor',
}))

t.create('no longer available')
  .get('/mi/matthiasmullie/scrapbook/master.json')
  .expectBadge({
    label: 'cauditor',
    message: 'no longer available',
  })
