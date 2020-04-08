'use strict'

const t = (module.exports = require('../tester').createServiceTester())
const { isMetric } = require('../test-validators')

t.create('request for existing username')
  .get('/offsetearth.json')
  .expectBadge({
    label: 'trees',
    message: isMetric,
  })

t.create('request for existing username')
  .get('/offsetearth.json')
  .intercept(nock =>
    nock('https://public.offset.earth')
      .get('/users/offsetearth/trees')
      .reply(200, { total: 50 })
  )
  .expectBadge({
    label: 'trees',
    message: '50',
    color: 'green',
  })

t.create('invalid username')
  .get('/non-existent-username.json')
  .expectBadge({ label: 'trees', message: 'username not found', color: 'red' })
