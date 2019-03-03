'use strict'

const t = (module.exports = require('../tester').createServiceTester())

t.create('license (valid)')
  .get('/AFNetworking.json')
  .expectBadge({ label: 'license', message: 'MIT' })

t.create('license (not found)')
  .get('/not-a-package.json')
  .expectBadge({ label: 'license', message: 'not found' })
