'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'gratipay',
  title: 'Gratipay',
}))

t.create('Receiving').get('/Gratipay.json').expectBadge({
  label: 'gratipay',
  message: 'no longer available',
})
