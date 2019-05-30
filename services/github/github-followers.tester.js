'use strict'

const Joi = require('@hapi/joi')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Followers')
  .get('/webcaetano.json')
  .expectBadge({
    label: 'followers',
    message: Joi.string().regex(/^\w+$/),
  })

t.create('Followers (user not found)')
  .get('/PyvesB2.json')
  .expectBadge({
    label: 'followers',
    message: 'user not found',
  })
