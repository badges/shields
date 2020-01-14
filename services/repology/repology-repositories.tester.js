'use strict'

const Joi = require('@hapi/joi')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Existing project')
  .get('/starship')
  .expectBadge({
    label: 'in repositories',
    message: Joi.number().greater(0),
  })

t.create('Non-existent project')
  .get('/invalidprojectthatshouldnotexist')
  .expectBadge({
    label: 'in repositories',
    message: 0,
  })
