'use strict'

const Joi = require('joi')
const t = (module.exports = require('../tester').createServiceTester())

t.create('users (valid)')
  .get('/raphink.json')
  .expectBadge({
    label: 'gems',
    message: Joi.string().regex(/^[0-9]+$/),
  })

t.create('users (not found)')
  .get('/not-a-package.json')
  .expectBadge({ label: 'gems', message: 'not found' })
