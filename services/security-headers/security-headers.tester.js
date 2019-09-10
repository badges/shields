'use strict'

const t = (module.exports = require('../tester').createServiceTester())

t.create('grade of http://shields.io')
  .get('/security-headers.json?url=https://shields.io')
  .expectBadge({ label: 'security headers', message: 'F', color: 'red' })
