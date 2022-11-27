import { ServiceTester } from '../tester.js'
export const t = new ServiceTester({
  id: 'wercker',
  title: 'Wercker',
  pathPrefix: '/wercker',
})

t.create('Build status (deprecated)')
  .get('/build/wercker/go-wercker-api.json')
  .expectBadge({ label: 'wercker', message: 'no longer available' })

t.create('CI status (deprecated)')
  .get('/ci/559e33c8e982fc615500b357.json')
  .expectBadge({ label: 'wercker', message: 'no longer available' })
