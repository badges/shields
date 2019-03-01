'use strict'

const { isMetric } = require('../test-validators')
const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'bountysource',
  title: 'Bountysource',
}))

t.create('bounties (valid)')
  .get('/team/mozilla-core/activity.json')
  .expectBadge({
    label: 'bounties',
    message: isMetric,
  })

t.create('bounties (invalid team)')
  .get('/team/not-a-real-team/activity.json')
  .expectBadge({
    label: 'bounties',
    message: 'not found',
  })
