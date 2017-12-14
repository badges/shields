'use strict';

const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester({ id: 'php-eye', title: 'PHP version from PHP-Eye' });
module.exports = t;

t.create('gets the package version of symfony')
    .get('/php-v/symfony/symfony.json')
    .expectJSON({ name: 'Tested', value: '5.2 - 7.0, HHVM' });

t.create('gets the package version of symfony 2.8')
    .get('/php-v/symfony/symfony/v2.8.0.json')
    .expectJSON({ name: 'Tested', value: '5.2, 7.1, HHVM' });

t.create('gets the package version of yii')
    .get('/php-v/yiisoft/yii.json')
    .expectJSON({ name: 'Tested', value: '5.2' });

t.create('invalid package name')
    .get('/php-v/frodo/is-not-a-package.json')
    .expectJSON({ name: 'Tested', value: 'invalid' });
