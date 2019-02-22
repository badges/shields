'use strict'

const Joi = require('joi')
const { isIntegerPercentage } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('gets coverage status')
  .get('/github/codecov/example-python.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'coverage',
      value: isIntegerPercentage,
    })
  )

t.create('gets coverage status for branch')
  .get('/github/codecov/example-python/master.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'coverage',
      value: isIntegerPercentage,
    })
  )

t.create('handles unknown project')
  .get('/github/codecov2/example-python.json')
  .expectJSON({ name: 'coverage', value: 'repository not found' })

