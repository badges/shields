'use strict'

const Joi = require('joi')
const t = (module.exports = require('../tester').createServiceTester())

t.create('hackage deps (valid)')
  .get('/lens.json')
  .expectBadge({
    label: 'dependencies',
    message: Joi.string().regex(/^(up to date|outdated)$/),
  })

t.create('hackage deps (not found)')
  .get('/not-a-package.json')
  .expectBadge({ label: 'dependencies', message: 'not found' })
