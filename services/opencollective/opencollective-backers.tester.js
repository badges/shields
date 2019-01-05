'use strict'

const Joi = require('joi')
const { nonNegativeInteger } = require('../validators')

const t = (module.exports = require('../create-service-tester')())

t.create('gets the amount of backers')
  .get('/shields.json')
  .expectJSONTypes(
    Joi.object().keys({ name: 'backers', value: nonNegativeInteger })
  )
