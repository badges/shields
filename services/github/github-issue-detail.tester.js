'use strict'

const Joi = require('joi')
const { isFormattedDate } = require('../test-validators')

const t = (module.exports = require('../tester').createServiceTester())

t.create('github issue state')
  .get('/s/badges/shields/979.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'issue 979',
      value: Joi.equal('open', 'closed'),
    })
  )

t.create('github issue state (repo not found)')
  .get('/s/badges/helmets/979.json')
  .expectJSON({
    name: 'issue/pull request 979',
    value: 'issue, pull request or repo not found',
  })

t.create('github issue title')
  .get('/title/badges/shields/979.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'issue 979',
      value: 'Github rate limits cause transient service test failures in CI',
    })
  )

t.create('github issue author')
  .get('/u/badges/shields/979.json')
  .expectJSONTypes(Joi.object().keys({ name: 'author', value: 'paulmelnikow' }))

t.create('github issue label')
  .get('/label/badges/shields/979.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'label',
      value: Joi.equal(
        'bug | developer-experience',
        'developer-experience | bug'
      ),
    })
  )

t.create('github issue comments')
  .get('/comments/badges/shields/979.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'comments',
      value: Joi.number().greater(15),
    })
  )

t.create('github issue age')
  .get('/age/badges/shields/979.json')
  .expectJSONTypes(
    Joi.object().keys({ name: 'created', value: isFormattedDate })
  )

t.create('github issue update')
  .get('/last-update/badges/shields/979.json')
  .expectJSONTypes(
    Joi.object().keys({ name: 'updated', value: isFormattedDate })
  )
