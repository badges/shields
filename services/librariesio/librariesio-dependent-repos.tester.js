'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')
const { isMetric } = require('../test-validators')

const t = new ServiceTester({
  id: 'librariesio-dependent-repos',
  title: 'Libraries.io dependent repos',
  pathPrefix: '/librariesio/dependent-repos',
})
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
