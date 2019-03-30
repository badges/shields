'use strict'

const Joi = require('joi')
const { isBuildStatus } = require('../build-status')
const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'drone-build',
  title: 'Drone io',
  pathPrefix: '/drone',
}))

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

t.create('invalid svg response')
  .get('/build/foo/bar.json')
  .intercept(nock =>
    nock('https://cloud.drone.io/api')
      .get('/foo/bar.svg')
      .reply(200)
  )
  .expectBadge({ label: 'build', message: 'unparseable svg response' })
