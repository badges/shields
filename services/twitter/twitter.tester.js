'use strict'

const Joi = require('joi')
const { isMetric } = require('../test-validators')
const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'twitter',
  title: 'Twitter',
}))

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
