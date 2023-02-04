import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('player followers').get('/alexandresanlim.json').expectBadge({
  label: 'followers',
  message: isMetric,
  color: 'blue',
})

t.create('player not found').get('/not-a-valid-user.json').expectBadge({
  label: 'followers',
  message: 'player not found',
  color: 'red',
})
