'use strict'

const Joi = require('joi')
const { nonNegativeInteger } = require('../validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('quality score (valid)')
  .get('/432.json')
  .expectJSONTypes(
    Joi.object().keys({ name: 'quality', value: nonNegativeInteger })
  )

t.create('quality score (not found)')
  .get('/0101.json')
  .expectJSON({ name: 'quality', value: 'no score available' })
