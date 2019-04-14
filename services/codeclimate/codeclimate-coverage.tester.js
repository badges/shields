'use strict'

const Joi = require('joi')
const { ServiceTester } = require('../tester')
const { isIntegerPercentage } = require('../test-validators')

const t = (module.exports = new ServiceTester({
  id: 'CodeClimateCoverage',
  title: 'Code Climate',
  pathPrefix: '/codeclimate',
}))

t.create('test coverage percentage')
  .get('/c/jekyll/jekyll.json')
  .expectBadge({
    label: 'coverage',
    message: isIntegerPercentage,
  })

t.create('test coverage percentage alternative coverage URL')
  .get('/coverage/jekyll/jekyll.json')
  .expectBadge({
    label: 'coverage',
    message: isIntegerPercentage,
  })

t.create('test coverage percentage alternative top-level URL')
  .get('/jekyll/jekyll.json')
  .expectBadge({
    label: 'coverage',
    message: isIntegerPercentage,
  })

t.create('test coverage letter')
  .get('/c-letter/jekyll/jekyll.json')
  .expectBadge({
    label: 'coverage',
    message: Joi.equal('A', 'B', 'C', 'D', 'E', 'F'),
  })

t.create('test coverage percentage for non-existent repo')
  .get('/c/unknown/unknown.json')
  .expectBadge({
    label: 'coverage',
    message: 'not found',
  })

t.create('test coverage percentage for repo without test reports')
  .get('/c/angular/angular.js.json')
  .expectBadge({
    label: 'coverage',
    message: 'unknown',
  })
