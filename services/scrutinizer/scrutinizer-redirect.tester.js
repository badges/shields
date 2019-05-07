'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'ScrutinizerQualityRedirect',
  title: 'ScrutinizerQualityRedirect',
  pathPrefix: '/scrutinizer',
}))

t.create('scrutinizer quality GitHub')
  .get('/g/doctrine/orm.svg', {
    followRedirect: false,
  })
  .expectStatus(301)
  .expectHeader('Location', '/scrutinizer/quality/g/doctrine/orm.svg')

t.create('scrutinizer quality GitHub (branch)')
  .get('/g/doctrine/orm/develop.svg', {
    followRedirect: false,
  })
  .expectStatus(301)
  .expectHeader('Location', '/scrutinizer/quality/g/doctrine/orm/develop.svg')

t.create('scrutinizer quality Bitbucket')
  .get('/b/doctrine/orm.svg', {
    followRedirect: false,
  })
  .expectStatus(301)
  .expectHeader('Location', '/scrutinizer/quality/b/doctrine/orm.svg')

t.create('scrutinizer quality Bitbucket (branch)')
  .get('/b/atlassian/python-bitbucket/develop.svg', {
    followRedirect: false,
  })
  .expectStatus(301)
  .expectHeader(
    'Location',
    '/scrutinizer/quality/b/atlassian/python-bitbucket/develop.svg'
  )

t.create('scrutinizer quality GitLab')
  .get('/gl/gitlab-com/foo/bar.svg', {
    followRedirect: false,
  })
  .expectStatus(301)
  .expectHeader('Location', '/scrutinizer/quality/gl/gitlab-com/foo/bar.svg')

t.create('scrutinizer quality GitLab (branch)')
  .get('/gl/gitlab-com/foo/bar/develop.svg', {
    followRedirect: false,
  })
  .expectStatus(301)
  .expectHeader(
    'Location',
    '/scrutinizer/quality/gl/gitlab-com/foo/bar/develop.svg'
  )

t.create('scrutinizer quality Plain Git')
  .get('/gp/bar.svg', {
    followRedirect: false,
  })
  .expectStatus(301)
  .expectHeader('Location', '/scrutinizer/quality/gp/bar.svg')

t.create('scrutinizer quality Plain Git (branch)')
  .get('/gp/bar/develop.svg', {
    followRedirect: false,
  })
  .expectStatus(301)
  .expectHeader('Location', '/scrutinizer/quality/gp/bar/develop.svg')
