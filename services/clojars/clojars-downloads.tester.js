'use strict'

const Joi = require('joi')
const createServiceTester = require('../create-service-tester')
const { isMetric } = require('../test-validators')

const t = createServiceTester()
module.exports = t

t.create('clojars downloads (valid)')
  .get('/prismic.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: isMetric,
    })
  )

t.create('clojars downloads (not found)')
  .get('/not-a-package.json')
  .expectJSON({ name: 'downloads', value: 'not found' })
