'use strict';

const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester({ id: 'travis', title: 'PHP tested from Travis CI' });
module.exports = t;

t.create('gets the package version of symfony')
    .get('/php-tested/symfony/symfony.json')
    .expectJSON({ name: 'PHP', value: '>= 7.1' });

t.create('gets the package version of symfony 2.8')
    .get('/php-tested/symfony/symfony/2.8.json')
    .expectJSON({ name: 'PHP', value: '>= 5.4, HHVM' });

t.create('invalid package name')
    .get('/php-tested/frodo-is-not-a-package.json')
    .expectJSON({ name: 'npm', value: 'invalid' });
