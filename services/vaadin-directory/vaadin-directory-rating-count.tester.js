'use strict'

const Joi = require('joi')
const t = (module.exports = require('../tester').createServiceTester())

t.create('rating count of component')
  .get('/rating-count/vaadinvaadin-grid.json')
  .expectBadge({
    label: 'rating count',
    message: Joi.string().regex(/^\d+?\stotal$/),
  })

t.create('rating count of component')
  .get('/rc/vaadinvaadin-grid.json')
  .expectBadge({
    label: 'rating count',
    message: Joi.string().regex(/^\d+?\stotal$/),
  })

t.create('not found').get('/rating-count/does-not-exist.json').expectBadge({
  label: 'rating count',
  message: 'not found',
})
