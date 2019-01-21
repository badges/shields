'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')
const { isSemver } = require('../test-validators')
const { semverRange } = require('../validators')

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
    value: 'repo not found, branch not found, or package.json missing',
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

t.create('Peer dependency version')
  .get('/dependency-version/paulmelnikow/react-boxplot/peer/react.json')
  .expectJSONTypes(
    Joi.object({
      name: 'react',
      value: semverRange,
    })
  )

t.create('Dev dependency version')
  .get(
    '/dependency-version/paulmelnikow/react-boxplot/dev/react.json?label=react%20tested'
  )
  .expectJSONTypes(
    Joi.object({
      name: 'react tested',
      value: semverRange,
    })
  )

t.create('Prod prod dependency version')
  .get('/dependency-version/paulmelnikow/react-boxplot/simple-statistics.json')
  .expectJSONTypes(
    Joi.object({
      name: 'simple-statistics',
      value: semverRange,
    })
  )

t.create('Scoped dependency')
  .get('/dependency-version/badges/shields/dev/@babel/core.json')
  .expectJSONTypes(
    Joi.object({
      name: '@babel/core',
      value: semverRange,
    })
  )

t.create('Scoped dependency on branch')
  .get('/dependency-version/zeit/next.js/dev/babel-eslint/alpha.json')
  .expectJSONTypes(
    Joi.object({
      name: 'babel-eslint',
      value: semverRange,
    })
  )

t.create('Unknown dependency')
  .get('/dependency-version/paulmelnikow/react-boxplot/dev/i-made-this-up.json')
  .expectJSON({
    name: 'dependency',
    value: 'dev dependency not found',
  })
