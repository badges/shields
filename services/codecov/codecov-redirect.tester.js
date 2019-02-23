'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'codecov',
  title: 'Codecov',
}))

t.create('codecov token')
  .get('/c/token/abc123def456/gh/codecov/private-example.svg', {
    followRedirect: false,
  })
  .expectStatus(301)
// .expectHeader(
//   'Location',
//   '/codecov/c/gh/codecov/private-example.svg?token=abc123def456'
// )
