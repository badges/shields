'use strict'

const t = (module.exports = require('../tester').createServiceTester())

t.create('license (valid)')
  .get('/vibe-d.json')
  .expectJSON({ name: 'license', value: 'MIT' })

t.create('license (not found)')
  .get('/not-a-package.json')
  .expectJSON({ name: 'license', value: 'not found' })
