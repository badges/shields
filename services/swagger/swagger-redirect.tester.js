import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'SwaggerUrlRedirect',
  title: 'SwaggerUrlRedirect',
  pathPrefix: '/swagger/valid/2.0',
})

t.create('swagger json')
  .get('/https/example.com/example.svg')
  .expectRedirect(
    `/swagger/valid/3.0.svg?specUrl=${encodeURIComponent(
      'https://example.com/example.json'
    )}`
  )

t.create('swagger yml')
  .get('/https/example.com/example.yml')
  .expectRedirect(
    `/swagger/valid/3.0.svg?specUrl=${encodeURIComponent(
      'https://example.com/example.yml'
    )}`
  )

t.create('swagger yaml')
  .get('/https/example.com/example.yaml')
  .expectRedirect(
    `/swagger/valid/3.0.svg?specUrl=${encodeURIComponent(
      'https://example.com/example.yaml'
    )}`
  )
