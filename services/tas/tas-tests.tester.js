import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'tas',
  title: 'TasBuildStatus',
  pathPrefix: '/tas/tests',
})

t.create('Test status')
  .get('/github/tasdemo/axios.json')
  .expectBadge({ label: 'tests', message: 'no longer available' })
