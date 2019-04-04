'use strict'

const Joi = require('joi')
const t = (module.exports = require('../tester').createServiceTester())

t.create('code quality')
  .get('/g/filp/whoops.json')
  .expectBadge({
    label: 'code quality',
    message: Joi.number().positive(),
  })

t.create('code quality (branch)')
  .get('/g/phpmyadmin/phpmyadmin/master.json')
  .expectBadge({
    label: 'code quality',
    message: Joi.number().positive(),
  })
