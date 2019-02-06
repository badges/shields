'use strict'

const Joi = require('joi')
const { ServiceTester } = require('../tester')
const { isMetric, isMetricOverTimePeriod } = require('../test-validators')

const t = new ServiceTester({ id: 'sourceforge', title: 'SourceForge' })
module.exports = t

t.create('total downloads')
  .get('/dt/sevenzip.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: isMetric,
    })
  )

t.create('monthly downloads')
  .get('/dm/sevenzip.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: isMetricOverTimePeriod,
    })
  )

t.create('weekly downloads')
  .get('/dw/sevenzip.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: isMetricOverTimePeriod,
    })
  )

t.create('daily downloads')
  .get('/dd/sevenzip.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: isMetricOverTimePeriod,
    })
  )

t.create('invalid project')
  .get('/dd/invalid.json')
  .expectJSON({
    name: 'downloads',
    value: 'invalid',
  })

t.create('total downloads (connection error)')
  .get('/dt/sevenzip.json')
  .networkOff()
  .expectJSON({
    name: 'downloads',
    value: 'inaccessible',
  })
