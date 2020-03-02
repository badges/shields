'use strict'

const t = (module.exports = require('../tester').createServiceTester())
const { isMetric } = require('../test-validators')

t.create('profile (valid)')
  .get('/offsetearth.json')
  .expectBadge({
    label: 'trees',
    message: isMetric,
  })

t.create('profile (invalid)')
  .get('/no-profile-test.json')
  .expectBadge({ label: 'trees', message: 'profile not found' })
