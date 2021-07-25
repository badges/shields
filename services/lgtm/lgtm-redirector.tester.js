import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'LgtmRedirect',
  title: 'LgtmRedirect',
  pathPrefix: '/lgtm',
})

t.create('alerts')
  .get('/alerts/g/badges/shields.svg')
  .expectRedirect('/lgtm/alerts/github/badges/shields.svg')

t.create('grade')
  .get('/grade/java/g/apache/cloudstack.svg')
  .expectRedirect('/lgtm/grade/java/github/apache/cloudstack.svg')
