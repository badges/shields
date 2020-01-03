'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'TravisPhpVersionRedirect',
  title: 'TravisPhpVersionRedirect',
  pathPrefix: '/travis-ci/php-v',
}))

t.create('travis-ci no branch')
  .get('/symfony/symfony.svg', {
    followRedirect: false,
  })
  .expectRedirect('/travis/php-v/symfony/symfony.svg')

t.create('travis-ci branch')
  .get('/symfony/symfony/2.8.svg', {
    followRedirect: false,
  })
  .expectRedirect('/travis/php-v/symfony/symfony/2.8.svg')
