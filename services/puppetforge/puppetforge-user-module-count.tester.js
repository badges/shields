import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('modules by user').get('/camptocamp.json').expectBadge({
  label: 'modules',
  message: isMetric,
})

t.create('modules by user').get('/not-a-real-user.json').expectBadge({
  label: 'modules',
  message: 'not found',
})
