'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')
const { isIntegerPercentage } = require('../test-validators')
const { invalidJSON } = require('../response-fixtures')
const colorscheme = require('../../lib/colorscheme.json')
const mapValues = require('lodash.mapvalues')
const colorsB = mapValues(colorscheme, 'colorB')

const t = new ServiceTester({ id: 'dependabot', title: 'Dependabot' })
module.exports = t

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

t.create('semver stability (connection error)')
  .get('/semver/bundler/puma.json?style=_shields_test')
  .networkOff()
  .expectJSON({
    name: 'semver stability',
    value: 'inaccessible',
    colorB: colorsB.red,
  })

t.create('semver stability (invalid error)')
  .get('/semver/invalid-manager/puma.json?style=_shields_test')
  .expectJSON({
    name: 'semver stability',
    value: 'invalid',
    colorB: colorsB.lightgrey,
  })

t.create('semver stability (invalid JSON response)')
  .get('/semver/bundler/puma.json')
  .intercept(nock =>
    nock('https://api.dependabot.com')
      .get(
        '/badges/compatibility_score?package-manager=bundler&dependency-name=puma&version-scheme=semver'
      )
      .reply(invalidJSON)
  )
  .expectJSON({
    name: 'semver stability',
    value: 'invalid',
  })

t.create('semver stability (missing dependency)')
  .get('/semver/bundler/some-random-missing-dependency.json')
  .expectJSON({
    name: 'semver stability',
    value: 'unknown',
  })
