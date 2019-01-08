'use strict'

const Joi = require('joi')
const { colorScheme } = require('../test-helpers')
const { nonNegativeInteger } = require('../validators')
const t = (module.exports = require('../create-service-tester')())

t.create('renders correctly')
  .get('/shields.json')
  .intercept(nock =>
    nock('https://opencollective.com/')
      .get('/shields/members/organizations.json')
      .reply(200, [
        { MemberId: 8683, type: 'ORGANIZATION', role: 'HOST' },
        {
          MemberId: 13484,
          type: 'ORGANIZATION',
          role: 'BACKER',
          tier: 'backer',
        },
        { MemberId: 13508, type: 'ORGANIZATION', role: 'FUNDRAISER' },
        { MemberId: 15987, type: 'ORGANIZATION', role: 'BACKER' },
        {
          MemberId: 16561,
          type: 'ORGANIZATION',
          role: 'BACKER',
          tier: 'sponsor',
        },
        {
          MemberId: 16469,
          type: 'ORGANIZATION',
          role: 'BACKER',
          tier: 'sponsor',
        },
        {
          MemberId: 18162,
          type: 'ORGANIZATION',
          role: 'BACKER',
          tier: 'sponsor',
        },
        {
          MemberId: 21023,
          type: 'ORGANIZATION',
          role: 'BACKER',
          tier: 'sponsor',
        },
        {
          MemberId: 21482,
          type: 'ORGANIZATION',
          role: 'BACKER',
          tier: 'monthly backer',
        },
        {
          MemberId: 26367,
          type: 'ORGANIZATION',
          role: 'BACKER',
          tier: 'monthly backer',
        },
        { MemberId: 27531, type: 'ORGANIZATION', role: 'BACKER' },
        {
          MemberId: 29443,
          type: 'ORGANIZATION',
          role: 'BACKER',
          tier: 'monthly backer',
        },
      ])
  )
  .expectJSONTypes(
    Joi.object().keys({
      name: 'sponsors',
      value: '10',
      colorB: colorScheme.brightgreen,
    })
  )
t.create('gets amount of sponsors')
  .get('/shields.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'sponsors',
      value: nonNegativeInteger,
    })
  )

t.create('handles not found correctly')
  .get('/nonexistent-collective.json?style=_shield_test')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'sponsors',
      value: 'collective not found',
      colorB: colorScheme.red,
    })
  )
