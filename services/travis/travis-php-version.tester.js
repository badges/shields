'use strict'

const { isPhpVersionReduction } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('gets the package version of symfony')
  .get('/symfony/symfony.json')
  .expectBadge({ label: 'php', message: isPhpVersionReduction })

t.create('gets the package version of symfony 2.8')
  .get('/symfony/symfony/2.8.json')
  .expectBadge({ label: 'php', message: isPhpVersionReduction })

t.create('gets the package version of yii')
  .get('/yiisoft/yii.json')
  .expectBadge({ label: 'php', message: isPhpVersionReduction })

t.create('invalid package name')
  .get('/frodo/is-not-a-package.json')
  .expectBadge({ label: 'php', message: 'repo not found' })
