'use strict';

const Joi = require('joi');
const ServiceTester = require('../service-tester');
const { isIntegerPercentage } = require('../test-validators');
const colorscheme = require('../../lib/colorscheme.json');
const mapValues = require('lodash.mapvalues');
const colorsB = mapValues(colorscheme, 'colorB');

const t = new ServiceTester({ id: 'dependabot', title: 'Dependabot' });
module.exports = t;

t.create('semver compatibility (valid)')
  .get('/semver/bundler/puma.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'semver',
    value: isIntegerPercentage,
    link: 'https://dependabot.com/compatibility-score.html?dependency-name=puma&package-manager=bundler&version-scheme=semver',
    colorB: Joi.equal(colorsB.brightgreen, colorsB.orange)
  }));

t.create('semver compatibility (connection error)')
  .get('/semver/bundler/puma.json')
  .networkOff()
  .expectJSONTypes(Joi.object().keys({
    name: 'semver',
    value: 'error',
    colorB: colorsB.lightgrey
  }));
