'use strict'

const Joi = require('joi')
const { colorScheme } = require('../test-helpers')
const t = (module.exports = require('../create-service-tester')())

t.create('renders correctly')
  .get('/shields/2988.json')
  .intercept(nock =>
    nock('https://opencollective.com/')
      .get('/shields/members/all.json?TierId=2988')
      .reply(200, [
        {
          MemberId: 10756,
          type: 'USER',
          role: 'BACKER',
          tier: 'monthly backer',
        },
        {
          MemberId: 13507,
          type: 'USER',
          role: 'BACKER',
          tier: 'monthly backer',
        },
        {
          MemberId: 16326,
          type: 'USER',
          role: 'BACKER',
          tier: 'monthly backer',
        },
        {
          MemberId: 16420,
          type: 'USER',
          role: 'BACKER',
          tier: 'monthly backer',
        },
        {
          MemberId: 19279,
          type: 'USER',
          role: 'BACKER',
          tier: 'monthly backer',
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
      name: 'monthly backers',
      value: '8',
      colorB: colorScheme.brightgreen,
    })
  )

// Not ideal, but open collective only returns an empty array
t.create('shows 0 when given a non existent tier')
  .get('/shields/1234567890.json')
  .intercept(nock =>
    nock('https://opencollective.com/')
      .get('/shields/members/all.json?TierId=1234567890')
      .reply(200, [])
  )
  .expectJSONTypes(
    Joi.object().keys({
      name: 'new tier',
      value: '0',
      colorB: colorScheme.lightgrey,
    })
  )
