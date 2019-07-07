'use strict'

const Joi = require('@hapi/joi')
const { isBuildStatus } = require('../build-status')
const t = (module.exports = require('../tester').createServiceTester())
const { mockDroneCreds, token, restore } = require('./drone-test-helpers')

t.create('cloud-hosted build status on default branch')
  .get('/drone/drone.json')
  .expectBadge({
    label: 'build',
    message: Joi.alternatives().try(isBuildStatus, Joi.equal('none')),
  })

t.create('cloud-hosted build status on named branch')
  .get('/drone/drone/master.json')
  .expectBadge({
    label: 'build',
    message: Joi.alternatives().try(isBuildStatus, Joi.equal('none')),
  })

t.create('cloud-hosted build status on unknown repo')
  .get('/this-repo/does-not-exist.json')
  .expectBadge({
    label: 'build',
    message: 'repo not found or not authorized',
  })

t.create('self-hosted build status on default branch')
  .before(mockDroneCreds)
  .get('/badges/shields.json?server=https://drone.shields.io')
  .intercept(nock =>
    nock('https://drone.shields.io/api/repos', {
      reqheaders: { authorization: `Bearer ${token}` },
    })
      .get('/badges/shields/builds/latest')
      .reply(200, { status: 'success' })
  )
  .finally(restore)
  .expectBadge({
    label: 'build',
    message: 'passing',
  })

t.create('self-hosted build status on named branch')
  .before(mockDroneCreds)
  .get(
    '/badges/shields/feat/awesome-thing.json?server=https://drone.shields.io'
  )
  .intercept(nock =>
    nock('https://drone.shields.io/api/repos', {
      reqheaders: { authorization: `Bearer ${token}` },
    })
      .get('/badges/shields/builds/latest')
      .query({ ref: 'refs/heads/feat/awesome-thing' })
      .reply(200, { status: 'success' })
  )
  .finally(restore)
  .expectBadge({
    label: 'build',
    message: 'passing',
  })
