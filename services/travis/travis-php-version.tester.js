'use strict'

const { isPhpVersionReduction } = require('../test-validators')
const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'travis-php-version',
  title: 'PHP version from .travis.yml',
  pathPrefix: '/travis',
}))

t.create('gets the package version of symfony')
  .get('/php-v/symfony/symfony.json')
  .expectBadge({ label: 'php', message: isPhpVersionReduction })

t.create('gets the package version of symfony 2.8')
  .get('/php-v/symfony/symfony/2.8.json')
  .expectBadge({ label: 'php', message: isPhpVersionReduction })

t.create('gets the package version of yii')
  .get('/php-v/yiisoft/yii.json')
  .expectBadge({ label: 'php', message: isPhpVersionReduction })

t.create('invalid package name')
  .get('/php-v/frodo/is-not-a-package.json')
  .expectBadge({ label: 'php', message: 'invalid' })
