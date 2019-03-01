'use strict'

const Joi = require('joi')
const { isMetric } = require('../test-validators')
const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'chrome-web-store',
  title: 'Chrome Web Store Users',
}))

t.create('Downloads (redirect)')
  .get('/d/alhjnofcnnpeaphgeakdhkebafjcpeae.json')
  .expectJSONTypes(Joi.object().keys({ name: 'users', value: isMetric }))

t.create('Users')
  .get('/users/alhjnofcnnpeaphgeakdhkebafjcpeae.json')
  .expectJSONTypes(Joi.object().keys({ name: 'users', value: isMetric }))

t.create('Users (not found)')
  .get('/users/invalid-name-of-addon.json')
  .expectJSON({ name: 'users', value: 'not found' })
