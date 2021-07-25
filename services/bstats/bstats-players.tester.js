import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Players').get('/1.json').expectBadge({
  label: 'players',
  message: isMetric,
})
