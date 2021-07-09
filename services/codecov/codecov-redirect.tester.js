import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'CodecovTokenRedirect',
  title: 'CodecovTokenRedirect',
  pathPrefix: '/codecov',
})

t.create('codecov token')
  .get('/c/token/abc123def456/gh/codecov/private-example.svg')
  .expectRedirect(
    '/codecov/c/github/codecov/private-example.svg?token=abc123def456'
  )

t.create('codecov branch token')
  .get('/c/token/abc123def456/bb/private-shields/private-badges/master.svg')
  .expectRedirect(
    '/codecov/c/bitbucket/private-shields/private-badges/master.svg?token=abc123def456'
  )

t.create('codecov gl short form expanded to long form')
  .get('/c/token/abc123def456/gl/private-shields/private-badges/master.svg')
  .expectRedirect(
    '/codecov/c/gitlab/private-shields/private-badges/master.svg?token=abc123def456'
  )
