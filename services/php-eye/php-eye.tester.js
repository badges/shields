'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')
const { isPhpVersionReduction } = require('../test-validators')

const t = new ServiceTester({
  id: 'php-eye',
  title: 'PHP version from PHP-Eye',
})
module.exports = t

t.create('gets the package version of symfony')
  .get('/symfony/symfony.json')
  .expectJSONTypes(
    Joi.object().keys({ name: 'PHP tested', value: isPhpVersionReduction })
  )

t.create('gets the package version of symfony 2.8')
  .get('/symfony/symfony/v2.8.0.json')
  .expectJSON({ name: 'PHP tested', value: '5.3 - 7.0, HHVM' })

t.create('gets the package version of yii')
  .get('/yiisoft/yii.json')
  .expectJSON({ name: 'PHP tested', value: '5.3 - 7.1' })

t.create('invalid package name')
  .get('/frodo/is-not-a-package.json')
  .expectJSON({ name: 'PHP tested', value: 'invalid' })
