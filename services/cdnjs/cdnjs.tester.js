'use strict'

const Joi = require('joi')
const createServiceTester = require('../create-service-tester')
const { isVPlusTripleDottedVersion } = require('../test-validators')

const t = createServiceTester()
module.exports = t

t.create('cdnjs (valid)')
  .get('/jquery.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'cdnjs',
      value: isVPlusTripleDottedVersion,
    })
  )

t.create('cdnjs (not found)')
  .get('/not-a-library.json')
  .expectJSON({ name: 'cdnjs', value: 'not found' })
