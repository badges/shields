'use strict'

const Joi = require('joi')
const { isVPlusDottedVersionAtLeastOne } = require('../test-validators')

const t = (module.exports = require('../create-service-tester')())

t.create('version (valid)')
  .get('/formatador.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'gem',
      value: isVPlusDottedVersionAtLeastOne,
    })
  )

t.create('version (not found)')
  .get('/not-a-package.json')
  .expectJSON({ name: 'gem', value: 'not found' })
