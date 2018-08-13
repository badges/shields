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

t.create('dependent count (nonexistent package)')
  .get('/npm/foobar-is-not-package.json')
  .timeout(10000)
  .expectJSON({
    name: 'dependents',
    value: 'package not found',
  })

t.create('dependent count (repo)')
  .get('/github/sindresorhus/got.json')
  .expectJSON({
    name: 'dependents',
    value: 'not supported for repos',
  })
