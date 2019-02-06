'use strict'

const Joi = require('joi')
const { isMetric } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Patrons (valid)')
  .get('/Liberapay.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'patrons',
      value: isMetric,
    })
  )

t.create('Patrons (not found)')
  .get('/does-not-exist.json')
  .expectJSON({ name: 'liberapay', value: 'not found' })
