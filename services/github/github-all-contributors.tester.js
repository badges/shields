import { createServiceTester } from '../tester.js'
import { isMetric } from '../test-validators.js'
export const t = await createServiceTester()

t.create('all-contributors repo')
  .get('/all-contributors/all-contributors.json')
  .expectBadge({
    label: 'all contributors',
    message: isMetric,
  })

t.create('shields repo (not found)').get('/badges/shields.json').expectBadge({
  label: 'all contributors',
  message: 'repo not found, branch not found, or .all-contributorsrc missing',
})
