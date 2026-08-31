import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'codeship',
  title: 'Codeship',
})

t.create('codeship (retired badge)')
  .get('/30419df0-80ff-0135-f7fb-06994b6b032d.json')
  .expectBadge({ label: 'codeship', message: 'retired badge' })
