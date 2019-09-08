'use strict'

const t = (module.exports = require('../tester').createServiceTester())

t.create('grade of http://shields.io')
  .get('/http/shields.io.json')
  .expectBadge({ label: 'securityheaders', message: 'F', color: 'red' })

t.create('grade of https://shields.io')
  .get('/https/shields.io.json')
  .expectBadge({ label: 'securityheaders', message: 'F', color: 'red' })

t.create('grade when no network')
  .get('/https/shields.io.json')
  .networkOff()
  .expectBadge({
    label: 'securityheaders',
    message: 'error',
    color: 'lightgrey',
  })
