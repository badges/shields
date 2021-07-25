import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'EndpointRedirect',
  title: 'EndpointRedirect',
  pathPrefix: '/badge/endpoint',
})

t.create('Build: default branch')
  .get('.svg?url=https://example.com/badge.json')
  .expectRedirect('/endpoint.svg?url=https://example.com/badge.json')
