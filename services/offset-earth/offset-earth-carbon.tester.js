'use strict'

const t = (module.exports = require('../tester').createServiceTester())
const { withRegex } = require('../test-validators')

t.create('request for existing profile')
  .timeout(10000)
  .get('/offsetearth.json')
  .expectBadge({
    label: 'carbon offset',
    message: withRegex(/[\d.]+ tonnes/),
  })

t.create('request for existing profile (mock)')
  .get('/offsetearth.json')
  .intercept(nock =>
    nock('https://public.offset.earth')
      .get('/users/offsetearth/carbon-offset')
      .reply(200, { total: 1.2345 })
  )
  .expectBadge({
    label: 'carbon offset',
    message: withRegex(/[\d.]+ tonnes/),
  })

t.create('invalid profile (mock)')
  .get('/non-existent-username.json')
  .intercept(nock =>
    nock('https://public.offset.earth')
      .get('/users/non-existent-username/carbon-offset')
      .reply(404, {})
  )
  .expectBadge({ label: 'carbon offset', message: 'profile not found' })
