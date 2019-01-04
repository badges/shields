'use strict'

const Joi = require('joi')

const t = (module.exports = require('../create-service-tester')())

t.create('start time')
  .get('/starttime.json')
  .expectJSONTypes({ name: 'start time', value: Joi.date().required() })
