'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'TwitterUrlRedirect',
  title: 'TwitterUrlRedirect',
  pathPrefix: '/twitter/url',
}))

t.create('twitter')
  .get('/https/shields.io.svg', {
    followRedirect: false,
  })
  .expectStatus(301)
  .expectHeader(
    'Location',
    `/twitter/url.svg?url=${encodeURIComponent('https://shields.io')}`
  )
