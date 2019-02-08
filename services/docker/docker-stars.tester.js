'use strict'

const Joi = require('joi')
const { isMetric } = require('../test-validators')
const { dockerBlue } = require('./docker-helpers')

const t = (module.exports = require('../tester').createServiceTester())

t.create('docker stars (valid, library)')
  .get('/_/ubuntu.json?style=_shields_test')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'docker stars',
      value: isMetric,
      color: `#${dockerBlue}`,
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
