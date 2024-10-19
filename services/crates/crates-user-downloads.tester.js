import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('total user downloads')
  .get('/udt/3027.json')
  .expectBadge({ label: 'downloads', message: isMetric })

// non-existent user returns 0 downloads with 200 OK status code rather than 404.
t.create('total user downloads (user not found)')
  .get('/udt/2147483647.json') // 2147483647 is the maximum valid user id as API uses i32
  .expectBadge({ label: 'downloads', message: '0' })

t.create('total user downloads (invalid)')
  .get('/udt/999999999999999999999999.json')
  .expectBadge({ label: 'crates.io', message: 'invalid' })
