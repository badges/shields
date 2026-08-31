import { createServiceTester } from '../tester.js'
import { isBuildStatus } from '../build-status.js'
export const t = await createServiceTester()

t.create('check suites - for branch')
  .get('/badges/shields/master.json')
  .expectBadge({
    label: 'checks',
    message: isBuildStatus,
  })

t.create('check suites - no tests')
  .get('/badges/shields/5d4ab86b1b5ddfb3c4a70a70bd19932c52603b8c.json')
  .expectBadge({
    label: 'checks',
    message: 'no check suites',
  })

t.create('check suites - nonexistent ref')
  .get('/badges/shields/this-ref-does-not-exist.json')
  .expectBadge({
    label: 'checks',
    message: 'ref or repo not found',
  })
