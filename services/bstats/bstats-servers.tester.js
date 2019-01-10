'use strict'

const Joi = require('joi')

const t = (module.exports = require('../create-service-tester')())

t.create('Servers')
  .get('/1.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'servers',
      value: Joi.number(),
    })
  )
