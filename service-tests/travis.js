'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester({ id: 'travis', title: 'PHP version from .travis.yml' });
module.exports = t;

t.create('gets the package version of symfony')
    .get('/php-v/symfony/symfony.json')
    .expectJSONTypes(Joi.object().keys({ name: 'PHP', value: '>= 7.1' }));

t.create('gets the package version of symfony 2.8')
    .get('/php-v/symfony/symfony/2.8.json')
    .expectJSONTypes(Joi.object().keys({ name: 'PHP', value: '>= 5.4, HHVM' }));

t.create('gets the package version of yii')
    .get('/php-v/yiisoft/yii.json')
    .expectJSONTypes(Joi.object().keys({ name: 'PHP', value: '5.3 - 7.1, HHVM' }));

t.create('invalid package name')
    .get('/php-v/frodo/is-not-a-package.json')
    .expectJSON({ name: 'PHP', value: 'invalid' });
