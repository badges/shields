'use strict'

const t = (module.exports = require('../tester').createServiceTester())
const { withRegex } = require('../test-validators')

t.create('request for existing username')
  .get('/ecologi.json')
  .expectBadge({
    label: 'carbon offset',
    message: withRegex(/[\d.]+ tonnes/),
  })

t.create('invalid username').get('/non-existent-username.json').expectBadge({
  label: 'carbon offset',
  message: 'username not found',
  color: 'red',
})
