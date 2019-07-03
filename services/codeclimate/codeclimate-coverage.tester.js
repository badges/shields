'use strict'

const Joi = require('@hapi/joi')
const { isIntegerPercentage } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('test coverage percentage')
  .get('/coverage/jekyll/jekyll.json')
  .expectBadge({
    label: 'coverage',
    message: isIntegerPercentage,
  })

t.create('test coverage letter')
  .get('/coverage-letter/jekyll/jekyll.json')
  .expectBadge({
    label: 'coverage',
    message: Joi.equal('A', 'B', 'C', 'D', 'E', 'F'),
  })

t.create('test coverage percentage for non-existent repo')
  .get('/coverage/unknown/unknown.json')
  .expectBadge({
    label: 'coverage',
    message: 'repo not found',
  })

t.create('test coverage percentage for repo without test reports')
  .get('/coverage/angular/angular.js.json')
  .expectBadge({
    label: 'coverage',
    message: 'test report not found',
  })
