import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'LgtmRedirect',
  title: 'LgtmRedirect',
  pathPrefix: '/lgtm',
})

t.create('alerts')
  .get('/alerts/g/badges/shields.json')
  .expectBadge({ label: 'lgtm alerts', message: 'no longer available' })

t.create('grade')
  .get('/grade/java/g/apache/cloudstack.json')
  .expectBadge({ label: 'lgtm grade', message: 'no longer available' })
