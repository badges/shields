'use strict'

const Joi = require('joi')
const { nonNegativeInteger } = require('../validators')

const t = (module.exports = require('../create-service-tester')())

t.create('gets the amount of backers and sponsors')
  .get('/shields.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'backers and sponsors',
      value: nonNegativeInteger,
    })
  )
