'use strict'

const Joi = require('@hapi/joi')
const { isBuildStatus } = require('../build-status')
const t = (module.exports = require('../tester').createServiceTester())

t.create('build status on default branch')
  .get('/git-hub/doctrine/dbal.json')
  .expectBadge({
    label: 'build',
    message: Joi.alternatives().try(isBuildStatus, Joi.equal('unknown')),
  })

t.create('build status on named branch')
  .get('/git-hub/doctrine/dbal/develop.json')
  .expectBadge({
    label: 'build',
    message: Joi.alternatives().try(isBuildStatus, Joi.equal('unknown')),
  })

t.create('unknown repo')
  .get('/git-hub/this-repo/does-not-exist.json')
  .expectBadge({ label: 'continuousphp', message: 'project not found' })
