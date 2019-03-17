'use strict'

const { isIntegerPercentage } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Goal Progress (valid)')
  .get('/Liberapay.json')
  .expectBadge({
    label: 'goal progress',
    message: isIntegerPercentage,
  })

t.create('Goal Progress (not found)')
  .get('/does-not-exist.json')
  .expectBadge({ label: 'liberapay', message: 'not found' })

t.create('Goal Progress (no goal set)')
  .get('/Liberapay.json')
  .intercept(nock =>
    nock('https://liberapay.com')
      .get('/Liberapay/public.json')
      .reply(200, {
        npatrons: 0,
        giving: null,
        receiving: null,
        goal: null,
      })
  )
  .expectBadge({ label: 'liberapay', message: 'no public goals' })
