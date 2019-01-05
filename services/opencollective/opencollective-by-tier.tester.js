'use strict'

const Joi = require('joi')
const { nonNegativeInteger } = require('../validators')

const t = (module.exports = require('../create-service-tester')())

t.create('gets the amount of backers in a specific tier')
  .get('/shields/monthly-backer.json')
  .expectJSONTypes(
    Joi.object().keys({ name: 'monthly-backers', value: nonNegativeInteger })
  )
