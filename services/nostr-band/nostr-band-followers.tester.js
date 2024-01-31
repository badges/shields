import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('fetch: valid npub')
  .get('/npub18c556t7n8xa3df2q82rwxejfglw5przds7sqvefylzjh8tjne28qld0we7.json')
  .expectBadge({
    label: 'followers',
    message: isMetric,
  })

t.create('fetch: invalid npub').get('/invalidnpub.json').expectBadge({
  label: 'followers',
  message: 'invalid pubkey',
})
