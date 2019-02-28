'use strict'

const Joi = require('joi')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Watchers')
  .get('/badges/shields.json')
  .expectBadge({
    label: 'watchers',
    message: Joi.number()
      .integer()
      .positive(),
  })

t.create('Watchers (repo not found)')
  .get('/badges/helmets.json')
  .expectBadge({
    label: 'watchers',
    message: 'repo not found',
  })
