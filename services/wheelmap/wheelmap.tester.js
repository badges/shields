import { ServiceTester } from '../tester.js'
export const t = new ServiceTester({
  id: 'Wheelmap',
  title: 'Wheelmap',
  pathPrefix: '/wheelmap/a',
})

t.create('wheelmap (deprecated)')
  .get('/26699541.json')
  .expectBadge({ label: 'wheelmap', message: 'no longer available' })
