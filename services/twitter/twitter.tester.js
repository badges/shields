'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')

const { isMetric } = require('../test-validators')

const t = new ServiceTester({ id: 'twitter', title: 'Twitter' })
module.exports = t

t.create('Followers')
  .get('/follow/shields_io.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'follow @shields_io',
      value: isMetric,
    })
  )

t.create('Followers - Custom Label')
  .get('/follow/shields_io.json?label=Follow')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'Follow',
      value: isMetric,
    })
  )

t.create('Invalid Username Specified')
  .get('/follow/invalidusernamethatshouldnotexist.json?label=Follow')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'Follow',
      value: 'invalid user',
    })
  )

t.create('No connection')
  .get('/follow/shields_io.json?label=Follow')
  .networkOff()
  .expectJSON({ name: 'Follow', value: 'inaccessible' })

t.create('URL')
  .get('/url/https/shields.io.json')
  .expectJSON({ name: 'tweet', value: '' })
