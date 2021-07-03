'use strict'

const { ServiceTester } = require('../tester')
const t = (module.exports = new ServiceTester({
  id: 'beerpay',
  title: 'Beerpay',
}))

t.create('no longer available (previously beerpay)')
  .get('/hashdog/scrapfy-chrome-extension.json')
  .expectBadge({
    label: 'beerpay',
    message: 'no longer available',
  })
