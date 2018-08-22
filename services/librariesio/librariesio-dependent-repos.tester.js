'use strict'

const Joi = require('joi')
const createServiceTester = require('../create-service-tester')
const { isMetric } = require('../test-validators')

const t = createServiceTester()
module.exports = t

t.create('dependent repo count')
  .get('/npm/got.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'dependent repos',
      value: isMetric,
    })
  )

t.create('dependent repo count (not a package)')
  .get('/npm/foobar-is-not-package.json')
  .timeout(10000)
  .expectJSON({
    name: 'dependent repos',
    value: 'package not found',
  })
