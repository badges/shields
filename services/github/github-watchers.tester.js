'use strict'

const Joi = require('joi')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Watchers')
  .get('/badges/shields.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'watchers',
      value: Joi.number()
        .integer()
        .positive(),
    })
  )

t.create('Watchers (repo not found)')
  .get('/badges/helmets.json')
  .expectJSON({
    name: 'watchers',
    value: 'repo not found',
  })
