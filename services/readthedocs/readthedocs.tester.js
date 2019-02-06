'use strict'

const Joi = require('joi')
const { isBuildStatus } = require('../../lib/build-status')

const t = (module.exports = require('../tester').createServiceTester())

t.create('build status')
  .get('/pip.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'docs',
      value: Joi.alternatives().try(isBuildStatus, Joi.equal('unknown')),
    })
  )

t.create('build status for named version')
  .get('/pip/stable.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'docs',
      value: Joi.alternatives().try(isBuildStatus, Joi.equal('unknown')),
    })
  )

t.create('build status for named semantic version')
  .get('/scrapy/1.0.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'docs',
      value: Joi.alternatives().try(isBuildStatus, Joi.equal('unknown')),
    })
  )

t.create('build status for nonexistent version')
  // This establishes that the version is being sent.
  .get('/pip/foobar-is-not-a-version.json')
  .expectJSON({
    name: 'docs',
    value: 'project or version not found',
  })

t.create('unknown project')
  .get('/this-repo/does-not-exist.json')
  .expectJSON({ name: 'docs', value: 'project or version not found' })
