'use strict'

const Joi = require('@hapi/joi')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Stars')
  .get('/badges/shields.json')
  .expectBadge({
    label: 'stars',
    message: Joi.string().regex(/^\w+$/),
    link: [
      'https://github.com/badges/shields',
      'https://github.com/badges/shields/stargazers',
    ],
  })

t.create('Stars (repo not found)')
  .get('/badges/helmets.json')
  .expectBadge({
    label: 'stars',
    message: 'repo not found',
  })
