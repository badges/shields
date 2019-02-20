'use strict'

const Joi = require('joi')
const t = (module.exports = require('../tester').createServiceTester())

t.create('start time')
  .get('/starttime.json')
  .expectJSONTypes({ name: 'start time', value: Joi.date().required() })

t.create('Flip: first request')
  .get('/flip.json')
  .expectJSON({ name: 'flip', value: 'on' })

t.create('Flip: second request')
  .get('/flip.json')
  .expectJSON({ name: 'flip', value: 'off' })
