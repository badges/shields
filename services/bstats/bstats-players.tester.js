'use strict'

const Joi = require('joi')
const { isMetric } = require('../test-validators')

const t = (module.exports = require('..').createServiceTester())

t.create('Players')
  .get('/1.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'players',
      value: isMetric,
    })
  )
