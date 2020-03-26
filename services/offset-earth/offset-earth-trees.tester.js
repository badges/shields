'use strict'

const t = (module.exports = require('../tester').createServiceTester())
const { isMetric } = require('../test-validators')

t.create('request for existing profile')
  .get('/offsetearth.json')
  .expectBadge({
    label: 'trees',
    message: isMetric,
  })

t.create('request for existing profile (mock)')
  .get('/offsetearth.json')
  .intercept(nock =>
    nock('https://public.offset.earth')
      .get('/users/offsetearth/trees')
      .reply(200, { total: 50 })
  )
  .expectBadge({
    label: 'trees',
    message: '50',
  })

t.create('invalid profile (mock)')
  .get('/non-existent-username.json')
  .intercept(nock =>
    nock('https://public.offset.earth')
      .get('/users/non-existent-username/trees')
      .reply(404, {})
  )
  .expectBadge({ label: 'trees', message: 'profile not found' })
