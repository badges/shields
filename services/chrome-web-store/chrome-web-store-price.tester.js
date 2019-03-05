'use strict'

const Joi = require('joi')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Price')
  .get('/alhjnofcnnpeaphgeakdhkebafjcpeae.json')
  .expectBadge({
    label: 'price',
    message: Joi.string().regex(/^\$\d+(.\d{1,2})?$/),
  })

t.create('Price (not found)')
  .get('/invalid-name-of-addon.json')
  .expectBadge({ label: 'price', message: 'not found' })
