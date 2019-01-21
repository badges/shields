'use strict'

const Joi = require('joi')
const { isFormattedDate } = require('../test-validators')

const t = (module.exports = require('../create-service-tester')())

t.create('last update date')
  .get('/notepad4e.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'updated',
      value: isFormattedDate,
    })
  )

t.create('last update for unknown solution')
  .get('/this-does-not-exist.json')
  .expectJSON({
    name: 'updated',
    value: 'solution not found',
  })
