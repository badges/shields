import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Essentials').get('/Essentials.json').expectBadge({
  label: 'watchers',
  message: isMetric,
})

t.create('Invalid Resource').get('/1.json').expectBadge({
  label: 'watchers',
  message: 'not found',
})
