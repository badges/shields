import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'BlueskyFollowers',
  title: 'Bluesky Followers',
  pathPrefix: '/bluesky/follow',
})

t.create('followers count')
  .get('/bsky.app.json')
  .expectBadge({
    label: 'follow on bluesky',
    message: /^\d+\s+followers$/,
    color: 'blue',
  })

t.create('invalid handle')
  .get('/thisisnotarealhandle99999.json')
  .expectBadge({ label: 'follow on bluesky', message: 'invalid handle' })
