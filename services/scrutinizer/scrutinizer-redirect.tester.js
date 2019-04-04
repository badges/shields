'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'ScrutinizerQualityRedirect',
  title: 'ScrutinizerQualityRedirect',
  pathPrefix: '/scrutinizer',
}))

t.create('scrutinizer quality')
  .get('/g/doctrine/orm.svg', {
    followRedirect: false,
  })
  .expectStatus(301)
  .expectHeader('Location', '/scrutinizer/quality/g/doctrine/orm.svg')

t.create('scrutinizer quality (branch)')
  .get('/g/doctrine/orm/develop.svg', {
    followRedirect: false,
  })
  .expectStatus(301)
  .expectHeader('Location', '/scrutinizer/quality/g/doctrine/orm/develop.svg')
