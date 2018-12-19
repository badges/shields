'use strict'

const Joi = require('joi')
const { colorScheme: colorsB } = require('../test-helpers')

const t = (module.exports = require('../create-service-tester')())

t.create('Stars')
  .get('/badges/shields.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'stars',
      value: Joi.string().regex(/^\w+$/),
    })
  )

t.create('Stars (repo not found)')
  .get('/badges/helmets.json')
  .expectJSON({
    name: 'stars',
    value: 'repo not found',
  })

t.create('Stars (named color override)')
  .get('/badges/shields.json?colorB=yellow&style=_shields_test')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'stars',
      value: Joi.string().regex(/^\w+$/),
      colorB: Joi.equal(colorsB.yellow).required(),
    })
  )

t.create('Stars (hex color override)')
  .get('/badges/shields.json?colorB=abcdef&style=_shields_test')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'stars',
      value: Joi.string().regex(/^\w+$/),
      colorB: Joi.equal('#abcdef').required(),
    })
  )
