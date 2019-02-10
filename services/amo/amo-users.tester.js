'use strict'

const Joi = require('joi')
const { isMetric } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Users')
  .get('/IndieGala-Helper.json')
  .expectJSONTypes(Joi.object().keys({ name: 'users', value: isMetric }))

t.create('Users (not found)')
  .get('/not-a-real-plugin.json')
  .expectJSON({ name: 'users', value: 'not found' })
