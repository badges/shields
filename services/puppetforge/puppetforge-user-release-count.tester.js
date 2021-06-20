import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('releases by user').get('/camptocamp.json').expectBadge({
  label: 'releases',
  message: isMetric,
})

t.create('releases by user').get('/not-a-real-user.json').expectBadge({
  label: 'releases',
  message: 'not found',
})
