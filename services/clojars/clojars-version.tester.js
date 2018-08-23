'use strict'

const Joi = require('joi')
const createServiceTester = require('../create-service-tester')

const t = createServiceTester()
module.exports = t

t.create('clojars (valid)')
  .get('/prismic.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'clojars',
      value: /^\[prismic "([0-9][.]?)+"\]$/, // note: https://github.com/badges/shields/pull/431
    })
  )

t.create('clojars (not found)')
  .get('/not-a-package.json')
  .expectJSON({ name: 'clojars', value: 'not found' })
