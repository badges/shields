import { withRegex } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('pull request additions')
  .get('/additions/badges/shields/12083.json')
  .expectBadge({
    label: 'additions',
    message: withRegex(/^\+\d+(\.\d)?[kMGTPEZY]?$/),
  })

t.create('pull request deletions')
  .get('/deletions/badges/shields/12083.json')
  .expectBadge({
    label: 'deletions',
    message: withRegex(/^-\d+(\.\d)?[kMGTPEZY]?$/),
  })

t.create('pull request additions (pull request not found)')
  .get('/additions/badges/shields/5101.json')
  .expectBadge({
    label: 'additions',
    message: 'pull request or repo not found',
  })
