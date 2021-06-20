import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Servers').get('/1.json').expectBadge({
  label: 'servers',
  message: isMetric,
})
