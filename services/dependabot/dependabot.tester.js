'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')
const { isIntegerPercentage } = require('../test-validators')
const { colorScheme: colorsB } = require('../test-helpers')

const t = (module.exports = new ServiceTester({
  id: 'dependabot',
  title: 'Dependabot',
}))

t.create('semver stability (valid)')
  .get('/semver/bundler/puma.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'semver stability',
      value: isIntegerPercentage,
      link:
        'https://dependabot.com/compatibility-score.html?dependency-name=puma&package-manager=bundler&version-scheme=semver',
    })
  )

t.create('semver stability (invalid error)')
  .get('/semver/invalid-manager/puma.json?style=_shields_test')
  .expectJSON({
    name: 'semver stability',
    value: 'invalid',
    colorB: colorsB.lightgrey,
  })

t.create('semver stability (missing dependency)')
  .get('/semver/bundler/some-random-missing-dependency.json')
  .expectJSON({
    name: 'semver stability',
    value: 'unknown',
  })
