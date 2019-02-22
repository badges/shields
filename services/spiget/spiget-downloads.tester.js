'use strict'

const Joi = require('joi')
const { isMetric } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('EssentialsX (id 9089)')
  .get('/9089.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: isMetric,
    })
  )

t.create('Invalid Resource (id 1)')
  .get('/1.json')
  .expectJSON({
    name: 'downloads',
    value: 'not found',
  })
