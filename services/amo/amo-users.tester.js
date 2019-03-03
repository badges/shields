'use strict'

const { isMetric } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Users')
  .get('/IndieGala-Helper.json')
  .expectBadge({ label: 'users', message: isMetric })

t.create('Users (not found)')
  .get('/not-a-real-plugin.json')
  .expectBadge({ label: 'users', message: 'not found' })
