'use strict'

const Joi = require('joi')
const { nonNegativeInteger } = require('../validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('renders correctly')
  .get('/shields.json?style=_shields_test')
  .intercept(nock =>
    nock('https://opencollective.com/')
      .get('/shields.json')
      .reply(200, {
        slug: 'shields',
        currency: 'USD',
        image:
          'https://opencollective-production.s3-us-west-1.amazonaws.com/44dcbb90-1ee9-11e8-a4c3-7bb1885c0b6e.png',
        balance: 105494,
        yearlyIncome: 157371,
        backersCount: 35,
        contributorsCount: 276,
      })
  )
  .expectJSONTypes(
    Joi.object().keys({
      name: 'backers and sponsors',
      value: '35',
      color: 'brightgreen',
    })
  )
t.create('gets amount of backers and sponsors')
  .get('/shields.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'backers and sponsors',
      value: nonNegativeInteger,
    })
  )

t.create('renders not found correctly')
  .get('/nonexistent-collective.json?style=_shield_test')
  .intercept(nock =>
    nock('https://opencollective.com/')
      .get('/nonexistent-collective.json')
      .reply(404, 'Not found')
  )
  .expectJSONTypes(
    Joi.object().keys({
      name: 'backers and sponsors',
      value: 'collective not found',
      color: 'red',
    })
  )

t.create('handles not found correctly')
  .get('/nonexistent-collective.json?style=_shield_test')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'backers and sponsors',
      value: 'collective not found',
      color: 'red',
    })
  )
