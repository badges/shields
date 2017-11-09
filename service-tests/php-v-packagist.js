'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester({ id: 'packagist', title: 'PHP version from Packagist' });
module.exports = t;

t.create('gets the package version of symfony')
  .get('/php-v/symfony/symfony/dev-master.json')
  .expectJSONTypes(Joi.object().keys({ name: 'PHP', value: '^7.1.3' }));

t.create('gets the package version of symfony 2.8')
  .get('/php-v/symfony/symfony/v2.8.0.json')
  .expectJSONTypes(Joi.object().keys({ name: 'PHP', value: '>=5.3.9' }));

t.create('invalid package name')
  .get('/php-v/frodo-is-not-a-package.json')
  .expectJSON({ name: 'PHP', value: 'invalid' });
