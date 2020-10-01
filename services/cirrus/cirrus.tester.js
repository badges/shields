'use strict'

const Joi = require('joi')
const { isBuildStatus } = require('../build-status')
const t = (module.exports = require('../tester').createServiceTester())

t.create('cirrus bad repo')
  .get('/github/unknown-identifier/unknown-repo.json')
  .expectBadge({ label: 'build', message: 'unknown' })

t.create('cirrus fully.valid')
  .get('/github/flutter/flutter.json')
  .expectBadge({
    label: 'build',
    message: Joi.alternatives().try(isBuildStatus, Joi.equal('unknown')),
  })
