'use strict'

const Joi = require('joi')
const { isBuildStatus } = require('../build-status')
const t = (module.exports = require('../tester').createServiceTester())

// Drone build (cloud)

t.create('cloud build status on default branch')
  .get('/cloud/build/drone/drone.json')
  .expectBadge({
    label: 'build',
    color: 'brightgreen',
    message: Joi.alternatives().try(isBuildStatus, Joi.equal('none')),
  })

t.create('cloud build status on named branch')
  .get('/cloud/build/drone/drone/master.json')
  .expectBadge({
    label: 'build',
    color: 'brightgreen',
    message: Joi.alternatives().try(isBuildStatus, Joi.equal('none')),
  })

t.create('cloud build status on unknown repo')
  .get('/cloud/build/this-repo/does-not-exist.json')
  .expectBadge({
    label: 'build',
    color: 'lightgrey',
    message: Joi.alternatives().try(isBuildStatus, Joi.equal('invalid')),
  })

// Drone build (self-hosted)

t.create('self-hosted build status on default branch')
  .get('/https/drone.shields.io/build/badges/shields.json')
  .intercept(nock =>
    nock('https://drone.shields.io/api/repos')
      .get('/badges/shields/builds/latest')
      .reply(200, { status: 'success' })
  )
  .expectBadge({
    label: 'build',
    color: 'brightgreen',
    message: 'passing',
  })

t.create('self-hosted build status on named branch')
  .get('/https/drone.shields.io/build/badges/shields/master.json')
  .intercept(nock =>
    nock('https://drone.shields.io/api/repos')
      .get('/badges/shields/builds/latest')
      .query({ ref: 'refs/heads/master' })
      .reply(200, { status: 'success' })
  )
  .expectBadge({
    label: 'build',
    color: 'brightgreen',
    message: 'passing',
  })
