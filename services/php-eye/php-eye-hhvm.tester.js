'use strict'

const Joi = require('joi')
const { ServiceTester } = require('../tester')
const { invalidJSON } = require('../response-fixtures')

const isAllowedStatus = Joi.string().regex(
  /^(tested|partially tested|not tested|maybe untested)$/
)

const t = (module.exports = new ServiceTester({
  id: 'hhvm',
  title: 'hhvm status',
}))

t.create('get default branch')
  .get('/symfony/symfony.json')
  .expectBadge({
    label: 'hhvm',
    message: isAllowedStatus,
  })

t.create('get specific branch')
  .get('/yiisoft/yii/1.1.19.json')
  .expectBadge({
    label: 'hhvm',
    message: isAllowedStatus,
  })

t.create('invalid repo')
  .get('/frodo/is-not-a-package.json')
  .expectBadge({ label: 'hhvm', message: 'repo not found' })

t.create('invalid branch')
  .get('/yiisoft/yii/1.1.666.json')
  .expectBadge({ label: 'hhvm', message: 'branch not found' })

t.create('connection error')
  .get('/symfony/symfony.json')
  .networkOff()
  .expectBadge({ label: 'hhvm', message: 'inaccessible' })

t.create('unexpected response')
  .get('/symfony/symfony.json')
  .intercept(nock =>
    nock('https://php-eye.com')
      .get('/api/v1/package/symfony/symfony.json')
      .reply(invalidJSON)
  )
  .expectBadge({ label: 'hhvm', message: 'invalid' })
