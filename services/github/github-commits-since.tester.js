'use strict'

const Joi = require('joi')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Commits since')
  .get(
    '/badges/shields/a0663d8da53fb712472c02665e6ff7547ba945b7.json?style=_shields_test'
  )
  .expectBadge({
    label: Joi.string().regex(/^(commits since){1}[\s\S]+$/),
    message: Joi.string().regex(/^\w+$/),
    color: 'blue',
  })

t.create('Commits since by latest release')
  .get('/microsoft/typescript/latest.json')
  .expectBadge({
    label: Joi.string().regex(/^(commits since){1}[\s\S]+$/),
    message: Joi.string().regex(/^\d+\w?$/),
  })
