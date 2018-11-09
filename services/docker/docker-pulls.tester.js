'use strict'

const Joi = require('joi')
const createServiceTester = require('../create-service-tester')
const { dockerBlue } = require('./docker-helpers')
const { isMetric } = require('../test-validators')

const t = createServiceTester()
module.exports = t

t.create('docker pulls (valid, library)')
  .get('/_/ubuntu.json?style=_shields_test')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'docker pulls',
      value: isMetric,
      colorB: `#${dockerBlue}`,
    })
  )

t.create('docker pulls (override colorB)')
  .get('/_/ubuntu.json?colorB=fedcba&style=_shields_test')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'docker pulls',
      value: isMetric,
      colorB: '#fedcba',
    })
  )

t.create('docker pulls (valid, user)')
  .get('/jrottenberg/ffmpeg.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'docker pulls',
      value: isMetric,
    })
  )

t.create('docker pulls (not found)')
  .get('/_/not-a-real-repo.json')
  .expectJSON({ name: 'docker pulls', value: 'repo not found' })
