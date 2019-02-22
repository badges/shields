'use strict'

const Joi = require('joi')
const { isFileSize } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('repository size')
  .get('/badges/shields.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'repo size',
      value: isFileSize,
    })
  )

t.create('repository size (repo not found)')
  .get('/badges/helmets.json')
  .expectJSON({
    name: 'repo size',
    value: 'repo not found',
  })
