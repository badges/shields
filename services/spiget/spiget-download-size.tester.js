'use strict'

const Joi = require('joi')
const { isFileSize } = require('../test-validators')

const t = (module.exports = require('../tester').createServiceTester())

t.create('EssentialsX (id 9089)')
  .get('/9089.json')
  .expectJSONTypes(Joi.object().keys({ name: 'size', value: isFileSize }))

t.create('Invalid Resource (id 1)')
  .get('/1.json')
  .expectJSON({
    name: 'size',
    value: 'not found',
  })
