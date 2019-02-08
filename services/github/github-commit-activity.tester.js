'use strict'

const Joi = require('joi')
const { isMetricOverTimePeriod } = require('../test-validators')

const t = (module.exports = require('../tester').createServiceTester())

t.create('commit activity (1 year)')
  .get('/y/eslint/eslint.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'commit activity',
      value: isMetricOverTimePeriod,
    })
  )

t.create('commit activity (1 month)')
  .get('/m/eslint/eslint.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'commit activity',
      value: isMetricOverTimePeriod,
    })
  )

t.create('commit activity (4 weeks)')
  .get('/4w/eslint/eslint.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'commit activity',
      value: isMetricOverTimePeriod,
    })
  )

t.create('commit activity (1 week)')
  .get('/w/eslint/eslint.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'commit activity',
      value: isMetricOverTimePeriod,
    })
  )

t.create('commit activity (repo not found)')
  .get('/w/badges/helmets.json')
  .expectJSON({
    name: 'commit activity',
    value: 'repo not found',
  })
