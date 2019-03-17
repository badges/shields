'use strict'

const Joi = require('joi')
const { isFormattedDate } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('github issue state')
  .get('/s/badges/shields/979.json')
  .expectBadge({
    label: 'issue 979',
    message: Joi.equal('open', 'closed'),
  })

t.create('github issue state (repo not found)')
  .get('/s/badges/helmets/979.json')
  .expectBadge({
    label: 'issue/pull request 979',
    message: 'issue, pull request or repo not found',
  })

t.create('github issue title')
  .get('/title/badges/shields/979.json')
  .expectBadge({
    label: 'issue 979',
    message: 'Github rate limits cause transient service test failures in CI',
  })

t.create('github issue author')
  .get('/u/badges/shields/979.json')
  .expectBadge({ label: 'author', message: 'paulmelnikow' })

t.create('github issue label')
  .get('/label/badges/shields/979.json')
  .expectBadge({
    label: 'label',
    message: Joi.equal(
      'bug | developer-experience',
      'developer-experience | bug'
    ),
  })

t.create('github issue comments')
  .get('/comments/badges/shields/979.json')
  .expectBadge({
    label: 'comments',
    message: Joi.number().greater(15),
  })

t.create('github issue age')
  .get('/age/badges/shields/979.json')
  .expectBadge({ label: 'created', message: isFormattedDate })

t.create('github issue update')
  .get('/last-update/badges/shields/979.json')
  .expectBadge({ label: 'updated', message: isFormattedDate })
