'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'php-eye',
  title: 'php-eye',
  pathPrefix: '/php-eye',
}))

t.create('no longer available (previously default branch)')
  .get('/symfony/symfony.json')
  .expectBadge({
    label: 'php tested',
    message: 'no longer available',
  })

t.create('no longer available (get specific branch)')
  .get('/yiisoft/yii/1.1.19.json')
  .expectBadge({
    label: 'php tested',
    message: 'no longer available',
  })
