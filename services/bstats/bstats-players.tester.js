'use strict'

const Joi = require('joi')

const t = (module.exports = require('../create-service-tester')())

const { isNumber } = require('../test-validators')

t.create('Players')
  .get('/1.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'players',
      value: isNumber,
    })
  )
