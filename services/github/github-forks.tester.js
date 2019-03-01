'use strict'

const Joi = require('joi')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Forks')
  .get('/badges/shields.json')
  .expectBadge({
    label: 'forks',
    message: Joi.number()
      .integer()
      .positive(),
  })

t.create('Forks (repo not found)')
  .get('/badges/helmets.json')
  .expectBadge({
    label: 'forks',
    message: 'repo not found',
  })
