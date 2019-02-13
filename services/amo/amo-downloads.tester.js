'use strict'

const Joi = require('joi')
const { isMetric } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Downloads')
  .get('/IndieGala-Helper.json')
  .expectJSONTypes(Joi.object().keys({ name: 'downloads', value: isMetric }))

t.create('Downloads (not found)')
  .get('/not-a-real-plugin.json')
  .expectJSON({ name: 'downloads', value: 'not found' })
