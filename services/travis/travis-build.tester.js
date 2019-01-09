'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')
const { isBuildStatus } = require('../test-validators')

const t = (module.exports = new ServiceTester({
  id: 'travis-build',
  title: 'Travis CI',
  pathPrefix: '/travis',
}))

// Travis (.org) CI

t.create('build status on default branch')
  .get('/rust-lang/rust.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'build',
      value: Joi.alternatives().try(isBuildStatus, Joi.equal('unknown')),
    })
  )

t.create('build status on named branch')
  .get('/rust-lang/rust/stable.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'build',
      value: Joi.alternatives().try(isBuildStatus, Joi.equal('unknown')),
    })
  )

t.create('unknown repo')
  .get('/this-repo/does-not-exist.json')
  .expectJSON({ name: 'build', value: 'unknown' })

t.create('invalid svg response')
  .get('/foo/bar.json')
  .intercept(nock =>
    nock('https://api.travis-ci.org')
      .get('/foo/bar.svg')
      .reply(200)
  )
  .expectJSON({ name: 'build', value: 'unparseable svg response' })

// Travis (.com) CI

t.create('build status on default branch')
  .get('/com/ivandelabeldad/rackian-gateway.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'build',
      value: Joi.alternatives().try(isBuildStatus, Joi.equal('unknown')),
    })
  )

t.create('build status on named branch')
  .get('/com/ivandelabeldad/rackian-gateway.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'build',
      value: Joi.alternatives().try(isBuildStatus, Joi.equal('unknown')),
    })
  )

t.create('unknown repo')
  .get('/com/this-repo/does-not-exist.json')
  .expectJSON({ name: 'build', value: 'unknown' })

t.create('invalid svg response')
  .get('/com/foo/bar.json')
  .intercept(nock =>
    nock('https://api.travis-ci.com')
      .get('/foo/bar.svg')
      .reply(200)
  )
  .expectJSON({ name: 'build', value: 'unparseable svg response' })
