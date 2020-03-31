'use strict'

const t = (module.exports = require('../tester').createServiceTester())
const { withRegex } = require('../test-validators')

t.create('request for existing profile')
  .get('/offsetearth.json')
  .expectBadge({
    label: 'carbon offset',
    message: withRegex(/[\d.]+ tonnes/),
  })

t.create('invalid profile')
  .get('/non-existent-username.json')
  .expectBadge({
    label: 'carbon offset',
    message: 'profile not found',
    color: 'red',
  })
