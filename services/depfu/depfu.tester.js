'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')

const isDependencyStatus = Joi.string().valid(
  'insecure',
  'latest',
  'recent',
  'stale'
)

const t = new ServiceTester({ id: 'depfu', title: 'Depfu' })
module.exports = t

t.create('depfu dependencies (valid)')
  .get('/depfu/example-ruby.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'dependencies',
      value: isDependencyStatus,
    })
  )
