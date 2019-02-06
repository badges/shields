'use strict'

const Joi = require('joi')
const { ServiceTester } = require('../tester')
const { isRelativeFormattedDate } = require('../test-validators')

const t = (module.exports = new ServiceTester({
  id: 'date',
  title: 'Relative Date Tests',
}))

t.create('Relative date')
  .get('/1540814400.json')
  .expectJSONTypes(
    Joi.object().keys({ name: 'date', value: isRelativeFormattedDate })
  )

t.create('Relative date - Invalid')
  .get('/9999999999999.json')
  .expectJSONTypes(Joi.object().keys({ name: 'date', value: 'invalid date' }))
