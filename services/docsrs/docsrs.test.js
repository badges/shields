'use strict'

const t = (module.exports = require('../tester').createServiceTester())

t.create('Passing docs')
  .get('/tokio/0.3.0')
  .expectBadge({ label: 'docs', message: '0.3.0' })

t.create('Failing docs')
  .get('/tensorlow/0.16.1')
  .expectBadge({ label: 'docs', message: '0.16.1 | failed' })
