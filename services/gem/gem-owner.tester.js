'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')

const t = ServiceTester.forThisService()
module.exports = t

t
  .create('users (valid)')
  .get('/u/raphink.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'gems',
      value: Joi.string().regex(/^[0-9]+$/),
    })
  )

t
  .create('users (not found)')
  .get('/u/not-a-package.json')
  .expectJSON({ name: 'gems', value: 'not found' })
