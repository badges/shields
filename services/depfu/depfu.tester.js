'use strict'

const Joi = require('joi')
const { ServiceTester } = require('../tester')

const isDependencyStatus = Joi.string().valid(
  'insecure',
  'latest',
  'recent',
  'stale'
)

const t = (module.exports = new ServiceTester({ id: 'depfu', title: 'Depfu' }))

t.create('depfu dependencies (valid)')
  .get('/depfu/example-ruby.json')
  .expectBadge({
    label: 'dependencies',
    message: isDependencyStatus,
  })

t.create('depfu dependencies (repo not found)')
  .get('/pyvesb/emptyrepo.json')
  .expectBadge({ label: 'dependencies', message: 'not found' })
