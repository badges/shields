'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')
const { isSemver } = require('../test-validators')

const t = (module.exports = new ServiceTester({
  id: 'GithubPackageJson',
  title: 'GithubPackageJson',
  pathPrefix: '/github/package-json',
}))

t.create('Package version')
  .get('/v/badges/shields.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'version',
      value: isSemver,
    })
  )

t.create('Package version (repo not found)')
  .get('/v/badges/helmets.json')
  .expectJSON({
    name: 'version',
    value: 'package.json missing or repo not found',
  })

t.create('Package name')
  .get('/n/badges/shields.json')
  .expectJSON({ name: 'name', value: 'shields.io' })

t.create('Package name - Custom label')
  .get('/name/badges/shields.json?label=Dev Name')
  .expectJSON({ name: 'Dev Name', value: 'shields.io' })

t.create('Package array')
  .get('/keywords/badges/shields.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'keywords',
      value: Joi.string().regex(/.*?,/),
    })
  )

t.create('Package object')
  .get('/dependencies/badges/shields.json')
  .expectJSON({ name: 'package.json', value: 'invalid key value' })
