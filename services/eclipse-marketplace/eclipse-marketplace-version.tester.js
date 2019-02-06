'use strict'

const Joi = require('joi')
const { isVPlusDottedVersionAtLeastOne } = require('../test-validators')

const t = (module.exports = require('../tester').createServiceTester())

t.create('marketplace version')
  .get('/notepad4e.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'eclipse marketplace',
      value: isVPlusDottedVersionAtLeastOne,
    })
  )

t.create('last update for unknown solution')
  .get('/this-does-not-exist.json')
  .expectJSON({
    name: 'eclipse marketplace',
    value: 'solution not found',
  })
