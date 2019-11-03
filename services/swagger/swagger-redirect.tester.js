'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'SwaggerUrlRedirect',
  title: 'SwaggerUrlRedirect',
  pathPrefix: '/swagger/valid/2.0',
}))

t.create('swagger')
  .get('/https/example.com/example.json', {
    followRedirect: false,
  })
  .expectStatus(301)
  .expectHeader(
    'Location',
    `/swagger/valid/3.0/spec?url=${encodeURIComponent(
      'https://example.com/example.json'
    )}`
  )
