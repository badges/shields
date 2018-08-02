'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')
const { isMetric } = require('../test-validators')
const { invalidJSON } = require('../response-fixtures')

const t = new ServiceTester({ id: 'libscore', title: 'libscore' })
module.exports = t

t.create('libscore (valid)')
  .get('/s/jQuery.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'libscore',
      value: isMetric,
    })
  )

t.create('libscore (not found)')
  .get('/s/not-a-library.json')
  .expectJSON({ name: 'libscore', value: 'not found' })

t.create('libscore (connection error)')
  .get('/s/jQuery.json')
  .networkOff()
  .expectJSON({ name: 'libscore', value: 'inaccessible' })

t.create('libscore (unexpected response)')
  .get('/s/jQuery.json')
  .intercept(nock =>
    nock('http://api.libscore.com')
      .get('/v1/libraries/jQuery')
      .reply(invalidJSON)
  )
  .expectJSON({ name: 'libscore', value: 'invalid' })

t.create('libscore (error response)')
  .get('/s/jQuery.json')
  .intercept(nock =>
    nock('http://api.libscore.com')
      .get('/v1/libraries/jQuery')
      .reply(500, '{"error":"oh noes!!"}')
  )
  .expectJSON({ name: 'libscore', value: 'invalid' })
