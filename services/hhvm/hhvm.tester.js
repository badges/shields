'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')
const { invalidJSON } = require('../response-fixtures')

const t = new ServiceTester({ id: 'hhvm', title: 'hhvm status' })

const isAllowedStatus = Joi.string().regex(
  /^(tested|partially tested|not tested|maybe untested)$/
)

module.exports = t

t.create('get default branch')
  .get('/symfony/symfony.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'hhvm',
      value: isAllowedStatus,
    })
  )

t.create('get specific branch')
  .get('/yiisoft/yii/1.1.19.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'hhvm',
      value: isAllowedStatus,
    })
  )

t.create('invalid repo')
  .get('/frodo/is-not-a-package.json')
  .expectJSON({ name: 'hhvm', value: 'repo not found' })

t.create('invalid branch')
  .get('/yiisoft/yii/1.1.666.json')
  .expectJSON({ name: 'hhvm', value: 'branch not found' })

t.create('connection error')
  .get('/symfony/symfony.json')
  .networkOff()
  .expectJSON({ name: 'hhvm', value: 'inaccessible' })

t.create('unexpected response')
  .get('/symfony/symfony.json')
  .intercept(nock =>
    nock('https://php-eye.com')
      .get('/api/v1/package/symfony/symfony.json')
      .reply(invalidJSON)
  )
  .expectJSON({ name: 'hhvm', value: 'invalid' })
