'use strict';

const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester({ id: 'php-eye', title: 'PHP version from PHP-Eye' });
module.exports = t;

t.create('gets the package version of symfony')
    .get('/symfony/symfony.json')
    .expectJSON({ name: 'Tested', value: '7.1' });

t.create('gets the package version of symfony 2.8')
    .get('/symfony/symfony/v2.8.0.json')
    .expectJSON({ name: 'Tested', value: '5.3 - 7.0, HHVM' });

t.create('gets the package version of yii')
    .get('/yiisoft/yii.json')
    .expectJSON({ name: 'Tested', value: '5.3 - 7.1' });

t.create('invalid package name')
    .get('/frodo/is-not-a-package.json')
    .expectJSON({ name: 'Tested', value: 'invalid' });

t.create('invalid package name')
  .get('/angular/angular.js.json')
  .expectJSON({ name: 'Tested', value: 'not tested' });
