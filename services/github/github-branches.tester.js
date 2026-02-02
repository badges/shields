import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('Branches').get('/badges/shields.json').expectBadge({
  label: 'branches',
  message: isMetric,
  color: 'blue',
})

t.create('Branches (repo not found)').get('/badges/helmets.json').expectBadge({
  label: 'branches',
  message: 'repo not found',
})
