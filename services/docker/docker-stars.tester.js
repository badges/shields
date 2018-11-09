'use strict'

const Joi = require('joi')
const createServiceTester = require('../create-service-tester')
const { dockerBlue } = require('./docker-helpers')
const { isMetric } = require('../test-validators')

const t = createServiceTester()
module.exports = t

t.create('docker stars (valid, library)')
  .get('/_/ubuntu.json?style=_shields_test')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'docker stars',
      value: isMetric,
      colorB: `#${dockerBlue}`,
    })
  )

t.create('docker stars (override colorB)')
  .get('/_/ubuntu.json?colorB=fedcba&style=_shields_test')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'docker stars',
      value: isMetric,
      colorB: '#fedcba',
    })
  )

t.create('docker stars (valid, user)')
  .get('/jrottenberg/ffmpeg.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'docker stars',
      value: isMetric,
    })
  )

t.create('docker stars (not found)')
  .get('/_/not-a-real-repo.json')
  .expectJSON({ name: 'docker stars', value: 'repo not found' })
