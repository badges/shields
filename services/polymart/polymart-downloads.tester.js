import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Polymart Plugin (id 323)').get('/323.json').expectBadge({
  label: 'downloads',
  message: isMetric,
})

t.create('Invalid Resource (id 1)').get('/1.json').expectBadge({
  label: 'downloads',
  message: 'not found',
})
