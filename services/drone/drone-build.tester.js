'use strict'

const Joi = require('joi')
const { isBuildStatus } = require('../build-status')
const t = (module.exports = require('../tester').createServiceTester())

// Drone Build

t.create('build status on default branch')
  .get('/build/drone/drone.json')
  .expectBadge({
    label: 'build',
    message: Joi.alternatives().try(isBuildStatus, Joi.equal('none')),
  })

t.create('build status on named branch')
  .get('/build/drone/drone/master.json')
  .expectBadge({
    label: 'build',
    message: Joi.alternatives().try(isBuildStatus, Joi.equal('none')),
  })

t.create('unknown repo')
  .get('/build/this-repo/does-not-exist.json')
  .expectBadge({ label: 'build', message: 'none' })
