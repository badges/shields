import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'lgtmGrade',
  title: 'LgtmGrade',
  pathPrefix: '/lgtm/grade',
})

t.create('Lgtm')
  .get('/github/apache/cloudstack.json')
  .expectBadge({ label: 'lgtm grade', message: 'no longer available' })
