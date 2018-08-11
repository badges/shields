'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')
const { isMetric } = require('../test-validators')

const t = new ServiceTester({
  id: 'librariesio-dependents',
  title: 'Libraries.io dependents',
  pathPrefix: '/librariesio/dependents',
})
module.exports = t

t.create('dependent count')
  .get('/npm/got.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'dependents',
      value: isMetric,
    })
  )

t.create('dependent count (not a package)')
  .get('/npm/foobar-is-not-package.json')
  .expectJSON({
    name: 'dependents',
    value: 'package not found',
  })
