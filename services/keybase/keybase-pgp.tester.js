'use strict'

const Joi = require('joi')
const t = (module.exports = require('../tester').createServiceTester())

t.create('existing key fingerprint')
  .get('/skyplabs.json')
  .expectBadge({
    label: 'pgp',
    message: Joi.string().hex().length(16),
  })

t.create('unknown username').get('/skyplabsssssss.json').expectBadge({
  label: 'pgp',
  message: 'profile not found',
})

t.create('invalid username').get('/s.json').expectBadge({
  label: 'pgp',
  message: 'invalid username',
})

t.create('missing key fingerprint').get('/skyp.json').expectBadge({
  label: 'pgp',
  message: 'no key fingerprint found',
})
