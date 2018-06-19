'use strict';

const Joi = require('joi');
const ServiceTester = require('../service-tester');
const { isIntegerPercentage } = require('../test-validators');
const { invalidJSON } = require('../response-fixtures');
const colorscheme = require('../../lib/colorscheme.json');
const mapValues = require('lodash.mapvalues');
const colorsB = mapValues(colorscheme, 'colorB');

const t = new ServiceTester({ id: 'dependabot', title: 'Dependabot' });
module.exports = t;

t.create('semver compatibility (valid)')
  .get('/semver/bundler/puma.json?style=_shields_test')
  .expectJSONTypes(Joi.object().keys({
    name: 'semver compatibility',
    value: isIntegerPercentage,
    link: 'https://dependabot.com/compatibility-score.html?dependency-name=puma&package-manager=bundler&version-scheme=semver',
    colorB: Joi.equal(colorsB.brightgreen, colorsB.orange).required()
  }));

t.create('semver compatibility (connection error)')
  .get('/semver/bundler/puma.json?style=_shields_test')
  .networkOff()
  .expectJSONTypes(Joi.object().keys({
    name: 'semver compatibility',
    value: 'inaccessible',
    colorB: colorsB.red
  }));

t.create('semver compatibility (invalid error)')
  .get('/semver/invalid-manager/puma.json?style=_shields_test')
  .expectJSONTypes(Joi.object().keys({
    name: 'semver compatibility',
    value: 'invalid',
    colorB: colorsB.lightgrey
  }));

t.create('semver compatibility (invalid JSON response)')
  .get('/semver/bundler/puma.json')
  .intercept(nock => nock('https://api.dependabot.com')
     .get('/badges/compatibility_score?package-manager=bundler&dependency-name=puma&version-scheme=semver')
     .reply(invalidJSON)
   )
  .expectJSONTypes(Joi.object().keys({
    name: 'semver compatibility',
    value: 'invalid'
  }));

t.create('semver compatibility (missing dependency)')
  .get('/semver/bundler/some-random-missing-dependency.json?style=_shields_test')
  .expectJSONTypes(Joi.object().keys({
    name: 'semver compatibility',
    value: 'unknown',
    colorB: colorsB.lightgrey
  }));
