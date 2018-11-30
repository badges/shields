'use strict'

const Joi = require('joi')
const withRegex = re => Joi.string().regex(re)
const isMonthMetric = withRegex(/^[1-9][0-9]*[kMGTPEZY]?\/(month)?$/)
const t = require('../create-service-tester')()
module.exports = t

t.create('Monthly Questions for StackOverflow Momentjs')
  .get('/stackoverflow/monthlyquestions/momentjs.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'stackoverflow questions',
      value: isMonthMetric,
    })
  )

t.create('Monthly Questions for Tex Spacing')
  .get('/tex/monthlyquestions/spacing.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'tex questions',
      value: isMonthMetric,
    })
  )
