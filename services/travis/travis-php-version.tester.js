'use strict'

const Joi = require('joi')
const { isPhpVersionReduction } = require('../test-validators')
const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'travis-php-version',
  title: 'PHP version from .travis.yml',
  pathPrefix: '/travis',
}))

t.create('gets the package version of symfony')
  .get('/php-v/symfony/symfony.json')
  .expectJSONTypes(
    Joi.object().keys({ name: 'php', value: isPhpVersionReduction })
  )

t.create('gets the package version of symfony 2.8')
  .get('/php-v/symfony/symfony/2.8.json')
  .expectJSONTypes(
    Joi.object().keys({ name: 'php', value: isPhpVersionReduction })
  )

t.create('gets the package version of yii')
  .get('/php-v/yiisoft/yii.json')
  .expectJSONTypes(
    Joi.object().keys({ name: 'php', value: isPhpVersionReduction })
  )

t.create('invalid package name')
  .get('/php-v/frodo/is-not-a-package.json')
  .expectJSON({ name: 'php', value: 'invalid' })
