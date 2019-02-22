'use strict'

const Joi = require('joi')
const { isIntegerPercentage } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('semver stability (valid)')
  .get('/bundler/puma.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'semver stability',
      value: isIntegerPercentage,
      link:
        'https://dependabot.com/compatibility-score.html?dependency-name=puma&package-manager=bundler&version-scheme=semver',
    })
  )

t.create('semver stability (invalid error)')
  .get('/invalid-manager/puma.json?style=_shields_test')
  .expectJSON({
    name: 'semver stability',
    value: 'invalid',
    color: 'lightgrey',
  })

t.create('semver stability (missing dependency)')
  .get('/bundler/some-random-missing-dependency.json')
  .expectJSON({
    name: 'semver stability',
    value: 'unknown',
  })
