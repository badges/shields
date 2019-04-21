'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'hhvm',
  title: 'hhvm',
  pathPrefix: '/hhvm',
}))

t.create('no longer available (previously default branch)')
  .get('/symfony/symfony.json')
  .expectBadge({
    label: 'hhvm',
    message: 'no longer available',
  })

t.create('no longer available (get specific branch)')
  .get('/yiisoft/yii/1.1.19.json')
  .expectBadge({
    label: 'hhvm',
    message: 'no longer available',
  })
