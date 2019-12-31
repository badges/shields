'use strict'

const Joi = require('@hapi/joi')
const t = (module.exports = require('../tester').createServiceTester())

const validMessages = [
  'success',
  'error',
  'failure',
  'inactive',
  'in progress',
  'queued',
  'pending',
]
const isValidMessages = Joi.equal(...validMessages).required()

t.create('Deployments')
  .get('/badges/shields/shields-staging.json')
  .expectBadge({
    label: 'state',
    message: isValidMessages,
  })

t.create('Deployments (environment not found)')
  .get('/badges/shields/does-not-exist.json')
  .expectBadge({
    label: 'state',
    message: 'environment not found',
  })
