'use strict'

const t = (module.exports = require('../tester').createServiceTester())
const { isCurrencyOverTime } = require('./liberapay-base')

t.create('Receiving (valid)')
  .get('/Changaco.json')
  .expectBadge({
    label: 'receives',
    message: isCurrencyOverTime,
  })

t.create('Receiving (not found)')
  .get('/does-not-exist.json')
  .expectBadge({ label: 'liberapay', message: 'not found' })

t.create('Receiving (null)')
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
  .expectBadge({ label: 'liberapay', message: 'no public receiving stats' })
