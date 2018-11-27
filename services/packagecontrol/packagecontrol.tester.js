'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')
const { isMetric, isMetricOverTimePeriod } = require('../test-validators')

const t = new ServiceTester({ id: 'packagecontrol', title: 'Package Control' })
module.exports = t

t.create('monthly downloads')
  .get('/dm/GitGutter.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: isMetricOverTimePeriod,
    })
  )

t.create('weekly downloads')
  .get('/dw/GitGutter.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: isMetricOverTimePeriod,
    })
  )

t.create('daily downloads')
  .get('/dd/GitGutter.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: isMetricOverTimePeriod,
    })
  )

t.create('total downloads')
  .get('/dt/GitGutter.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: isMetric,
    })
  )

t.create('package not found')
  .get('/dt/does-not-exist.json')
  .expectJSON({
    name: 'downloads',
    value: 'invalid',
  })
