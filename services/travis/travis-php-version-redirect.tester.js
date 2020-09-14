'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'TravisPhpVersionRedirect',
  title: 'TravisPhpVersionRedirect',
  pathPrefix: '/',
}))

t.create('travis-ci no branch')
  .get('travis-ci/php-v/symfony/symfony.svg')
  .expectRedirect('/travis/php-v/symfony/symfony/master.svg')

t.create('travis-ci branch')
  .get('travis-ci/php-v/symfony/symfony/2.8.svg')
  .expectRedirect('/travis/php-v/symfony/symfony/2.8.svg')

t.create('travis no branch')
  .get('travis/php-v/symfony/symfony.svg')
  .expectRedirect('/travis/php-v/symfony/symfony/master.svg')
