'use strict'

const { isPercentage } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('module feedback').get('/camptocamp/openssl.json').expectBadge({
  label: 'score',
  message: isPercentage,
})

t.create('module feedback (no ratings)')
  .get('/camptocamp/openssl.json')
  .intercept(nock =>
    nock('https://forgeapi.puppetlabs.com/v3/modules')
      .get('/camptocamp-openssl')
      .reply(200, {
        endorsement: null,
        feedback_score: null,
        downloads: 0,
        current_release: { pdk: false, version: '1.0.0' },
      })
  )
  .expectBadge({
    label: 'score',
    message: 'unknown',
  })

t.create('module feedback (not found)')
  .get('/notarealuser/notarealpackage.json')
  .expectBadge({
    label: 'score',
    message: 'not found',
  })
