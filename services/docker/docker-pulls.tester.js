'use strict'

const Joi = require('joi')
const { isMetric } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())
const { dockerBlue } = require('./docker-helpers')

t.create('docker pulls (valid, library)')
  .get('/_/ubuntu.json?style=_shields_test')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'docker pulls',
      value: isMetric,
      color: `#${dockerBlue}`,
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
