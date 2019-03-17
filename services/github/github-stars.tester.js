'use strict'

const Joi = require('joi')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Stars')
  .get('/badges/shields.json')
  .expectBadge({
    label: 'stars',
    message: Joi.string().regex(/^\w+$/),
  })

t.create('Stars (repo not found)')
  .get('/badges/helmets.json')
  .expectBadge({
    label: 'stars',
    message: 'repo not found',
  })
