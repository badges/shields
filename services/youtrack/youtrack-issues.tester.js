import { createServiceTester } from '../tester.js'
import { isMetric } from '../test-validators.js'

export const t = await createServiceTester()

t.create('Issues (RIDER)').get('/RIDER?query=#Unresolved').expectBadge({
  label: 'issues',
  message: isMetric,
})
