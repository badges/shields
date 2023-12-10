import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Essentials').get('/Essentials.json').expectBadge({
  label: 'downloads',
  message: isMetric,
})

t.create('Invalid Resource').get('/1.json').expectBadge({
  label: 'downloads',
  message: 'not found',
})
