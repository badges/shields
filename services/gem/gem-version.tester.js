'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')

const { isVPlusDottedVersionAtLeastOne } = require('../test-validators')

const t = ServiceTester.forThisService()
module.exports = t

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
