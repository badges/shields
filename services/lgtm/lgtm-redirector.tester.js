'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'LgtmRedirect',
  title: 'LgtmRedirect',
  pathPrefix: '/lgtm',
}))

t.create('alerts')
  .get('/alerts/g/badges/shields.svg', {
    followRedirect: false,
  })
  .expectStatus(301)
  .expectHeader('Location', '/lgtm/alerts/github/badges/shields.svg')

t.create('grade')
  .get('/grade/java/g/apache/cloudstack.svg', {
    followRedirect: false,
  })
  .expectStatus(301)
  .expectHeader('Location', '/lgtm/grade/java/github/apache/cloudstack.svg')
