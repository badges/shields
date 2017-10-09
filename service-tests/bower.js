'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');
const { isVPlusDottedVersionAtLeastOne } = require('./helpers/validators');

const isBowerPrereleaseVersion = Joi.string().regex(/^v\d+(\.\d+)?(\.\d+)?(\-?\w)+?$/);

const t = new ServiceTester({ id: 'bower', title: 'Bower' });
module.exports = t;

t.create('licence. eg. bower|MIT')
  .get('/l/bootstrap.json')
  .expectJSON({ name: 'bower', value: 'MIT' });

t.create('custom label for licence. eg. my licence|MIT')
  .get('/l/bootstrap.json?label="my licence"')
  .expectJSON({ name: 'my licence', value: 'MIT' });

t.create('version. eg. bower|v0.2.5')
  .get('/v/bootstrap.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'bower',
    value: isVPlusDottedVersionAtLeastOne
  }));

t.create('custom label for version. eg. my verison|v0.2.5')
  .get('/v/bootstrap.json?label="my version"')
  .expectJSONTypes(Joi.object().keys({
    name: 'my version',
    value: isVPlusDottedVersionAtLeastOne
  }));

t.create('pre version. eg. bower|v0.2.5-alpha-rc-pre')
  .get('/vpre/bootstrap.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'bower',
    value: isBowerPrereleaseVersion
  }));

t.create('custom label for pre version. eg. pre verison|v0.2.5-alpha-rc-pre')
  .get('/vpre/bootstrap.json?label="pre verison"')
  .expectJSONTypes(Joi.object().keys({
    name: 'pre verison',
    value: isBowerPrereleaseVersion
  }));


t.create('Version for Invaild Package. eg. bower|invalid')
  .get('/v/it-is-a-invalid-package-should-error.json')
  .expectJSON({ name: 'bower', value: 'invalid' });

t.create('Pre Version for Invaild Package. eg. bower|invalid')
  .get('/vpre/it-is-a-invalid-package-should-error.json')
  .expectJSON({ name: 'bower', value: 'invalid' });

t.create('licence for Invaild Package. eg. bower|invalid')
  .get('/l/it-is-a-invalid-package-should-error.json')
  .expectJSON({ name: 'bower', value: 'invalid' });


t.create('Version label should be `no releases` if no offical version. eg. bower|no releases')
  .get('/v/bootstrap.json')
  .intercept(nock => nock('https://libraries.io')
    .get('/api/bower/bootstrap')
    .reply(200, { latest_stable_release: { name: null } })) //or just `{}`
  .expectJSON({ name: 'bower', value: 'no releases' });
