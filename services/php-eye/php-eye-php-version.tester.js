'use strict'

const { ServiceTester } = require('../tester')
const { isPhpVersionReduction } = require('../test-validators')

const t = (module.exports = new ServiceTester({
  id: 'php-eye',
  title: 'PHP version from PHP-Eye',
}))

t.create('gets the package version of symfony')
  .get('/symfony/symfony.json')
  .expectBadge({ label: 'php tested', message: isPhpVersionReduction })

t.create('gets the package version of symfony 2.8')
  .get('/symfony/symfony/v2.8.0.json')
  .expectBadge({ label: 'php tested', message: '5.3 - 7.0, HHVM' })

t.create('gets the package version of yii')
  .get('/yiisoft/yii.json')
  .expectBadge({ label: 'php tested', message: '5.3 - 7.1' })

t.create('invalid package name')
  .get('/frodo/is-not-a-package.json')
  .expectBadge({ label: 'php tested', message: 'invalid' })
