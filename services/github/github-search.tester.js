'use strict'

const Joi = require('joi')
const { isMetric } = require('../test-validators')

const t = (module.exports = require('../tester').createServiceTester())

t.create('hit counter')
  .get('/badges/shields/async%20handle.json')
  .expectJSONTypes(
    Joi.object().keys({ name: 'async handle counter', value: isMetric })
  )

t.create('hit counter for nonexistent repo')
  .get('/badges/puppets/async%20handle.json')
  .expectJSON({ name: 'async handle counter', value: 'repo not found' })
