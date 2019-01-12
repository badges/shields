'use strict'

const Joi = require('joi')

const t = (module.exports = require('../create-service-tester')())

const { withRegex } = require('../test-validators')

const multipleVersions = withRegex(/^([+]?\d*\.\d+)(\-)([+]?\d*\.\d+)$/)

t.create('EssentialsX - multiple versions supported - (id 9089)')
  .get('/9089.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'tested versions',
      value: multipleVersions,
    })
  )

t.create('Invalid Resource (id 1)')
  .get('/1.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'tested versions',
      value: 'not found',
    })
  )
