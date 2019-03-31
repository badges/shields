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

// Keep this "inaccessible" test, since this service does not use BaseService#_request.
t.create('Price (inaccessible)')
  .get('/alhjnofcnnpeaphgeakdhkebafjcpeae.json')
  .networkOff()
  .expectBadge({ label: 'price', message: 'inaccessible' })
