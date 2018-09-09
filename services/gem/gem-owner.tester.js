'use strict'

const Joi = require('joi')
const createServiceTester = require('../create-service-tester')

const t = createServiceTester()
module.exports = t

t.create('users (valid)')
  .get('/raphink.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'gems',
      value: Joi.string().regex(/^[0-9]+$/),
    })
  )

t.create('users (not found)')
  .get('/not-a-package.json')
  .expectJSON({ name: 'gems', value: 'not found' })
