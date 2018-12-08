'use strict'

const Joi = require('joi')
const { isMetricOverTimePeriod } = require('../test-validators')

const t = (module.exports = require('../create-service-tester')())

t.create('Monthly Questions for StackOverflow Momentjs')
  .get('/stackoverflow/qm/momentjs.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'stackoverflow momentjs questions',
      value: isMetricOverTimePeriod,
    })
  )

t.create('Monthly Questions for Tex Spacing')
  .get('/tex/qm/spacing.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'tex spacing questions',
      value: isMetricOverTimePeriod,
    })
  )
