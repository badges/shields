'use strict'

const Joi = require('joi')
const { isVPlusDottedVersionAtLeastOne } = require('../test-validators')

const t = (module.exports = require('../create-service-tester'))

t.create('iTunes version (valid)')
  .get('/v/324684580.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'itunes app store',
      value: isVPlusDottedVersionAtLeastOne,
    })
  )

t.create('iTunes version (not found)')
  .get('/v/9.json')
  .expectJSON({ name: 'itunes app store', value: 'not found' })

t.create('iTunes version (invalid)')
  .get('/v/x.json')
  .expectJSON({ name: 'itunes app store', value: 'invalid' })
