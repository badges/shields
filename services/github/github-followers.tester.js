'use strict'

const Joi = require('joi')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Followers')
  .get('/webcaetano.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'followers',
      value: Joi.string().regex(/^\w+$/),
    })
  )

t.create('Followers (user not found)')
  .get('/PyvesB2.json')
  .expectJSON({
    name: 'followers',
    value: 'user not found',
  })
