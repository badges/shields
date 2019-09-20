'use strict'

const Joi = require('@hapi/joi')
const t = (module.exports = require('../tester').createServiceTester())

t.create('clojars (valid)')
  .get('/prismic.json')
  .expectBadge({
    label: 'clojars',
    message: Joi.string()
      .regex(/^\[prismic "([0-9][.]?)+"\]$/)
      .required(), // note: https://github.com/badges/shields/pull/431
  })

t.create('clojars (not found)')
  .get('/not-a-package.json')
  .expectBadge({ label: 'clojars', message: 'not found' })
