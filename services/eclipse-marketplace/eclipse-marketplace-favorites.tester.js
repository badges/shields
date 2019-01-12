'use strict'

const Joi = require('joi')

const t = (module.exports = require('../create-service-tester')())

t.create('favorites count')
  .get('/notepad4e.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'favorites',
      value: Joi.number()
        .integer()
        .positive(),
    })
  )

t.create('favorites for unknown solution')
  .get('/this-does-not-exist.json')
  .expectJSON({
    name: 'favorites',
    value: 'solution not found',
  })
