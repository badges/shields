'use strict'

const Joi = require('joi')
const { isMetric } = require('../test-validators')

const t = (module.exports = require('../create-service-tester')())

t.create('hit counter')
  .get('/torvalds/linux/goto.json')
  .timeout(10000)
  .expectJSONTypes(Joi.object().keys({ name: 'goto counter', value: isMetric }))

t.create('hit counter for nonexistent repo')
  .get('/torvalds/not-linux/goto.json')
  .timeout(10000)
  .expectJSON({ name: 'goto counter', value: 'repo not found' })
