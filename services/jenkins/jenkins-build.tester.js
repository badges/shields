'use strict'

const Joi = require('@hapi/joi')
const { isBuildStatus } = require('../build-status')
const t = (module.exports = require('../tester').createServiceTester())

const isJenkinsBuildStatus = Joi.alternatives(
  isBuildStatus,
  Joi.string().allow('unstable')
)

t.create('build job not found')
  .get('/https/ci.eclipse.org/jgit/job/does-not-exist.json')
  .expectBadge({ label: 'build', message: 'instance or job not found' })

t.create('build found (view)')
  .get('/https/wso2.org/jenkins/view/All%20Builds/job/archetypes.json')
  .expectBadge({ label: 'build', message: isJenkinsBuildStatus })

t.create('build found (job)')
  .get('/https/ci.eclipse.org/jgit/job/jgit.json')
  .expectBadge({ label: 'build', message: isJenkinsBuildStatus })
