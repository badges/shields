'use strict'

const t = (module.exports = require('../tester').createServiceTester())

t.create('Passing docs')
  .get('/tokio/0.3.0')
  .expectBadge({ label: 'docs@0.3.0', message: 'passing' })

t.create('Failing docs')
  .get('/tensorlow/0.16.1')
  .expectBadge({ label: 'docs@1.6.1', message: 'failing' })
