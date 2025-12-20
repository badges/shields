import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'SwaggerUrlRedirect',
  title: 'SwaggerUrlRedirect',
  pathPrefix: '/swagger/valid/2.0',
})

t.create('swagger json').get('/https/example.com/example.json').expectBadge({
  label: 'swagger',
  message: 'https://github.com/badges/shields/pull/11583',
})

t.create('swagger yml').get('/https/example.com/example.json').expectBadge({
  label: 'swagger',
  message: 'https://github.com/badges/shields/pull/11583',
})

t.create('swagger yaml').get('/https/example.com/example.json').expectBadge({
  label: 'swagger',
  message: 'https://github.com/badges/shields/pull/11583',
})
