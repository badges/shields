'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'EndpointRedirect',
  title: 'EndpointRedirect',
  pathPrefix: '/badge/endpoint',
}))

t.create('Build: default branch')
  .get('.svg?url=https://example.com/badge.json', {
    followRedirect: false,
  })
  .expectStatus(301)
  .expectHeader('Location', '/endpoint.svg?url=https://example.com/badge.json')
