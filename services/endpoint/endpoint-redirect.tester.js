import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'EndpointRedirect',
  title: 'EndpointRedirect',
  pathPrefix: '/badge/endpoint',
})

t.create('Build: default branch')
  .get('.json?url=https://example.com/badge.json')
  .expectBadge({
    label: 'endpoint',
    message: 'https://github.com/badges/shields/pull/11583',
  })
