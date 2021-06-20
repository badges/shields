import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Followers - default domain')
  .get('/26471.json')
  .expectBadge({
    label: 'follow @wilkie',
    message: isMetric,
    link: [
      'https://mastodon.social/users/wilkie/remote_follow',
      'https://mastodon.social/users/wilkie/followers',
    ],
  })

t.create('Followers - default domain - invalid user ID format (not a number)')
  .get('/a.json')
  .expectBadge({
    label: 'social',
    message: 'invalid user id format',
  })

t.create('Followers - default domain - invalid user ID (id not in use)')
  .get('/0.json')
  .expectBadge({
    label: 'social',
    message: 'not found',
  })

t.create('Followers - alternate domain')
  .get('/2214.json?domain=https%3A%2F%2Fmastodon.xyz')
  .expectBadge({
    label: 'follow @PhotonQyv',
    message: isMetric,
    link: [
      'https://mastodon.xyz/users/PhotonQyv/remote_follow',
      'https://mastodon.xyz/users/PhotonQyv/followers',
    ],
  })
