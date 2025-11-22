import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'nostrband',
  title: 'Nostr.band',
})

t.create('followers')
  .get(
    '/followers/npub18c556t7n8xa3df2q82rwxejfglw5przds7sqvefylzjh8tjne28qld0we7.json',
  )
  .expectBadge({
    label: 'nostrband',
    message: 'no longer available',
  })
