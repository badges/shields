'use strict'

const ServiceTester = require('../service-tester')

const t = (module.exports = new ServiceTester({
  id: 'gratipay',
  title: 'Gratipay',
}))

t.create('Receiving')
  .get('/Gratipay.json')
  .expectJSON({
    name: 'gratipay',
    value: 'no longer available',
  })
