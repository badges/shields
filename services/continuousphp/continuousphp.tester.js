'use strict'

const Joi = require('joi')
const { isBuildStatus } = require('../test-validators')

const t = (module.exports = require('../create-service-tester')())

t.create('build status on default branch')
  .get('/git-hub/doctrine/dbal.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'build',
      value: Joi.alternatives().try(isBuildStatus, Joi.equal('unknown')),
    })
  )

t.create('build status on named branch')
  .get('/git-hub/doctrine/dbal/develop.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'build',
      value: Joi.alternatives().try(isBuildStatus, Joi.equal('unknown')),
    })
  )

t.create('unknown repo')
  .get('/git-hub/this-repo/does-not-exist.json')
  .expectJSON({ name: 'build', value: 'invalid' })

t.create('connection error')
  .get('/git-hub/doctrine/dbal.json')
  .networkOff()
  .expectJSON({ name: 'build', value: 'invalid' })
