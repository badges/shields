'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester({ id: 'php', title: 'PHP version from Travis CI' });
module.exports = t;

t.create('gets the package version of symfony')
    .get('/v/travis/symfony/symfony.json')
    .expectJSONTypes(Joi.object().keys({ name: 'PHP', value: '7.1, 7.2' }));

t.create('gets the package version of symfony 2.8')
    .get('/v/travis/symfony/symfony/2.8.json')
    .expectJSONTypes(Joi.object().keys({ name: 'PHP', value: '>= 5.4, HHVM' }));

t.create('invalid package name')
    .get('/v/travis/frodo-is-not-a-package.json')
    .expectJSON({ name: 'npm', value: 'invalid' });
