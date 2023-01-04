import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'lgtmAlerts',
  title: 'LgtmAlerts',
  pathPrefix: '/lgtm/alerts',
})

t.create('Lgtm')
  .get('/github/apache/cloudstack.json')
  .expectBadge({ label: 'lgtm alerts', message: 'no longer available' })
