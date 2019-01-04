'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')
const { isRelativeFormattedDate } = require('../test-validators')

const t = new ServiceTester({ id: 'date', title: 'Relative Date Tests' })
module.exports = t

t.create('Relative date')
  .get('/1540814400.json')
  .expectJSONTypes(
    Joi.object().keys({ name: 'date', value: isRelativeFormattedDate })
  )

t.create('Relative date - Invalid')
  .get('/9999999999999.json')
  .expectJSONTypes(Joi.object().keys({ name: 'date', value: 'invalid date' }))
