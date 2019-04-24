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
  .expectStatus(301)
  .expectHeader('Location', '/travis/php-v/symfony/symfony.svg')

t.create('travis-ci branch')
  .get('/symfony/symfony/2.8.svg', {
    followRedirect: false,
  })
  .expectStatus(301)
  .expectHeader('Location', '/travis/php-v/symfony/symfony/2.8.svg')
