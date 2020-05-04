'use strict'

const { withRegex } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('existing bitcoin address')
  .get('/skyplabs.json')
  .expectBadge({
    label: 'btc',
    message: withRegex(/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/),
  })

t.create('unknown username').get('/skyplabsssssss.json').expectBadge({
  label: 'btc',
  message: 'profile not found',
})

t.create('invalid username').get('/s.json').expectBadge({
  label: 'btc',
  message: 'invalid username',
})

t.create('missing bitcoin address').get('/test.json').expectBadge({
  label: 'btc',
  message: 'no bitcoin addresses found',
})
