'use strict'

const Joi = require('joi')

// const t = (module.exports = require('../create-service-tester')())
const ServiceTester = require('../service-tester')
const t = (module.exports = new ServiceTester({
  id: 'bstats',
  title: 'bStats',
}))

const { isNumber } = require('../test-validators')

t.create('Players')
  .get('/players/1.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'players',
      value: isNumber,
    })
  )
