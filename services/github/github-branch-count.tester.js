import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('branch count').get('/badges/shields.json').expectBadge({
  label: 'branches',
  message: isMetric,
  color: 'blue',
})

t.create('repo not found')
  .get('/badges/shields-nonexistent-repo-xyz.json')
  .expectBadge({
    label: 'branches',
    message: 'repo not found',
  })
