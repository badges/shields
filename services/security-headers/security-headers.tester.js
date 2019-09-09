'use strict'

const t = (module.exports = require('../tester').createServiceTester())

t.create('grade of http://shields.io')
  .get('/http/shields.io.json')
  .expectBadge({ label: 'security headers', message: 'F', color: 'red' })

t.create('grade of https://shields.io')
  .get('/https/shields.io.json')
  .expectBadge({ label: 'security headers', message: 'F', color: 'red' })

t.create('grade when no network')
  .get('/https/shields.io.json')
  .networkOff()
  .expectBadge({
    label: 'security headers',
    message: 'error',
    color: 'lightgrey',
  })
