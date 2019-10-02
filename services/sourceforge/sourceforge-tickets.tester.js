'use strict'

const { isMetric } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('bugs')
  .get('/bugs/sevenzip.json')
  .expectBadge({
    label: 'open tickets',
    message: isMetric,
  })

t.create('bugs (1500)')
  .get('/bugs/nock.json')
  .intercept(nock =>
    nock('https://sourceforge.net/rest/p')
      .get('/nock/bugs/search?limit=1&q=status%3Aopen')
      .reply(200, { count: 1500 })
  )
  .expectBadge({
    label: 'open tickets',
    message: '1.5k',
  })

t.create('feature requests')
  .get('/feature-requests/sevenzip.json')
  .expectBadge({
    label: 'open tickets',
    message: isMetric,
  })

t.create('feature requests (500)')
  .get('/feature-requests/nock.json')
  .intercept(nock =>
    nock('https://sourceforge.net/rest/p')
      .get('/nock/feature-requests/search?limit=1&q=status%3Aopen')
      .reply(200, { count: 500 })
  )
  .expectBadge({
    label: 'open tickets',
    message: '500',
  })

t.create('invalid project')
  .get('/bugs/invalid.json')
  .expectBadge({
    label: 'open tickets',
    message: 'project not found',
  })
