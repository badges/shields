'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester({ id: 'readthedocs', title: 'Read the Docs' })
module.exports = t;

t.create('build status')
  .get('/pip.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'docs',
    value: Joi.equal('failing', 'passing', 'unknown')
  }));

t.create('build status for named version')
  .get('/pip/stable.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'docs',
    value: Joi.equal('failing', 'passing', 'unknown')
  }));

t.create('build status for named semantic version')
  .get('/scrapy/1.0.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'docs',
    value: Joi.equal('failing', 'passing', 'unknown')
  }));

t.create('unknown project')
  .get('/this-repo/does-not-exist.json')
  .expectJSON({ name: 'docs', value: 'unknown' });

t.create('connection error')
  .get('/pip.json')
  .networkOff()
  .expectJSON({ name: 'docs', value: 'inaccessible' });
