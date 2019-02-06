'use strict'

const Joi = require('joi')

const t = (module.exports = require('../tester').createServiceTester())

t.create('start time')
  .get('/starttime.json')
  .expectJSONTypes({ name: 'start time', value: Joi.date().required() })
