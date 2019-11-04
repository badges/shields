'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'SwaggerUrlRedirect',
  title: 'SwaggerUrlRedirect',
  pathPrefix: '/swagger/valid/2.0',
}))

t.create('swagger json')
  .get('/https/example.com/example.json', {
    followRedirect: false,
  })
  .expectStatus(301)
  .expectHeader(
    'Location',
    `/swagger/valid/3.0.json?specUrl=${encodeURIComponent(
      'https://example.com/example.json'
    )}`
  )

t.create('swagger yml')
  .get('/https/example.com/example.yml', {
    followRedirect: false,
  })
  .expectStatus(301)
  .expectHeader(
    'Location',
    `/swagger/valid/3.0.svg?specUrl=${encodeURIComponent(
      'https://example.com/example.yml'
    )}`
  )

t.create('swagger yaml')
  .get('/https/example.com/example.yaml', {
    followRedirect: false,
  })
  .expectStatus(301)
  .expectHeader(
    'Location',
    `/swagger/valid/3.0.svg?specUrl=${encodeURIComponent(
      'https://example.com/example.yaml'
    )}`
  )
