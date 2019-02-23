'use strict'

const Joi = require('joi')
const t = (module.exports = require('../tester').createServiceTester())

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
  .get('/badges/shields.json?color=yellow&style=_shields_test')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'stars',
      value: Joi.string().regex(/^\w+$/),
      color: 'yellow',
    })
  )

t.create('Stars (hex color override)')
  .get('/badges/shields.json?color=abcdef&style=_shields_test')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'stars',
      value: Joi.string().regex(/^\w+$/),
      color: '#abcdef',
    })
  )
