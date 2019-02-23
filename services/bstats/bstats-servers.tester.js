'use strict'

const Joi = require('joi')
const { isMetric } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Servers')
  .get('/1.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'servers',
      value: isMetric,
    })
  )
