import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'criterion',
  title: 'Criterion',
  pathPrefix: '/criterion',
})

t.create('Criterion')
  .get('/chmoder/credit_card.json')
  .expectBadge({ label: 'criterion', message: 'no longer available' })
