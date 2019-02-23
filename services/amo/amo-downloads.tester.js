'use strict'

const Joi = require('joi')
const { ServiceTester } = require('../tester')
const { isMetricOverTimePeriod } = require('../test-validators')
const t = (module.exports = new ServiceTester({ id: 'amo', title: 'AMO' }))

t.create('Weekly Downloads')
  .get('/dw/IndieGala-Helper.json')
  .expectJSONTypes(
    Joi.object().keys({ name: 'downloads', value: isMetricOverTimePeriod })
  )

t.create('Weekly Downloads (not found)')
  .get('/dw/not-a-real-plugin.json')
  .expectJSON({ name: 'downloads', value: 'not found' })

t.create('Total Downloads (no longer available)')
  .get('/d/IndieGala-Helper.json')
  .expectJSON({ name: 'downloads', value: 'no longer available' })
