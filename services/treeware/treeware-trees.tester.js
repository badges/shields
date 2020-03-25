'use strict'

const t = (module.exports = require('../tester').createServiceTester())
const { isMetric } = require('../test-validators')

t.create('request for existing package')
  .get('/stoplightio/spectral.json')
  .expectBadge({
    label: 'trees',
    message: isMetric,
  })

t.create('request for existing profile (mock)')
  .get('/stoplightio/spectral.json')
  .intercept(nock =>
    nock('https://public.offset.earth')
      .get('/users/treeware/trees?ref=65c6e3e942e7464b4591e0c8b70d11d5')
      .reply(200, { total: 50 })
  )
  .expectBadge({
    label: 'trees',
    message: isMetric,
  })

t.create('invalid profile (mock)')
  .get('/non-existent-user/non-existent-package.json')
  .intercept(nock =>
    nock('https://public.offset.earth')
      .get('/users/treeware/trees?ref=54a1ec3dccd0c2702084adcf72b4f02b')
      .reply(200, { total: 0 })
  )
  .expectBadge({ label: 'trees', message: '0' })
