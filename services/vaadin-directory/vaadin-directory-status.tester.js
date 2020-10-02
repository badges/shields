'use strict'

const Joi = require('joi')
const t = (module.exports = require('../tester').createServiceTester())

t.create('publish status of the component')
  .get('/vaadinvaadin-grid.json')
  .expectBadge({
    label: 'vaadin directory',
    message: Joi.equal('published', 'unpublished'),
  })

t.create('not found').get('/does-not-exist.json').expectBadge({
  label: 'vaadin directory',
  message: 'not found',
})
