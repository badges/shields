'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'CodecovTokenRedirect',
  title: 'CodecovTokenRedirect',
  pathPrefix: '/codecov',
}))

t.create('codecov token')
  .get('/c/token/abc123def456/gh/codecov/private-example.svg', {
    followRedirect: false,
  })
  .expectStatus(301)
  .expectHeader(
    'Location',
    '/codecov/c/gh/codecov/private-example.svg?token=abc123def456'
  )

t.create('codecov branch token')
  .get('/c/token/abc123def456/gh/private-shields/private-badges/master.svg', {
    followRedirect: false,
  })
  .expectStatus(301)
  .expectHeader(
    'Location',
    '/codecov/c/gh/private-shields/private-badges/master.svg?token=abc123def456'
  )
