'use strict'

const Joi = require('joi')

const ServiceTester = require('../service-tester')
const t = (module.exports = new ServiceTester({
  id: 'bstats',
  title: 'bStats badges',
}))

const withRegex = re => Joi.string().regex(re)

const isNumber = withRegex(/^[-+]?\d+$/)

// Players Test
t.create('Players')
  .get('/players/1.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'players',
      value: isNumber,
    })
  )

// Servers Test
t.create('Servers')
  .get('/servers/1.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'servers',
      value: isNumber,
    })
  )
