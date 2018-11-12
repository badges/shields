'use strict'

const Joi = require('joi')
const createServiceTester = require('../create-service-tester')

const t = createServiceTester()
module.exports = t

t.create('clojars downloads (valid)')
  .get('/prismic.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: /^[0-9]+$/,
    })
  )

t.create('clojars downloads (lots)')
  .get('/prismic.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: /^[0-9]+[kMGTPEZY]?$/,
    })
  )

t.create('clojars downloads (not found)')
  .get('/not-a-package.json')
  .expectJSON({ name: 'downloads', value: 'not found' })
