'use strict'

const Joi = require('joi')
const { isSemver } = require('../test-validators')

const t = require('../create-service-tester')()
module.exports = t

t.create('gets the package version of elm/core')
  .get('/elm/core.json')
  .expectJSONTypes(Joi.object().keys({ name: 'elm package', value: isSemver }))

t.create('invalid package name')
  .get('/elm-community/frodo-is-not-a-package.json')
  .expectJSON({ name: 'elm package', value: 'package not found' })
