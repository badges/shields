'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')

const isDependencyStatus = Joi.string().valid(
  'insecure',
  'latest',
  'recent',
  'stale'
)

const t = (module.exports = new ServiceTester({ id: 'depfu', title: 'Depfu' }))

t.create('depfu dependencies (valid)')
  .get('/depfu/example-ruby.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'dependencies',
      value: isDependencyStatus,
    })
  )

t.create('depfu dependencies (repo not found)')
  .get('/pyvesb/emptyrepo.json')
  .expectJSON({ name: 'dependencies', value: 'not found' })
