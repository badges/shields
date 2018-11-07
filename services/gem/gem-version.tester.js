'use strict'

const Joi = require('joi')
const createServiceTester = require('../create-service-tester')

const { isVPlusDottedVersionAtLeastOne } = require('../test-validators')

const t = createServiceTester()
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
