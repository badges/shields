'use strict'

const Joi = require('joi')

const t = (module.exports = require('../create-service-tester')())

t.create('Forks')
  .get('/badges/shields.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'forks',
      value: Joi.number()
        .integer()
        .positive(),
    })
  )

t.create('Forks (repo not found)')
  .get('/badges/helmets.json')
  .expectJSON({
    name: 'forks',
    value: 'repo not found',
  })
