import { ServiceTester } from '../tester.js'
export const t = new ServiceTester({
  id: 'hackagedeps',
  title: 'Hackage Dependencies',
  pathPrefix: '/hackage-deps/v',
})

t.create('hackage deps (deprecated)')
  .get('/package.json')
  .expectBadge({ label: 'hackagedeps', message: 'no longer available' })
