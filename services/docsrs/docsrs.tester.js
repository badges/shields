'use strict'

const Joi = require('joi')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Passing docs')
  .get('/tokio/0.3.0.json')
  .expectBadge({ label: 'docs@0.3.0', message: 'passing' })

t.create('Failing docs')
  .get('/tensorflow/0.16.1.json')
  .expectBadge({ label: 'docs@0.16.1', message: 'failing' })

t.create('Getting latest version works')
  .get('/rand/latest.json')
  .expectBadge({
    label: 'docs',
    messsage: Joi.allow('passing', 'failing'),
  })
