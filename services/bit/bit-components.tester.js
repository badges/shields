'use strict'

const Joi = require('joi')
const t = (module.exports = require('../tester').createServiceTester())

t.create('collection (valid)')
  .get('/ramda/ramda.json')
  .expectBadge({
    label: 'components',
    message: Joi.string().regex(/^[0-9]+$/),
  })

t.create('collection (valid)')
  .get('/bit/no-collection-test.json')
  .expectBadge({ label: 'components', message: 'not found' })
