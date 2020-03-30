'use strict'

const t = (module.exports = require('../tester').createServiceTester())
const { withRegex } = require('../test-validators')

t.create('request for existing profile')
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
    message: '1.2345 tonnes',
    color: 'green',
  })

t.create('invalid profile')
  .get('/non-existent-username.json')
  .expectBadge({
    label: 'carbon offset',
    message: 'profile not found',
    color: 'red',
  })
