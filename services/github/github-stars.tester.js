'use strict'

const Joi = require('joi')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Stars')
  .get('/badges/shields.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'stars',
      value: Joi.string().regex(/^\w+$/),
    })
  )

t.create('Stars (repo not found)')
  .get('/badges/helmets.json')
  .expectJSON({
    name: 'stars',
    value: 'repo not found',
  })
