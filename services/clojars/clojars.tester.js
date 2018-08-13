'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')

const t = new ServiceTester({ id: 'clojars', title: 'clojars' })
module.exports = t

t.create('clojars (valid)')
  .get('/v/prismic.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'clojars',
      value: /^\[prismic "([0-9][.]?)+"\]$/, // note: https://github.com/badges/shields/pull/431
    })
  )

t.create('clojars (not found)')
  .get('/v/not-a-package.json')
  .expectJSON({ name: 'clojars', value: 'not found' })
